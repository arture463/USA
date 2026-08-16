"use client";

import { useCallback, useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { supabase } from "@/lib/supabase/client";
import { usePetFeeder } from "@/hooks/use-pet";
import { FOOD } from "@/lib/pet-data";
import { sendAppNotification } from "@/lib/notifications";
import { playCameraShutterSound, playBeRealRevealSound } from "@/lib/sound-fx";
import type { Identity } from "@/types";

export interface UsRealItem {
  id: string;
  author: Identity;
  date: string; // YYYY-MM-DD
  media_path: string;
  caption?: string;
  created_at: string;
}

export interface DailyPair {
  date: string;
  formattedDate: string;
  paris?: UsRealItem;
  raleigh?: UsRealItem;
  bothPosted: boolean;
}

const BUCKET = "journal";
const TABLE = "journal_entries";
const PREFIX = "USREAL:";
const STORAGE_KEY = "us-together:us-real-cache";
const TRIGGER_HOUR_PARIS = 20; // 20h00 à Paris 🇫🇷 = 14h00 à Raleigh 🇺🇸
const NOTIF_STORAGE_PREFIX = "us-together:usreal-notif-sent:";

/** Récupère la date locale au format YYYY-MM-DD */
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Formate une date YYYY-MM-DD en français convivial (ex: « Lundi 17 août ») */
export function formatUsRealDate(dateStr: string): string {
  try {
    const [y, m, d] = dateStr.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    return new Intl.DateTimeFormat("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    }).format(date);
  } catch {
    return dateStr;
  }
}

/** URL publique pour une photo stockée dans Supabase */
export function usRealMediaUrl(path: string | null): string | null {
  if (!path) return null;
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

/** Calcule l'heure actuelle à Paris et le temps restant avant le déclenchement de 20h00 */
export function getParisAlertSchedule() {
  try {
    const now = new Date();
    // Convertir l'heure actuelle en heure de Paris
    const parisTimeStr = now.toLocaleTimeString("en-GB", {
      timeZone: "Europe/Paris",
      hour12: false,
    });
    const [h, m, s] = parisTimeStr.split(":").map(Number);
    const currentParisMinutes = h * 60 + m;
    const targetParisMinutes = TRIGGER_HOUR_PARIS * 60; // 20 * 60 = 1200

    const isAlertActive = currentParisMinutes >= targetParisMinutes;

    let diffMinutes = targetParisMinutes - currentParisMinutes;
    if (diffMinutes < 0) {
      // Temps avant le déclenchement de demain
      diffMinutes += 24 * 60;
    }

    const hoursLeft = Math.floor(diffMinutes / 60);
    const minutesLeft = diffMinutes % 60;

    const formattedCountdown = `${hoursLeft}h ${String(minutesLeft).padStart(2, "0")}m`;

    return {
      currentParisHour: h,
      currentParisMinutes: m,
      isAlertActive,
      formattedCountdown,
      triggerLabel: `${TRIGGER_HOUR_PARIS}:00 (Paris) / ${TRIGGER_HOUR_PARIS - 6}:00 (Raleigh)`,
    };
  } catch {
    return {
      currentParisHour: 20,
      currentParisMinutes: 0,
      isAlertActive: true,
      formattedCountdown: "0h 00m",
      triggerLabel: "20:00 (Paris) / 14:00 (Raleigh)",
    };
  }
}

export function useUsReal(identity: Identity | null) {
  const [items, setItems] = useState<UsRealItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [schedule, setSchedule] = useState(getParisAlertSchedule());
  const [alertTestSent, setAlertTestSent] = useState(false);

  const feedPet = usePetFeeder(identity);
  const todayStr = getTodayDateString();

  // Mettre à jour le compte à rebours chaque minute
  useEffect(() => {
    setSchedule(getParisAlertSchedule());
    const interval = setInterval(() => {
      setSchedule(getParisAlertSchedule());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Parser les entrées journal_entries formatées en USREAL
  const parseEntry = (row: {
    id: string;
    author: Identity;
    kind: string;
    body: string | null;
    media_path: string | null;
    created_at: string;
  }): UsRealItem | null => {
    if (!row.media_path || !row.body || !row.body.startsWith(PREFIX)) return null;
    try {
      const payload = JSON.parse(row.body.replace(PREFIX, ""));
      return {
        id: row.id,
        author: row.author,
        date: payload.date || row.created_at.slice(0, 10),
        media_path: row.media_path,
        caption: payload.caption || "",
        created_at: row.created_at,
      };
    } catch {
      return null;
    }
  };

  // Chargement initial
  const fetchEntries = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from(TABLE)
        .select("*")
        .eq("kind", "photo")
        .like("body", `${PREFIX}%`)
        .order("created_at", { ascending: false })
        .limit(80);

      if (!error && data) {
        const parsed: UsRealItem[] = [];
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
    void fetchEntries();

    // Écoute Realtime des nouveaux US Real
    const channel = supabase
      .channel("realtime:us_real_feed_v2")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: TABLE },
        (payload) => {
          const row = payload.new as {
            id: string;
            author: Identity;
            kind: string;
            body: string | null;
            media_path: string | null;
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

          // Notification et révélation si c'est le partenaire qui vient de poster
          if (identity && item.author !== identity) {
            const partner = item.author === "paris" ? "Arthur 🇫🇷" : "Clara 🇺🇸";
            playBeRealRevealSound();
            void sendAppNotification(`📸 ${partner} vient de poster son US Real !`, {
              body: "Poste ta photo du jour pour découvrir son moment sans filtre 💖",
            });
            void confetti({
              particleCount: 80,
              spread: 70,
              origin: { y: 0.6 },
            });
          }
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [fetchEntries, identity]);

  // Poster sa photo du jour
  const postDailyPhoto = useCallback(
    async (file: Blob, caption?: string) => {
      if (!identity) return;
      setUploading(true);
      playCameraShutterSound();

      try {
        const ext = file.type === "image/png" ? "png" : "jpg";
        const filename = `usreal/${identity}-${todayStr}-${Date.now()}.${ext}`;

        // 1. Upload vers Supabase Storage
        const uploadRes = await supabase.storage.from(BUCKET).upload(filename, file, {
          contentType: file.type || "image/jpeg",
          upsert: true,
        });

        if (uploadRes.error) {
          throw uploadRes.error;
        }

        // 2. Créer l'entrée dans journal_entries
        const payloadBody = `${PREFIX}${JSON.stringify({
          date: todayStr,
          caption: caption?.trim() || "",
          author: identity,
        })}`;

        const { data, error } = await supabase
          .from(TABLE)
          .insert({
            author: identity,
            kind: "photo",
            body: payloadBody,
            media_path: filename,
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

        // 3. Célébration & Nourrir la créature (+3 repas d'amour journal)
        playBeRealRevealSound();
        void confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.5 },
        });
        void feedPet(FOOD.journal, `usreal:${todayStr}:${identity}`, "journal");
      } catch (err) {
        console.error("Erreur lors de la publication de l'US Real :", err);
        throw err;
      } finally {
        setUploading(false);
      }
    },
    [identity, todayStr, feedPet]
  );

  // Groupement des photos par jour
  const groupedByDate: Record<string, DailyPair> = {};

  // Initialiser aujourd'hui
  groupedByDate[todayStr] = {
    date: todayStr,
    formattedDate: "Aujourd'hui",
    bothPosted: false,
  };

  items.forEach((item) => {
    if (!groupedByDate[item.date]) {
      groupedByDate[item.date] = {
        date: item.date,
        formattedDate: formatUsRealDate(item.date),
        bothPosted: false,
      };
    }
    if (item.author === "paris") {
      groupedByDate[item.date].paris = item;
    } else if (item.author === "raleigh") {
      groupedByDate[item.date].raleigh = item;
    }
    groupedByDate[item.date].bothPosted =
      Boolean(groupedByDate[item.date].paris) && Boolean(groupedByDate[item.date].raleigh);
  });

  const todayPair = groupedByDate[todayStr] || {
    date: todayStr,
    formattedDate: "Aujourd'hui",
    bothPosted: false,
  };

  const myTodayPhoto = identity === "paris" ? todayPair.paris : todayPair.raleigh;
  const partnerTodayPhoto = identity === "paris" ? todayPair.raleigh : todayPair.paris;
  const hasPostedToday = Boolean(myTodayPhoto);
  const partnerHasPostedToday = Boolean(partnerTodayPhoto);

  // Alerte automatique à l'heure fixe si pas encore posté
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (schedule.isAlertActive && !hasPostedToday) {
      const notifKey = `${NOTIF_STORAGE_PREFIX}${todayStr}`;
      const alreadySent = window.localStorage.getItem(notifKey);
      if (!alreadySent) {
        window.localStorage.setItem(notifKey, "true");
        playBeRealRevealSound();
        void sendAppNotification("⚠️ 📸 C'est l'heure du US Real !", {
          body: "L'alarme quotidienne a sonné (20h Paris / 14h Raleigh) ! Capture ton moment sans filtre !",
        });
      }
    }
  }, [schedule.isAlertActive, hasPostedToday, todayStr]);

  // Déclencher manuellement une alerte de test
  const triggerTestAlert = useCallback(async () => {
    setAlertTestSent(true);
    playBeRealRevealSound();
    await sendAppNotification("⚠️ 📸 C'est l'heure du US Real !", {
      body: "L'alarme quotidienne a sonné (20h Paris / 14h Raleigh) ! Capture ton instant du jour !",
    });
    setTimeout(() => setAlertTestSent(false), 3000);
  }, []);

  // Historique des jours précédents (trié du plus récent au plus ancien, sans aujourd'hui)
  const historyDays = Object.values(groupedByDate)
    .filter((d) => d.date !== todayStr && (d.paris || d.raleigh))
    .sort((a, b) => b.date.localeCompare(a.date));

  // Calcul du streak (nombre de jours consécutifs avec photos)
  let streak = 0;
  const checkDate = new Date();
  for (let i = 0; i < 60; i++) {
    const curYear = checkDate.getFullYear();
    const curMonth = String(checkDate.getMonth() + 1).padStart(2, "0");
    const curDay = String(checkDate.getDate()).padStart(2, "0");
    const dStr = `${curYear}-${curMonth}-${curDay}`;

    const dayData = groupedByDate[dStr];
    if (dayData && (dayData.paris || dayData.raleigh)) {
      streak += 1;
      checkDate.setDate(checkDate.getDate() - 1);
    } else if (i === 0 && !hasPostedToday && !partnerHasPostedToday) {
      // Si aujourd'hui n'est pas encore posté, regarder si hier était validé
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return {
    items,
    loading,
    uploading,
    schedule,
    alertTestSent,
    todayPair,
    myTodayPhoto,
    partnerTodayPhoto,
    hasPostedToday,
    partnerHasPostedToday,
    historyDays,
    streak,
    postDailyPhoto,
    triggerTestAlert,
  };
}
