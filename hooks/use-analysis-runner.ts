"use client";

import { useCallback, useState } from "react";
import { useApp } from "@/components/providers/app-provider";
import type { Analysis } from "@/lib/types";

interface RunResult {
  analysis: Analysis | null;
  cached?: boolean;
  limitReached?: boolean;
  error?: string;
}

export function useAnalysisRunner() {
  const { setAnalysis } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(
    async (force = false): Promise<RunResult> => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/analysis", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ force }),
        });
        const data = await res.json();

        if (res.status === 429) {
          return { analysis: null, limitReached: true };
        }
        if (!res.ok) {
          const msg = data?.error?.message || "Error al analizar.";
          setError(msg);
          return { analysis: null, error: msg };
        }

        const analysis = (data?.analysis as Analysis | null) ?? null;
        if (analysis) setAnalysis(analysis);
        return { analysis, cached: Boolean(data?.cached) };
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Error al analizar.";
        setError(msg);
        return { analysis: null, error: msg };
      } finally {
        setLoading(false);
      }
    },
    [setAnalysis],
  );

  return { run, loading, error };
}
