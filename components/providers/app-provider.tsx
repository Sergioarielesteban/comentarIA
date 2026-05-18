"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { createClient } from "@/lib/supabase/client";
import {
  obtenerAnalisisCacheado,
  obtenerReviews,
  obtenerUserRestaurant,
  rowToPlace,
  type UserRestaurantRow,
} from "@/lib/supabase/queries";
import type { Analysis, Place, Resena } from "@/lib/types";

interface AppContextValue {
  userId: string | null;
  restaurante: UserRestaurantRow | null;
  place: Place | null;
  reviews: Resena[];
  analysis: Analysis | null;
  loading: boolean;
  error: string | null;
  setAnalysis: (analysis: Analysis | null) => void;
  setReviews: (reviews: Resena[]) => void;
  clearLocalState: () => void;
  refresh: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [restaurante, setRestaurante] = useState<UserRestaurantRow | null>(
    null,
  );
  const [place, setPlace] = useState<Place | null>(null);
  const [reviews, setReviewsState] = useState<Resena[]>([]);
  const [analysis, setAnalysisState] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearLocalState = useCallback(() => {
    setUserId(null);
    setRestaurante(null);
    setPlace(null);
    setReviewsState([]);
    setAnalysisState(null);
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUserId(user?.id ?? null);

      if (!user) {
        setRestaurante(null);
        setPlace(null);
        setReviewsState([]);
        setAnalysisState(null);
        return;
      }

      const row = await obtenerUserRestaurant(user.id);
      setRestaurante(row);
      if (!row) {
        setPlace(null);
        setReviewsState([]);
        setAnalysisState(null);
        return;
      }
      setPlace(rowToPlace(row));

      const [reviewsList, cachedAnalysis] = await Promise.all([
        obtenerReviews(row.id),
        obtenerAnalisisCacheado(user.id, row.place_id),
      ]);
      setReviewsState(reviewsList);
      setAnalysisState(cachedAnalysis);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar datos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const id = window.setTimeout(() => {
      void refresh();
    }, 0);
    return () => window.clearTimeout(id);
  }, [refresh]);

  const setAnalysis = useCallback((a: Analysis | null) => {
    setAnalysisState(a);
  }, []);

  const setReviews = useCallback((r: Resena[]) => {
    setReviewsState(r);
  }, []);

  const value = useMemo(
    () => ({
      userId,
      restaurante,
      place,
      reviews,
      analysis,
      loading,
      error,
      setAnalysis,
      setReviews,
      clearLocalState,
      refresh,
    }),
    [
      userId,
      restaurante,
      place,
      reviews,
      analysis,
      loading,
      error,
      setAnalysis,
      setReviews,
      clearLocalState,
      refresh,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
