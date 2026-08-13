"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { mediaUrl, type JournalEntry } from "@/hooks/use-journal";
import { LOCATIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { PhotoLightbox } from "./photo-lightbox";

/**
 * Rendu d'une entrée du journal selon son type (texte / photo / voix).
 * L'auteur est identifié par un accent de couleur (violet=Paris, cyan=Raleigh).
 */

// Classes LITTÉRALES (le JIT Tailwind ne lit pas les classes concaténées)
const AUTHOR_STYLE = {
  paris: {
    label: "Arthur 🇫🇷",
    emoji: "💜",
    text: "text-neon-violet",
    border: "border-l-neon-violet/60",
    dot: "bg-neon-violet",
  },
  raleigh: {
    label: "Clara 🇺🇸",
    emoji: "💙",
    text: "text-neon-cyan",
    border: "border-l-neon-cyan/60",
    dot: "bg-neon-cyan",
  },
} as const;

/** Date compacte : « 24 juil. · 14:32 ». */
function formatWhen(iso: string): string {
  const d = new Date(iso);
  const date = new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
  }).format(d);
  const time = new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
  return `${date} · ${time}`;
}

interface JournalEntryCardProps {
  entry: JournalEntry;
}

export function JournalEntryCard({ entry }: JournalEntryCardProps) {
  const style = AUTHOR_STYLE[entry.author];
  const url = mediaUrl(entry.media_path);
  const [lightbox, setLightbox] = useState(false);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className={cn("glass rounded-inner border-l-2 p-4", style.border)}
    >
      {/* En-tête : auteur + horodatage */}
      <div className="mb-2 flex items-center justify-between">
        <span className={cn("flex items-center gap-1.5 text-sm font-semibold", style.text)}>
          <span className={cn("dot-glow", style.dot)} />
          {style.emoji} {style.label}
        </span>
        <span className="label-micro">{formatWhen(entry.created_at)}</span>
      </div>

      {/* Contenu selon le type */}
      {entry.kind === "photo" && url && (
        <>
          <button
            type="button"
            onClick={() => setLightbox(true)}
            className="focus-ring group mb-2 block w-full overflow-hidden rounded-inner"
            aria-label="Agrandir la photo"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={entry.body ?? "Photo partagée"}
              loading="lazy"
              className="max-h-96 w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </button>
          <PhotoLightbox
            src={url}
            alt={entry.body ?? "Photo partagée"}
            open={lightbox}
            onClose={() => setLightbox(false)}
          />
        </>
      )}

      {entry.kind === "voice" && url && (
        <audio
          controls
          src={url}
          className="w-full"
          preload="metadata"
        />
      )}

      {entry.body && entry.body.startsWith("GACHA:") ? (
        (() => {
          try {
            const item = JSON.parse(entry.body.replace("GACHA:", ""));
            return (
              <div className="rounded-xl border border-amber-500/40 bg-gradient-to-r from-amber-950/40 via-purple-950/30 to-amber-950/40 p-3 shadow.lg flex items-center gap-3">
                <span className="text-3xl shrink-0">{item.emoji}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                      🎰 TIRAGE GACHA — {item.rarity}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400">+{item.xp} XP</span>
                  </div>
                  <h4 className="font-display font-bold text-xs text-amber-200 truncate">{item.title}</h4>
                  <p className="text-[11px] text-foreground/70 line-clamp-2">{item.description}</p>
                </div>
              </div>
            );
          } catch {
            return (
              <p className="whitespace-pre-line text-[15px] leading-relaxed text-foreground/85">
                {entry.body}
              </p>
            );
          }
        })()
      ) : (
        entry.body && (
          <p className="whitespace-pre-line text-[15px] leading-relaxed text-foreground/85">
            {entry.body}
          </p>
        )
      )}
    </motion.article>
  );
}
