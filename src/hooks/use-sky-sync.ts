"use client";

import { useEffect, useState, useCallback } from "react";
import { fetchLiveSkyData, calculateMoonPhase, type SkySyncState } from "@/lib/weather";

const STORAGE_KEY = "us-together:sky-sync-cache";

export function useSkySync() {
  const [data, setData] = useState<SkySyncState | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const liveData = await fetchLiveSkyData();
      setData(liveData);
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(liveData));
      } catch {}
    } catch {
      const local = window.localStorage.getItem(STORAGE_KEY);
      if (local) {
        setData(JSON.parse(local));
      }
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    // 1. Charger depuis le cache local immédiatement si disponible
    try {
      const cached = window.localStorage.getItem(STORAGE_KEY);
      if (cached) {
        setData(JSON.parse(cached));
        setLoading(false);
      }
    } catch {}

    // 2. Fetch live data
    void loadData();

    // 3. Rafraîchissement automatique toutes les 15 minutes
    const interval = setInterval(() => {
      void loadData();
    }, 15 * 60 * 1000);

    return () => clearInterval(interval);
  }, [loadData]);

  return {
    data,
    loading,
    refreshing,
    refresh: () => loadData(true),
  };
}
