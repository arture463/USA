"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { GymSessionRecord, MuscleStats, WorkoutType } from "@/lib/gym-data";

const STORAGE_KEY = "us-together:gym-sessions";

const DEFAULT_STATS: MuscleStats = {
  pushLevel: 0,
  pullLevel: 0,
  legsLevel: 0,
  cardioLevel: 0,
  totalSessions: 0,
};

export function useGym() {
  const [sessions, setSessions] = useState<GymSessionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Charger les séances depuis Supabase ou LocalStorage
  const fetchSessions = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("gym_sessions")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setSessions(data as GymSessionRecord[]);
        try {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch {}
      } else {
        // Fallback local
        const local = window.localStorage.getItem(STORAGE_KEY);
        if (local) setSessions(JSON.parse(local));
      }
    } catch {
      const local = window.localStorage.getItem(STORAGE_KEY);
      if (local) setSessions(JSON.parse(local));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchSessions();

    // Inscription Realtime aux séances de musculation
    const channel = supabase
      .channel("realtime:gym_sessions")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "gym_sessions" },
        (payload) => {
          setSessions((prev) => [payload.new as GymSessionRecord, ...prev]);
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [fetchSessions]);

  // Ajouter une nouvelle séance de muscu
  const logWorkout = useCallback(
    async (who: "paris" | "raleigh", type: WorkoutType, notes?: string) => {
      const newRecord: Omit<GymSessionRecord, "id"> = {
        who,
        type,
        notes,
        created_at: new Date().toISOString(),
      };

      try {
        const { data, error } = await supabase
          .from("gym_sessions")
          .insert(newRecord)
          .select()
          .single();

        if (!error && data) {
          setSessions((prev) => [data as GymSessionRecord, ...prev]);
        } else {
          // Fallback local instantané
          const localRecord: GymSessionRecord = {
            ...newRecord,
            id: `gym-${Date.now()}`,
          };
          setSessions((prev) => {
            const next = [localRecord, ...prev];
            try {
              window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
            } catch {}
            return next;
          });
        }
      } catch {
        const localRecord: GymSessionRecord = {
          ...newRecord,
          id: `gym-${Date.now()}`,
        };
        setSessions((prev) => {
          const next = [localRecord, ...prev];
          try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
          } catch {}
          return next;
        });
      }
    },
    []
  );

  // Calculer les statistiques de muscu d'Arthur et Clara
  const computeStats = (who: "paris" | "raleigh"): MuscleStats => {
    const userSessions = sessions.filter((s) => s.who === who);
    const stats: MuscleStats = { ...DEFAULT_STATS, totalSessions: userSessions.length };

    userSessions.forEach((s) => {
      if (s.type === "push") stats.pushLevel += 0.5;
      if (s.type === "pull") stats.pullLevel += 0.5;
      if (s.type === "legs") stats.legsLevel += 0.5;
      if (s.type === "cardio") stats.cardioLevel += 0.5;
    });

    return stats;
  };

  const arthurStats = computeStats("paris");
  const claraStats = computeStats("raleigh");

  return {
    sessions,
    loading,
    logWorkout,
    arthurStats,
    claraStats,
  };
}
