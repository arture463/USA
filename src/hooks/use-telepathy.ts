"use client";

import { useCallback, useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { supabase } from "@/lib/supabase/client";
import { usePetFeeder } from "@/hooks/use-pet";
import { FOOD } from "@/lib/pet-data";
import { sendAppNotification } from "@/lib/notifications";
import { playTelepathyRevealSound } from "@/lib/sound-fx";
import {
  getDailyTelepathyQuestion,
  calculateTelepathyScore,
  type TelepathyQuestion,
  type TelepathyScore,
} from "@/lib/telepathy-data";
import type { Identity } from "@/types";

export interface TelepathyAnswerItem {
  id: string;
  author: Identity;
  date: string; // YYYY-MM-DD
  answer: string;
  created_at: string;
}

export interface DailyTelepathyPair {
  date: string;
  question: TelepathyQuestion;
  paris?: TelepathyAnswerItem;
  raleigh?: TelepathyAnswerItem;
  bothAnswered: boolean;
  score?: TelepathyScore;
}

const TABLE = "journal_entries";
const PREFIX = "TELEPATHY:";
const STORAGE_KEY = "us-together:telepathy-cache";

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function useTelepathy(identity: Identity | null) {
  const [items, setItems] = useState<TelepathyAnswerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const feedPet = usePetFeeder(identity);
  const todayStr = getTodayDateString();
  const todayQuestion = getDailyTelepathyQuestion(todayStr);

  const parseEntry = (row: {
    id: string;
    author: Identity;
    kind: string;
    body: string | null;
    created_at: string;
  }): TelepathyAnswerItem | null => {
    if (!row.body || !row.body.startsWith(PREFIX)) return null;
    try {
      const payload = JSON.parse(row.body.replace(PREFIX, ""));
      return {
        id: row.id,
        author: row.author,
        date: payload.date || row.created_at.slice(0, 10),
        answer: payload.answer || "",
        created_at: row.created_at,
      };
    } catch {
      return null;
    }
  };

  const fetchAnswers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from(TABLE)
        .select("*")
        .eq("kind", "text")
        .like("body", `${PREFIX}%`)
        .order("created_at", { ascending: false })
        .limit(100);

      if (!error && data) {
        const parsed: TelepathyAnswerItem[] = [];
        for (const row of data) {
          const item = parseEntry(row);
          if (item) parsed.push(item);
        }
        setItems(parsed);
        try {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
        } catch {}
      } else {
        const local = window.localStorage.getItem(STORAGE_KEY);
        if (local) setItems(JSON.parse(local));
      }
    } catch {
      const local = window.localStorage.getItem(STORAGE_KEY);
      if (local) setItems(JSON.parse(local));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchAnswers();

    // Écoute Realtime des réponses de télépathie
    const channel = supabase
      .channel("realtime:telepathy_answers")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: TABLE },
        (payload) => {
          const row = payload.new as {
            id: string;
            author: Identity;
            kind: string;
            body: string | null;
            created_at: string;
          };

          const item = parseEntry(row);
          if (!item) return;

          setItems((prev) => {
            if (prev.some((e) => e.id === item.id)) return prev;
            const next = [item, ...prev];
            try {
              window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
            } catch {}
            return next;
          });

          // Notification quand le partenaire valide sa réponse
          if (identity && item.author !== identity) {
            const partner = item.author === "paris" ? "Arthur 🇫🇷" : "Clara 🇺🇸";
            playTelepathyRevealSound();
            void sendAppNotification(`🔮 ${partner} a scellé sa réponse Télépathie !`, {
              body: "Scelle la tienne pour débloquer la sienne et calculer votre synchronicité ⚡",
            });
            void confetti({
              particleCount: 90,
              spread: 75,
              origin: { y: 0.6 },
            });
          }
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [fetchAnswers, identity]);

  const submitAnswer = useCallback(
    async (answerText: string) => {
      if (!identity || !answerText.trim()) return;
      setSubmitting(true);

      try {
        const payloadBody = `${PREFIX}${JSON.stringify({
          date: todayStr,
          answer: answerText.trim(),
          author: identity,
        })}`;

        const { data, error } = await supabase
          .from(TABLE)
          .insert({
            author: identity,
            kind: "text",
            body: payloadBody,
          })
          .select()
          .single();

        if (!error && data) {
          const newItem = parseEntry(data);
          if (newItem) {
            setItems((prev) => {
              const filtered = prev.filter((i) => !(i.author === identity && i.date === todayStr));
              const next = [newItem, ...filtered];
              try {
                window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
              } catch {}
              return next;
            });
          }
        }

        playTelepathyRevealSound();
        void confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.5 },
        });
        void feedPet(FOOD.letter, `telepathy:${todayStr}:${identity}`, "letter");
      } catch (err) {
        console.error("Erreur lors de l'enregistrement Télépathie :", err);
        throw err;
      } finally {
        setSubmitting(false);
      }
    },
    [identity, todayStr, feedPet]
  );

  // Groupement des réponses par date
  const groupedByDate: Record<string, DailyTelepathyPair> = {};

  groupedByDate[todayStr] = {
    date: todayStr,
    question: todayQuestion,
    bothAnswered: false,
  };

  items.forEach((item) => {
    if (!groupedByDate[item.date]) {
      groupedByDate[item.date] = {
        date: item.date,
        question: getDailyTelepathyQuestion(item.date),
        bothAnswered: false,
      };
    }
    if (item.author === "paris") {
      groupedByDate[item.date].paris = item;
    } else if (item.author === "raleigh") {
      groupedByDate[item.date].raleigh = item;
    }

    const p = groupedByDate[item.date].paris;
    const r = groupedByDate[item.date].raleigh;
    groupedByDate[item.date].bothAnswered = Boolean(p && r);
    if (p && r) {
      groupedByDate[item.date].score = calculateTelepathyScore(p.answer, r.answer, item.date);
    }
  });

  const todayPair = groupedByDate[todayStr];
  const myTodayAnswer = identity === "paris" ? todayPair?.paris : todayPair?.raleigh;
  const partnerTodayAnswer = identity === "paris" ? todayPair?.raleigh : todayPair?.paris;
  const hasAnsweredToday = Boolean(myTodayAnswer);
  const partnerHasAnsweredToday = Boolean(partnerTodayAnswer);

  const historyDays = Object.values(groupedByDate)
    .filter((d) => d.date !== todayStr && (d.paris || d.raleigh))
    .sort((a, b) => b.date.localeCompare(a.date));

  return {
    todayQuestion,
    todayPair,
    myTodayAnswer,
    partnerTodayAnswer,
    hasAnsweredToday,
    partnerHasAnsweredToday,
    historyDays,
    loading,
    submitting,
    submitAnswer,
  };
}
