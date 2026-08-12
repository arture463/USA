"use client";

import { motion } from "framer-motion";
import { Music2, Quote } from "lucide-react";
import { SHARED_TRACK } from "@/lib/music-data";
import { revealOnScroll } from "@/lib/motion";
import { SectionHeading } from "@/components/ui/section-heading";

/**
 * MODULE 6 — Music Player
 * Lecteur Spotify embarqué (aucune clé API : simple iframe officielle)
 * + dédicace. Le lien se change dans src/lib/music-data.ts.
 */

/**
 * Convertit un lien Spotify public en URL d'embed.
 * https://open.spotify.com/track/X  →  https://open.spotify.com/embed/track/X
 * Gère track / album / playlist, et ignore les query strings (?si=...).
 */
function toEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname !== "open.spotify.com") return null;
    const path = u.pathname.replace(/^\/+/, "");
    if (!/^(track|album|playlist)\//.test(path)) return null;
    return `https://open.spotify.com/embed/${path}?theme=0`;
  } catch {
    return null;
  }
}

export function MusicPlayer() {
  const embedUrl = toEmbedUrl(SHARED_TRACK.spotifyUrl);

  return (
    <motion.section {...revealOnScroll} className="w-full">
      <SectionHeading
        eyebrow="Fréquence partagée"
        icon={Music2}
        title="La chanson"
        titleAccent="du moment"
        accent="cyan"
      />

      <div className="panel-tight overflow-hidden sm:p-6">
        {embedUrl ? (
          /* Lecteur officiel Spotify (thème sombre) */
          <iframe
            src={embedUrl}
            width="100%"
            height={152}
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            className="rounded-inner"
            title="Lecteur Spotify — chanson du moment"
          />
        ) : (
          /* Lien invalide/absent → état d'attente élégant */
          <div className="flex h-[152px] flex-col items-center justify-center gap-2 rounded-inner border border-dashed border-white/10 text-foreground/50">
            <Music2 className="h-6 w-6" />
            <p className="text-sm">
              Colle un lien Spotify dans{" "}
              <code className="font-mono text-neon-cyan">
                src/lib/music-data.ts
              </code>
            </p>
          </div>
        )}

        {/* La dédicace */}
        <div className="mt-4 flex items-start gap-2.5 px-1">
          <Quote className="mt-0.5 h-4 w-4 shrink-0 text-neon-rose" />
          <p className="text-sm italic leading-relaxed text-foreground/70">
            {SHARED_TRACK.dedication}
            <span className="label-micro ml-2 not-italic">
              — {SHARED_TRACK.from}
            </span>
          </p>
        </div>
      </div>
    </motion.section>
  );
}
