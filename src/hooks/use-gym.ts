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

export function useGym() {
  const [sessions, setSessions] = useState<GymSessionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [highFiveToast, setHighFiveToast] = useState<string | null>(null);

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

    // Écoute Realtime des séances & des encouragements
    const channel = supabase
      .channel("realtime:gym_sessions")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "gym_sessions" },
        (payload) => {
          const record = payload.new as GymSessionRecord;
          setSessions((prev) => [record, ...prev]);
          void confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
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

  // Loguer une nouvelle séance avec confettis, XP et nourrit la créature !
  const logWorkout = useCallback(
    async (who: Identity, type: WorkoutType, notes?: string) => {
      const newRecord: Omit<GymSessionRecord, "id"> = {
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
          .insert(newRecord)
          .select()
          .single();

        if (!error && data) {
          setSessions((prev) => [data as GymSessionRecord, ...prev]);
        } else {
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
    [feedPetParis, feedPetRaleigh]
  );

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
    sendHighFive,
    highFiveToast,
    arthurStats,
    claraStats,
    badges,
    streak,
  };
}
