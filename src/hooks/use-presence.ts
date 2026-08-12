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
export function usePresence(identity: Identity | null) {
  const [onlineKeys, setOnlineKeys] = useState<string[]>([]);

  useEffect(() => {
    if (!identity) return;

    const channel = supabase.channel("presence-room", {
      config: { presence: { key: identity } },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        // presenceState() → { paris: [...], raleigh: [...] }
        setOnlineKeys(Object.keys(channel.presenceState()));
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ online_at: new Date().toISOString() });
        }
      });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [identity]);

  const other: Identity = identity === "paris" ? "raleigh" : "paris";
  return { otherOnline: identity ? onlineKeys.includes(other) : false };
}
