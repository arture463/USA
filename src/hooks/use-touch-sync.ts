"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import confetti from "canvas-confetti";
import { supabase } from "@/lib/supabase/client";
import { usePetFeeder } from "@/hooks/use-pet";
import { FOOD } from "@/lib/pet-data";
import {
  playHeartbeatPulse,
  triggerHapticHeartbeat,
  playHugFinishChime,
} from "@/lib/sound-fx";
import type { Identity } from "@/types";

export interface HugRecord {
  id: string;
  durationSeconds: number;
  date: string;
  created_at: string;
}

const TABLE = "journal_entries";
const PREFIX = "HUG:";
const STORAGE_KEY = "us-together:hugs-cache";

export function useTouchSync(identity: Identity | null) {
  const [myTouching, setMyTouching] = useState(false);
  const [partnerTouching, setPartnerTouching] = useState(false);
  const [hugSeconds, setHugSeconds] = useState(0);
  const [totalHugs, setTotalHugs] = useState<HugRecord[]>([]);
  const [lastCompletedHug, setLastCompletedHug] = useState<number | null>(null);

  const feedPet = usePetFeeder(identity);
  const partnerIdentity: Identity = identity === "paris" ? "raleigh" : "paris";
  const partnerName = identity === "paris" ? "Clara 🇺🇸" : "Arthur 🇫🇷";

  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hugDurationRef = useRef(0);

  const isHugActive = myTouching && partnerTouching;

  // 1. Charger l'historique des câlins
  const fetchHugs = useCallback(async () => {
    try {
      const { data } = await supabase
        .from(TABLE)
        .select("*")
        .eq("kind", "text")
        .like("body", `${PREFIX}%`)
        .order("created_at", { ascending: false })
        .limit(60);

      if (data) {
        const parsed: HugRecord[] = [];
        for (const row of data) {
          try {
            const json = JSON.parse(row.body.replace(PREFIX, ""));
            parsed.push({
              id: row.id,
              durationSeconds: json.duration || 10,
              date: json.date || row.created_at.slice(0, 10),
              created_at: row.created_at,
            });
          } catch {}
        }
        setTotalHugs(parsed);
        try {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
        } catch {}
      } else {
        const local = window.localStorage.getItem(STORAGE_KEY);
        if (local) setTotalHugs(JSON.parse(local));
      }
    } catch {
      const local = window.localStorage.getItem(STORAGE_KEY);
      if (local) setTotalHugs(JSON.parse(local));
    }
  }, []);

  useEffect(() => {
    void fetchHugs();
  }, [fetchHugs]);

  // 2. Écoute Realtime Broadcast pour le contact tactile
  useEffect(() => {
    const channel = supabase.channel("touch_sync:atlantic_bridge", {
      config: { broadcast: { self: false } },
    });

    channel
      .on(
        "broadcast",
        { event: "touch_state" },
        (payload: { payload: { who: Identity; isTouching: boolean } }) => {
          if (payload.payload.who === partnerIdentity) {
            setPartnerTouching(payload.payload.isTouching);
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [partnerIdentity]);

  // 3. Boucle Haptique & Cardiaque Synchrone (75 BPM = 800ms)
  useEffect(() => {
    if (isHugActive) {
      hugDurationRef.current = 0;
      setHugSeconds(0);
      setLastCompletedHug(null);

      // Première pulsation immédiate
      playHeartbeatPulse();
      triggerHapticHeartbeat();

      // Boucle à 75 BPM (800ms)
      heartbeatIntervalRef.current = setInterval(() => {
        playHeartbeatPulse();
        triggerHapticHeartbeat();
      }, 800);

      // Chronomètre d'étreinte
      timerIntervalRef.current = setInterval(() => {
        hugDurationRef.current += 1;
        setHugSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }

      // Si un câlin significatif (>= 3 secondes) vient de se terminer
      const finishedDuration = hugDurationRef.current;
      if (finishedDuration >= 3) {
        setLastCompletedHug(finishedDuration);
        playHugFinishChime();
        void confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.5 },
        });

        // Enregistrer dans la base Supabase
        const todayStr = new Date().toISOString().slice(0, 10);
        void supabase.from(TABLE).insert({
          author: identity || "paris",
          kind: "text",
          body: `${PREFIX}${JSON.stringify({
            duration: finishedDuration,
            date: todayStr,
          })}`,
        });

        void feedPet(FOOD.together, `hug:${todayStr}:${finishedDuration}`, "together");

        setTotalHugs((prev) => [
          {
            id: String(Date.now()),
            durationSeconds: finishedDuration,
            date: todayStr,
            created_at: new Date().toISOString(),
          },
          ...prev,
        ]);
      }

      hugDurationRef.current = 0;
      setHugSeconds(0);
    }

    return () => {
      if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isHugActive, identity, feedPet]);

  // 4. Fonctions de contrôle du touché
  const startTouch = useCallback(() => {
    if (!identity) return;
    setMyTouching(true);
    if (channelRef.current) {
      void channelRef.current.send({
        type: "broadcast",
        event: "touch_state",
        payload: { who: identity, isTouching: true },
      });
    }
  }, [identity]);

  const stopTouch = useCallback(() => {
    if (!identity) return;
    setMyTouching(false);
    if (channelRef.current) {
      void channelRef.current.send({
        type: "broadcast",
        event: "touch_state",
        payload: { who: identity, isTouching: false },
      });
    }
  }, [identity]);

  // Calcul du temps total de câlins partagés
  const totalSecondsHugs = totalHugs.reduce((acc, h) => acc + h.durationSeconds, 0);

  return {
    myTouching,
    partnerTouching,
    isHugActive,
    hugSeconds,
    lastCompletedHug,
    partnerName,
    totalHugs,
    totalSecondsHugs,
    startTouch,
    stopTouch,
  };
}
