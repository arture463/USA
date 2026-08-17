"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { sendAppNotification } from "@/lib/notifications";
import type { Identity } from "@/types";

/**
 * Données & logique du Module 5 — Journal.
 *
 *  - charge les entrées existantes (plus récentes d'abord)
 *  - écoute les nouvelles en temps réel (postgres_changes INSERT)
 *  - `addText`  : poste un message texte
 *  - `addMedia` : upload une photo/voix dans le Storage puis crée l'entrée
 */

export type EntryKind = "text" | "photo" | "voice";

export interface JournalEntry {
  id: string;
  author: Identity;
  kind: EntryKind;
  body: string | null;
  media_path: string | null;
  created_at: string;
}

const BUCKET = "journal";
const TABLE = "journal_entries";

/** URL publique d'un média stocké (photo/voix), ou null. */
export function mediaUrl(path: string | null): string | null {
  if (!path) return null;
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

const isUserJournalPost = (e: JournalEntry) => {
  if (!e.body) return true;
  return (
    !e.body.startsWith("LIST:") &&
    !e.body.startsWith("BUCKET_") &&
    !e.body.startsWith("GACHA:") &&
    !e.body.startsWith("GYM_") &&
    !e.body.startsWith("HIGH_FIVE:") &&
    !e.body.startsWith("USREAL:") &&
    !e.body.startsWith("TELEPATHY:") &&
    !e.body.startsWith("HUG:")
  );
};

export function useJournal(identity: Identity | null) {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // Chargement initial
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from(TABLE)
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (!cancelled) {
        const filtered = ((data as JournalEntry[]) ?? []).filter(isUserJournalPost);
        setEntries(filtered);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Temps réel : nouvelles entrées ajoutées en tête (avec dédoublonnage)
  useEffect(() => {
    const channel = supabase
      .channel("journal-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: TABLE },
        (payload) => {
          const entry = payload.new as JournalEntry;
          if (!isUserJournalPost(entry)) return;
          setEntries((prev) => {
            if (prev.some((e) => e.id === entry.id)) return prev;
            if (identity && entry.author !== identity) {
              const authorName = entry.author === "paris" ? "Arthur 🇫🇷" : "Clara 🇺🇸";
              void sendAppNotification(`💌 Nouveau mot de ${authorName} dans le Journal`, {
                body: entry.body ?? "Un nouveau souvenir a été partagé.",
              });
            }
            return [entry, ...prev];
          });
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [identity]);

  // Poste un message texte
  const addText = useCallback(
    async (body: string) => {
      if (!identity || !body.trim()) return;
      setSending(true);
      try {
        await supabase
          .from(TABLE)
          .insert({ author: identity, kind: "text", body: body.trim() });
      } finally {
        setSending(false);
      }
    },
    [identity]
  );

  // Upload d'un média (photo ou voix) puis création de l'entrée
  const addMedia = useCallback(
    async (file: Blob, kind: "photo" | "voice", body?: string) => {
      if (!identity) return;
      setSending(true);
      try {
        // Extension déduite du type MIME (jpg / png / webm...)
        const ext = file.type.split("/")[1]?.split(";")[0] || "bin";
        const path = `${identity}/${crypto.randomUUID()}.${ext}`;

        const { error: upErr } = await supabase.storage
          .from(BUCKET)
          .upload(path, file, { contentType: file.type });
        if (upErr) throw upErr;

        await supabase.from(TABLE).insert({
          author: identity,
          kind,
          body: body?.trim() || null,
          media_path: path,
        });
      } finally {
        setSending(false);
      }
    },
    [identity]
  );

  return { entries, loading, sending, addText, addMedia };
}
