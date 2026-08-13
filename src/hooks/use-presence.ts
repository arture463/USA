"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { Identity } from "@/types";

/**
 * Présence temps réel (Supabase Presence).
 * Gestionnaire de présence Singleton partagé : Arthur 🇫🇷 et Clara 🇺🇸
 * rejoignent la MÊME chambre ("presence-room") en temps réel.
 */
const LAST_SEEN_KEY = "us-together:last-seen";

function formatLastSeen(iso: string | null): string {
  if (!iso) return "Récemment";
  try {
    const d = new Date(iso);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    const time = d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    return isToday ? `Aujourd'hui à ${time}` : `${d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })} à ${time}`;
  } catch {
    return "Récemment";
  }
}

// État de présence global partagé entre tous les composants de l'application
let globalOnlineKeys: string[] = [];
let globalLastSeenMap: Record<string, string> = {};
const presenceSubscribers = new Set<() => void>();

let activeChannel: ReturnType<typeof supabase.channel> | null = null;
let activeIdentity: Identity | null = null;
let heartbeatInterval: NodeJS.Timeout | null = null;

function notifySubscribers() {
  presenceSubscribers.forEach((cb) => cb());
}

function initGlobalPresence(identity: Identity) {
  if (activeIdentity === identity && activeChannel) return;

  if (activeChannel) {
    try {
      void supabase.removeChannel(activeChannel);
    } catch {}
    activeChannel = null;
  }

  activeIdentity = identity;

  // Canal unique partagé : Arthur 🇫🇷 & Clara 🇺🇸 rejoignent la MÊME pièce !
  const channel = supabase.channel("presence-room", {
    config: { presence: { key: identity } },
  });

  const syncState = () => {
    const state = channel.presenceState();
    globalOnlineKeys = Object.keys(state);

    // Mémoriser l'heure du dernier passage pour Paris et Raleigh
    ["paris", "raleigh"].forEach((key) => {
      const presences = state[key] as unknown as { online_at?: string }[] | undefined;
      if (presences && presences.length > 0 && presences[0]?.online_at) {
        globalLastSeenMap[key] = presences[0].online_at;
        try {
          window.localStorage.setItem(`${LAST_SEEN_KEY}:${key}`, presences[0].online_at);
        } catch {}
      }
    });

    notifySubscribers();
  };

  channel
    .on("presence", { event: "sync" }, syncState)
    .on("presence", { event: "join" }, syncState)
    .on("presence", { event: "leave" }, (payload) => {
      const leftKey = (payload as unknown as { key?: string })?.key;
      if (leftKey) {
        globalOnlineKeys = globalOnlineKeys.filter((k) => k !== leftKey);
        const nowIso = new Date().toISOString();
        globalLastSeenMap[leftKey] = nowIso;
        try {
          window.localStorage.setItem(`${LAST_SEEN_KEY}:${leftKey}`, nowIso);
        } catch {}
      }
      setTimeout(syncState, 100);
      notifySubscribers();
    })
    .subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await channel.track({ online_at: new Date().toISOString() });
      }
    });

  activeChannel = channel;

  if (heartbeatInterval) clearInterval(heartbeatInterval);
  heartbeatInterval = setInterval(async () => {
    try {
      if (activeChannel) {
        await activeChannel.track({ online_at: new Date().toISOString() });
      }
    } catch {}
  }, 15000);
}

export function usePresence(identity: Identity | null) {
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!identity) return;

    // Charger les dates mémorisées localement
    try {
      ["paris", "raleigh"].forEach((k) => {
        const stored = window.localStorage.getItem(`${LAST_SEEN_KEY}:${k}`);
        if (stored) globalLastSeenMap[k] = stored;
      });
    } catch {}

    initGlobalPresence(identity);

    const subscriber = () => setTick((t) => t + 1);
    presenceSubscribers.add(subscriber);

    return () => {
      presenceSubscribers.delete(subscriber);
    };
  }, [identity]);

  const other: Identity = identity === "paris" ? "raleigh" : "paris";
  const otherOnline = identity ? globalOnlineKeys.includes(other) : false;
  const lastSeenIso = globalLastSeenMap[other] || null;

  return {
    otherOnline,
    lastSeenIso,
    lastSeenFormatted: formatLastSeen(lastSeenIso),
  };
}
