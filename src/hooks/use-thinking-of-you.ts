"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { Identity, Thought } from "@/types";

/**
 * Cœur du Module 3 — Thinking of You.
 *
 *  - `send()`     : insère une pensée (sender = mon identité)
 *  - temps réel   : écoute les INSERT ; si la pensée vient de L'AUTRE,
 *                   incrémente le compteur et déclenche `onReceive`
 *  - `received`   : nombre de pensées reçues AUJOURD'HUI
 *  - `connected`  : état de la connexion Realtime (pour l'indicateur HUD)
 */

interface UseThinkingOfYou {
  received: number;
  connected: boolean;
  sending: boolean;
  send: () => Promise<void>;
}

export function useThinkingOfYou(
  identity: Identity | null,
  onReceive: (thought: Thought) => void
): UseThinkingOfYou {
  const [received, setReceived] = useState(0);
  const [connected, setConnected] = useState(false);
  const [sending, setSending] = useState(false);

  // Ref : on appelle toujours le dernier `onReceive` sans re-souscrire
  const onReceiveRef = useRef(onReceive);
  useEffect(() => {
    onReceiveRef.current = onReceive;
  }, [onReceive]);

  // Compte des pensées reçues depuis minuit (au montage + changement d'identité)
  useEffect(() => {
    if (!identity) return;
    let cancelled = false;

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    (async () => {
      try {
        const { count } = await supabase
          .from("thoughts")
          .select("*", { count: "exact", head: true })
          .neq("sender", identity)
          .gte("created_at", startOfToday.toISOString());
        if (!cancelled && typeof count === "number") setReceived(count);
      } catch {}
    })();

    return () => {
      cancelled = true;
    };
  }, [identity]);

  // Souscription temps réel aux nouvelles pensées
  useEffect(() => {
    if (!identity) return;

    try {
      const channel = supabase
        .channel(`thoughts-realtime-${identity}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "thoughts" },
          (payload) => {
            try {
              const thought = payload.new as Thought;
              if (thought && thought.sender && thought.sender !== identity) {
                setReceived((c) => c + 1);
                onReceiveRef.current(thought);
              }
            } catch {}
          }
        )
        .subscribe((status) => {
          setConnected(status === "SUBSCRIBED");
        });

      return () => {
        try {
          void supabase.removeChannel(channel);
        } catch {}
      };
    } catch {
      return undefined;
    }
  }, [identity]);

  const send = useCallback(async () => {
    if (!identity) return;
    setSending(true);
    try {
      await supabase.from("thoughts").insert({ sender: identity });
    } catch {} finally {
      setSending(false);
    }
  }, [identity]);

  return { received, connected, sending, send };
}
