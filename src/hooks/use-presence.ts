"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { Identity } from "@/types";

/**
 * Présence temps réel (Supabase Presence).
 * Sait si L'AUTRE personne est connectée au site en ce moment même.
 *
 * Chaque appareil "track" sa présence sous une clé = son identité
 * ('paris' / 'raleigh'). On écoute la synchro pour savoir qui est là.
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

export function usePresence(identity: Identity | null) {
  const [onlineKeys, setOnlineKeys] = useState<string[]>([]);
  const [lastSeenIso, setLastSeenIso] = useState<string | null>(null);

  const other: Identity = identity === "paris" ? "raleigh" : "paris";

  useEffect(() => {
    if (!identity) return;

    // Charger la dernière heure de passage mémorisée
    try {
      const stored = window.localStorage.getItem(`${LAST_SEEN_KEY}:${other}`);
      if (stored) setLastSeenIso(stored);
    } catch {}

    const channel = supabase.channel("presence-room", {
      config: { presence: { key: identity } },
    });

    const updatePresenceState = () => {
      const state = channel.presenceState();
      setOnlineKeys(Object.keys(state));

      // Extraire l'horodatage de présence de l'autre
      const otherPresences = state[other] as unknown as { online_at?: string }[] | undefined;
      if (otherPresences && otherPresences.length > 0) {
        const latestIso = otherPresences[0]?.online_at || new Date().toISOString();
        setLastSeenIso(latestIso);
        try {
          window.localStorage.setItem(`${LAST_SEEN_KEY}:${other}`, latestIso);
        } catch {}
      }
    };

    channel
      .on("presence", { event: "sync" }, updatePresenceState)
      .on("presence", { event: "join" }, updatePresenceState)
      .on("presence", { event: "leave" }, (payload) => {
        const leftKey = (payload as unknown as { key?: string })?.key;
        if (leftKey) {
          setOnlineKeys((prev) => prev.filter((k) => k !== leftKey));
          if (leftKey === other) {
            const nowIso = new Date().toISOString();
            setLastSeenIso(nowIso);
            try {
              window.localStorage.setItem(`${LAST_SEEN_KEY}:${other}`, nowIso);
            } catch {}
          }
        }
        setTimeout(updatePresenceState, 100);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ online_at: new Date().toISOString() });
        }
      });

    const heartbeat = setInterval(async () => {
      try {
        await channel.track({ online_at: new Date().toISOString() });
      } catch {}
    }, 15000);

    const handleBeforeUnload = () => {
      try {
        void channel.untrack();
      } catch {}
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      clearInterval(heartbeat);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      try {
        void channel.untrack();
      } catch {}
      void supabase.removeChannel(channel);
    };
  }, [identity, other]);

  const otherOnline = identity ? onlineKeys.includes(other) : false;

  return {
    otherOnline,
    lastSeenIso,
    lastSeenFormatted: formatLastSeen(lastSeenIso),
  };
}
