"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import confetti from "canvas-confetti";
import { supabase } from "@/lib/supabase/client";
import { usePetFeeder } from "@/hooks/use-pet";
import { FOOD } from "@/lib/pet-data";
import { playCanvasDissolveSound, playCanvasSaveSound } from "@/lib/sound-fx";
import type { Identity } from "@/types";

export interface StrokePoint {
  xRatio: number;
  yRatio: number;
  prevXRatio?: number;
  prevYRatio?: number;
  color: string;
  size: number;
  isEnd?: boolean;
  author: Identity;
  strokeId: string;
}

export interface SavedCanvasArtwork {
  id: string;
  imageData: string;
  title: string;
  author: Identity;
  created_at: string;
}

const TABLE = "journal_entries";
const PREFIX = "CANVAS:";
const STORAGE_KEY = "us-together:canvas-cache";

export function useLiveCanvas(
  identity: Identity | null,
  onRemoteDraw?: (point: StrokePoint) => void,
  onRemoteClear?: () => void
) {
  const [artworks, setArtworks] = useState<SavedCanvasArtwork[]>([]);
  const [partnerDrawing, setPartnerDrawing] = useState(false);
  const [saving, setSaving] = useState(false);

  const feedPet = usePetFeeder(identity);
  const partnerIdentity: Identity = identity === "paris" ? "raleigh" : "paris";
  const partnerName = identity === "paris" ? "Clara 🇺🇸" : "Arthur 🇫🇷";

  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const partnerDrawingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Charger la galerie des dessins passés
  const fetchArtworks = useCallback(async () => {
    try {
      const { data } = await supabase
        .from(TABLE)
        .select("*")
        .eq("kind", "text")
        .like("body", `${PREFIX}%`)
        .order("created_at", { ascending: false })
        .limit(30);

      if (data) {
        const parsed: SavedCanvasArtwork[] = [];
        for (const row of data) {
          try {
            const json = JSON.parse(row.body.replace(PREFIX, ""));
            parsed.push({
              id: row.id,
              imageData: json.imageData || "",
              title: json.title || "Dessin Complice",
              author: row.author,
              created_at: row.created_at,
            });
          } catch {}
        }
        setArtworks(parsed);
        try {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
        } catch {}
      } else {
        const local = window.localStorage.getItem(STORAGE_KEY);
        if (local) setArtworks(JSON.parse(local));
      }
    } catch {
      const local = window.localStorage.getItem(STORAGE_KEY);
      if (local) setArtworks(JSON.parse(local));
    }
  }, []);

  useEffect(() => {
    void fetchArtworks();
  }, [fetchArtworks]);

  // 2. Écoute Realtime Broadcast pour le tracé en direct sub-50ms
  useEffect(() => {
    const channel = supabase.channel("live_canvas:atlantic_stream", {
      config: { broadcast: { self: false } },
    });

    channel
      .on(
        "broadcast",
        { event: "draw_stroke" },
        (payload: { payload: StrokePoint }) => {
          const point = payload.payload;
          if (point.author === partnerIdentity) {
            setPartnerDrawing(true);
            if (partnerDrawingTimeoutRef.current) {
              clearTimeout(partnerDrawingTimeoutRef.current);
            }
            partnerDrawingTimeoutRef.current = setTimeout(() => {
              setPartnerDrawing(false);
            }, 1200);

            if (onRemoteDraw) {
              onRemoteDraw(point);
            }
          }
        }
      )
      .on("broadcast", { event: "clear_canvas" }, () => {
        playCanvasDissolveSound();
        if (onRemoteClear) {
          onRemoteClear();
        }
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      void supabase.removeChannel(channel);
      if (partnerDrawingTimeoutRef.current) {
        clearTimeout(partnerDrawingTimeoutRef.current);
      }
    };
  }, [partnerIdentity, onRemoteDraw, onRemoteClear]);

  // 3. Diffuser un point de tracé
  const broadcastStroke = useCallback(
    (point: StrokePoint) => {
      if (channelRef.current) {
        void channelRef.current.send({
          type: "broadcast",
          event: "draw_stroke",
          payload: point,
        });
      }
    },
    []
  );

  // 4. Diffuser l'effacement
  const broadcastClear = useCallback(() => {
    playCanvasDissolveSound();
    if (channelRef.current) {
      void channelRef.current.send({
        type: "broadcast",
        event: "clear_canvas",
        payload: {},
      });
    }
  }, []);

  // 5. Sauvegarder dans le Carnet de Croquis
  const saveArtwork = useCallback(
    async (imageData: string, title = "Croquis Complice") => {
      if (!identity || !imageData) return;
      setSaving(true);
      try {
        const payloadBody = `${PREFIX}${JSON.stringify({
          imageData,
          title,
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
          const newArt: SavedCanvasArtwork = {
            id: data.id,
            imageData,
            title,
            author: identity,
            created_at: data.created_at,
          };
          setArtworks((prev) => [newArt, ...prev]);
        }

        playCanvasSaveSound();
        void confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });

        const todayStr = new Date().toISOString().slice(0, 10);
        void feedPet(FOOD.journal, `canvas:${todayStr}:${Date.now()}`, "journal");
      } catch (err) {
        console.error("Erreur lors de l'enregistrement du croquis :", err);
      } finally {
        setSaving(false);
      }
    },
    [identity, feedPet]
  );

  return {
    artworks,
    partnerDrawing,
    partnerName,
    saving,
    broadcastStroke,
    broadcastClear,
    saveArtwork,
  };
}
