"use client";

import { motion } from "framer-motion";
import { Music2, Disc, ExternalLink, Radio, Sparkles, LogIn, Volume2 } from "lucide-react";
import { revealOnScroll } from "@/lib/motion";
import { SectionHeading } from "@/components/ui/section-heading";
import { useIdentity } from "@/hooks/use-identity";
import { useSpotifyNowPlaying, type SpotifyTrackInfo } from "@/hooks/use-spotify";

function formatMs(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
}

interface UserSpotifyCardProps {
  name: string;
  flag: string;
  city: string;
  who: "paris" | "raleigh";
  track: SpotifyTrackInfo;
  isCurrentUser: boolean;
}

function UserSpotifyCard({
  name,
  flag,
  city,
  who,
  track,
  isCurrentUser,
}: UserSpotifyCardProps) {
  const progressPercent =
    track.progressMs && track.durationMs
      ? Math.min(100, (track.progressMs / track.durationMs) * 100)
      : 0;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-4 backdrop-blur-xl transition-all ${
        who === "paris"
          ? "border-cyan-500/30 bg-gradient-to-b from-[#0b1329]/80 to-[#070b17]/90 shadow-[0_10px_30px_rgba(56,189,248,0.1)]"
          : "border-rose-500/30 bg-gradient-to-b from-[#250b18]/80 to-[#140710]/90 shadow-[0_10px_30px_rgba(244,63,94,0.1)]"
      }`}
    >
      {/* Header Profil */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{flag}</span>
          <div>
            <h4
              className={`font-display font-bold text-sm flex items-center gap-1.5 ${
                who === "paris" ? "text-cyan-300" : "text-rose-300"
              }`}
            >
              {name}
              {isCurrentUser && (
                <span className="rounded bg-white/10 px-1.5 py-0.5 text-[9px] font-normal text-foreground/70">
                  Toi
                </span>
              )}
            </h4>
            <p className="text-[10px] text-foreground/50 font-mono">{city}</p>
          </div>
        </div>

        {/* Badge Statut Live */}
        {track.connected && track.isPlaying ? (
          <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-2.5 py-1 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            ÉCOUTE EN DIRECT 🎵
          </span>
        ) : track.connected ? (
          <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-medium text-foreground/50 border border-white/10">
            PAUSE / RÉCENT
          </span>
        ) : (
          <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-[10px] font-medium text-amber-300 border border-amber-500/20">
            NON CONNECTÉ
          </span>
        )}
      </div>

      {/* Contenu Spotify */}
      {track.connected && (track.title || track.isPlaying) ? (
        <div className="flex items-center gap-3.5">
          {/* Jacquette d'album tournante si musique en cours */}
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-white/10 shadow-lg group">
            {track.albumArt ? (
              <img
                src={track.albumArt}
                alt={track.album || "Album cover"}
                className={`h-full w-full object-cover ${
                  track.isPlaying ? "animate-[spin_12s_linear_infinite]" : ""
                }`}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-white/10 text-foreground/40">
                <Disc className="h-8 w-8" />
              </div>
            )}
            <div className="absolute inset-0 rounded-full border border-white/20 pointer-events-none" />
          </div>

          {/* Infos Titre & Artiste */}
          <div className="min-w-0 flex-1 space-y-1">
            <a
              href={track.songUrl || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-sm text-foreground hover:underline line-clamp-1 flex items-center gap-1 group"
            >
              {track.title}
              <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-foreground/60 shrink-0" />
            </a>
            <p className="text-xs text-foreground/60 line-clamp-1">
              {track.artist}
            </p>
            <p className="text-[10px] text-foreground/40 line-clamp-1 font-mono">
              {track.album}
            </p>
          </div>
        </div>
      ) : track.connected ? (
        <div className="flex h-16 items-center justify-center rounded-xl border border-dashed border-white/10 text-xs text-foreground/40 italic">
          Rien en cours d&apos;écoute pour le moment… 🎧
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-2 py-3 text-center">
          <p className="text-xs text-foreground/60">
            Connecte ton compte Spotify pour partager ta musique !
          </p>
          <a
            href={`/api/spotify/login?who=${who}`}
            className="btn-neon btn-sm gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)]"
          >
            <LogIn className="h-3.5 w-3.5" /> Connecter Spotify 🟢
          </a>
        </div>
      )}

      {/* Barre de progression de la lecture si en cours */}
      {track.isPlaying && track.progressMs && track.durationMs && (
        <div className="mt-3 space-y-1">
          <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${
                who === "paris"
                  ? "bg-gradient-to-r from-cyan-500 to-sky-300 shadow-[0_0_8px_#38bdf8]"
                  : "bg-gradient-to-r from-rose-500 to-pink-300 shadow-[0_0_8px_#f43f5e]"
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between font-mono text-[9px] text-foreground/40">
            <span>{formatMs(track.progressMs)}</span>
            <span>{formatMs(track.durationMs)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export function MusicPlayer() {
  const { identity } = useIdentity();
  const { data, loading } = useSpotifyNowPlaying();

  return (
    <motion.section {...revealOnScroll} className="w-full">
      <SectionHeading
        eyebrow="Fréquence En Direct 🎧"
        icon={Music2}
        title="Ce qu'on écoute"
        titleAccent="en temps réel"
        subtitle="Connectez vos comptes Spotify pour voir instantanément le titre que l'autre écoute !"
        accent="cyan"
      />

      <div className="panel-roomy space-y-4">
        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="skeleton h-32 w-full" />
            <div className="skeleton h-32 w-full" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <UserSpotifyCard
              name="Arthur"
              flag="🇫🇷"
              city="Paris"
              who="paris"
              track={data.paris}
              isCurrentUser={identity === "paris"}
            />
            <UserSpotifyCard
              name="Clara"
              flag="🇺🇸"
              city="Raleigh"
              who="raleigh"
              track={data.raleigh}
              isCurrentUser={identity === "raleigh"}
            />
          </div>
        )}

        {/* Note de bas de page explicative */}
        <p className="text-center text-[11px] text-foreground/40 font-mono flex items-center justify-center gap-1.5">
          <Sparkles className="h-3 w-3 text-cyan-400" />
          Mise à jour automatique toutes les 5 secondes via Spotify Web API
        </p>
      </div>
    </motion.section>
  );
}
