"use client";

import { useCallback, useState } from "react";
import {
  analyzeReviews,
  clearAnalysisCache,
  getCachedAnalysis,
} from "@/lib/analysis/analyze-reviews";
import { hashReviews } from "@/lib/analysis/hash-reviews";
import { STORAGE_KEYS } from "@/lib/constants";
import { useApp } from "@/components/providers/app-provider";
import type { Analysis } from "@/lib/types";

export function useAnalysisRunner() {
  const { place, reviews, analysis, setAnalysis, persistAnalysis } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(
    async (force = false) => {
      if (!place || !reviews.length) return null;

      const hash = hashReviews(reviews);
      if (!force) {
        if (analysis) return analysis;
        const cached = getCachedAnalysis();
        const cachedHash = localStorage.getItem(STORAGE_KEYS.analysisHash);
        if (cached && cachedHash === hash) {
          setAnalysis(cached);
          return cached;
        }
      }

      setLoading(true);
      setError(null);
      try {
        if (force) clearAnalysisCache();
        const result = await analyzeReviews(place, reviews, { force });
        setAnalysis(result);
        await persistAnalysis(result, hashReviews(reviews));
        return result;
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Error al analizar";
        setError(msg);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [place, reviews, analysis, setAnalysis, persistAnalysis],
  );

  return { run, loading, error };
}
