"use client";

import { useCallback, useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { supabase } from "@/lib/supabase/client";
import { usePetFeeder } from "@/hooks/use-pet";
import { FOOD } from "@/lib/pet-data";
import {
  GYM_TITLES,
  WORKOUT_INFO,
  getBadges,
  type GymBadge,
  type GymSessionRecord,
  type MuscleStats,
  type WorkoutType,
} from "@/lib/gym-data";
import type { Identity } from "@/types";

const STORAGE_KEY = "us-together:gym-sessions";

/** Déduplique les séances par ID et élimine les doublons créés à quelques secondes d'intervalle */
function deduplicateSessions(list: GymSessionRecord[]): GymSessionRecord[] {
  if (!Array.isArray(list)) return [];
  const seenIds = new Set<string>();
  const result: GymSessionRecord[] = [];

  for (const s of list) {
    if (!s || !s.id) continue;
    if (seenIds.has(s.id)) continue;

    // Détecter si une séance quasi identique existe déjà (même utilisateur, même type, intervalle < 60s)
    const isTimestampDuplicate = result.some((existing) => {
      if (existing.who !== s.who || existing.type !== s.type) return false;
      const t1 = new Date(existing.created_at).getTime();
      const t2 = new Date(s.created_at).getTime();
      return !isNaN(t1) && !isNaN(t2) && Math.abs(t1 - t2) < 60000;
    });

    if (isTimestampDuplicate) continue;

    seenIds.add(s.id);
    result.push(s);
  }
  return result;
}

export function useGym() {
  const [sessions, setSessions] = useState<GymSessionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [highFiveToast, setHighFiveToast] = useState<string | null>(null);

  // Charger les séances depuis Supabase ou LocalStorage avec déduplication
  const fetchSessions = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("gym_sessions")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        const clean = deduplicateSessions(data as GymSessionRecord[]);
        setSessions(clean);
        try {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
        } catch {}
      } else {
        const local = window.localStorage.getItem(STORAGE_KEY);
        if (local) {
          const parsed = deduplicateSessions(JSON.parse(local));
          setSessions(parsed);
        }
      }
    } catch {
      const local = window.localStorage.getItem(STORAGE_KEY);
      if (local) {
        const parsed = deduplicateSessions(JSON.parse(local));
        setSessions(parsed);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchSessions();

    // Écoute Realtime des séances & des suppressions
    const channel = supabase
      .channel("realtime:gym_sessions_v2")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "gym_sessions" },
        (payload) => {
          const record = payload.new as GymSessionRecord;
          if (!record?.id) return;
          setSessions((prev) => {
            if (prev.some((s) => s.id === record.id)) return prev;
            const next = deduplicateSessions([record, ...prev]);
            try {
              window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
            } catch {}
            return next;
          });
          void confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "gym_sessions" },
        (payload) => {
          const oldRecord = payload.old as { id?: string };
          if (!oldRecord?.id) return;
          setSessions((prev) => {
            const next = prev.filter((s) => s.id !== oldRecord.id);
            try {
              window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
            } catch {}
            return next;
          });
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [fetchSessions]);

  const feedPetParis = usePetFeeder("paris");
  const feedPetRaleigh = usePetFeeder("raleigh");

  // Loguer une nouvelle séance avec protection contre les doubles soumissions
  const logWorkout = useCallback(
    async (who: Identity, type: WorkoutType, notes?: string) => {
      const tempId = `gym-${Date.now()}`;
      const newRecord: GymSessionRecord = {
        id: tempId,
        who,
        type,
        notes,
        created_at: new Date().toISOString(),
      };

      // Confettis festifs immédiats
      void confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
      });

      // Nourrir la créature commune (+3 XP)
      const feedFn = who === "paris" ? feedPetParis : feedPetRaleigh;
      void feedFn(3, null, "treat");

      try {
        const { data, error } = await supabase
          .from("gym_sessions")
          .insert({
            who: newRecord.who,
            type: newRecord.type,
            notes: newRecord.notes,
            created_at: newRecord.created_at,
          })
          .select()
          .single();

        if (!error && data) {
          const serverRecord = data as GymSessionRecord;
          setSessions((prev) => {
            const filtered = prev.filter((s) => s.id !== tempId && s.id !== serverRecord.id);
            const next = deduplicateSessions([serverRecord, ...filtered]);
            try {
              window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
            } catch {}
            return next;
          });
        } else {
          setSessions((prev) => {
            const next = deduplicateSessions([newRecord, ...prev]);
            try {
              window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
            } catch {}
            return next;
          });
        }
      } catch {
        setSessions((prev) => {
          const next = deduplicateSessions([newRecord, ...prev]);
          try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
          } catch {}
          return next;
        });
      }
    },
    [feedPetParis, feedPetRaleigh]
  );

  // Supprimer une séance (en cas de doublon ou d'erreur)
  const deleteWorkout = useCallback(async (id: string) => {
    setSessions((prev) => {
      const next = prev.filter((s) => s.id !== id);
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });

    try {
      await supabase.from("gym_sessions").delete().eq("id", id);
    } catch (err) {
      console.error("Erreur lors de la suppression de la séance :", err);
    }
  }, []);

  // Envoyer un Check / High-Five virtuel à l'autre
  const sendHighFive = useCallback((who: Identity) => {
    const sender = who === "paris" ? "Arthur 🇫🇷" : "Clara 🇺🇸";
    const receiver = who === "paris" ? "Clara" : "Arthur";
    setHighFiveToast(`${sender} a envoyé une gourde de motivation & un High-Five à ${receiver} ! 🥤⚡`);

    void confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.7 },
    });

    setTimeout(() => setHighFiveToast(null), 4000);
  }, []);

  // Calcul des statistiques de musculation
  const computeStats = (who: Identity): MuscleStats => {
    const userSessions = sessions.filter((s) => s.who === who);
    let xp = 0;
    let pushLevel = 0;
    let pullLevel = 0;
    let legsLevel = 0;
    let cardioLevel = 0;

    userSessions.forEach((s) => {
      const info = WORKOUT_INFO[s.type];
      xp += info.xp;
      if (s.type === "push") pushLevel += 0.5;
      if (s.type === "pull") pullLevel += 0.5;
      if (s.type === "legs") legsLevel += 0.5;
      if (s.type === "cardio") cardioLevel += 0.5;
    });

    // Titre & Niveau
    let title = GYM_TITLES[0].title;
    let nextLevelXp = GYM_TITLES[1].minXp;

    for (let i = GYM_TITLES.length - 1; i >= 0; i--) {
      if (xp >= GYM_TITLES[i].minXp) {
        title = GYM_TITLES[i].title;
        nextLevelXp = GYM_TITLES[i + 1]?.minXp ?? GYM_TITLES[i].minXp + 500;
        break;
      }
    }

    return {
      pushLevel,
      pullLevel,
      legsLevel,
      cardioLevel,
      totalSessions: userSessions.length,
      xp,
      title,
      nextLevelXp,
    };
  };

  const arthurStats = computeStats("paris");
  const claraStats = computeStats("raleigh");
  const badges = getBadges(arthurStats.totalSessions, claraStats.totalSessions, sessions.length);

  const streak = Math.min(
    7,
    Math.max(1, Math.floor((arthurStats.totalSessions + claraStats.totalSessions) / 2))
  );

  return {
    sessions,
    loading,
    logWorkout,
    deleteWorkout,
    sendHighFive,
    highFiveToast,
    arthurStats,
    claraStats,
    badges,
    streak,
  };
}
