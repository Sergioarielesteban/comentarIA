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
import { STORAGE_KEYS } from "@/lib/constants";
import {
  guardarAnalisis,
  guardarResenasCache,
  guardarRestaurante,
  obtenerAnalisis,
  obtenerResenasCache,
  obtenerRestaurante,
  rowToPlace,
} from "@/lib/supabase/queries";
import type { Analysis, Place, Resena, RestauranteRow } from "@/lib/types";

interface AppContextValue {
  userId: string | null;
  restaurante: RestauranteRow | null;
  place: Place | null;
  reviews: Resena[];
  analysis: Analysis | null;
  loading: boolean;
  error: string | null;
  setPlace: (place: Place) => void;
  setReviews: (reviews: Resena[]) => void;
  setAnalysis: (analysis: Analysis | null) => void;
  syncFromSupabase: () => Promise<boolean>;
  persistRestaurant: (place: Place, reviews: Resena[]) => Promise<void>;
  persistAnalysis: (analysis: Analysis, hash: string) => Promise<void>;
  clearLocalData: () => void;
  refresh: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

function readStorage<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [restaurante, setRestaurante] = useState<RestauranteRow | null>(null);
  const [place, setPlaceState] = useState<Place | null>(null);
  const [reviews, setReviewsState] = useState<Resena[]>([]);
  const [analysis, setAnalysisState] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearLocalData = useCallback(() => {
    Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
    setRestaurante(null);
    setPlaceState(null);
    setReviewsState([]);
    setAnalysisState(null);
  }, []);

  const hydrateFromLocal = useCallback(() => {
    setPlaceState(readStorage<Place>(STORAGE_KEYS.place));
    setReviewsState(readStorage<Resena[]>(STORAGE_KEYS.reviews) || []);
    setAnalysisState(readStorage<Analysis>(STORAGE_KEYS.analysis));
  }, []);

  const syncFromSupabase = useCallback(async () => {
    if (!userId) return false;
    const row = await obtenerRestaurante(userId);
    if (!row) return false;

    setRestaurante(row);
    const p = rowToPlace(row);
    setPlaceState(p);
    localStorage.setItem(STORAGE_KEYS.place, JSON.stringify(p));
    localStorage.setItem(STORAGE_KEYS.onboarded, "1");

    const resenas = await obtenerResenasCache(row.id);
    if (resenas?.data) {
      const list = resenas.data as Resena[];
      setReviewsState(list);
      localStorage.setItem(STORAGE_KEYS.reviews, JSON.stringify(list));
    }

    const analisis = await obtenerAnalisis(row.id);
    if (analisis?.data) {
      const data = analisis.data as Analysis;
      setAnalysisState(data);
      localStorage.setItem(STORAGE_KEYS.analysis, JSON.stringify(data));
      if (analisis.reviews_hash) {
        localStorage.setItem(STORAGE_KEYS.analysisHash, analisis.reviews_hash);
      }
    }

    return true;
  }, [userId]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUserId(user?.id ?? null);
      hydrateFromLocal();
      if (user) {
        await syncFromSupabase();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar datos");
    } finally {
      setLoading(false);
    }
  }, [hydrateFromLocal, syncFromSupabase]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const setPlace = useCallback((p: Place) => {
    setPlaceState(p);
    localStorage.setItem(STORAGE_KEYS.place, JSON.stringify(p));
  }, []);

  const setReviews = useCallback((r: Resena[]) => {
    setReviewsState(r);
    localStorage.setItem(STORAGE_KEYS.reviews, JSON.stringify(r));
  }, []);

  const setAnalysis = useCallback((a: Analysis | null) => {
    setAnalysisState(a);
    if (a) {
      localStorage.setItem(STORAGE_KEYS.analysis, JSON.stringify(a));
    } else {
      localStorage.removeItem(STORAGE_KEYS.analysis);
      localStorage.removeItem(STORAGE_KEYS.analysisHash);
    }
  }, []);

  const persistRestaurant = useCallback(
    async (p: Place, r: Resena[]) => {
      if (!userId) return;
      const row = await guardarRestaurante(userId, p);
      setRestaurante(row);
      await guardarResenasCache(row.id, r);
      setPlace(p);
      setReviews(r);
      localStorage.setItem(STORAGE_KEYS.onboarded, "1");
    },
    [setPlace, setReviews, userId],
  );

  const persistAnalysis = useCallback(
    async (a: Analysis, hash: string) => {
      if (!userId || !restaurante) return;
      await guardarAnalisis(userId, restaurante.id, a, hash);
      setAnalysis(a);
      localStorage.setItem(STORAGE_KEYS.analysisHash, hash);
    },
    [restaurante, setAnalysis, userId],
  );

  const value = useMemo(
    () => ({
      userId,
      restaurante,
      place,
      reviews,
      analysis,
      loading,
      error,
      setPlace,
      setReviews,
      setAnalysis,
      syncFromSupabase,
      persistRestaurant,
      persistAnalysis,
      clearLocalData,
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
      setPlace,
      setReviews,
      setAnalysis,
      syncFromSupabase,
      persistRestaurant,
      persistAnalysis,
      clearLocalData,
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
