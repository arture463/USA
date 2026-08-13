"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Music2, Disc, ExternalLink, Sparkles, LogIn, Send, Heart, Quote, Plus } from "lucide-react";
import { revealOnScroll } from "@/lib/motion";
import { SectionHeading } from "@/components/ui/section-heading";
import { useIdentity } from "@/hooks/use-identity";
import { useSpotifyNowPlaying, type SpotifyTrackInfo } from "@/hooks/use-spotify";
import { supabase } from "@/lib/supabase/client";

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

interface SharedSongRecord {
  id: string;
  who: "paris" | "raleigh";
  spotify_url: string;
  dedication?: string;
  created_at: string;
}

export function MusicPlayer() {
  const { identity } = useIdentity();
  const { data, loading } = useSpotifyNowPlaying();
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [spotifyUrlInput, setSpotifyUrlInput] = useState("");
  const [dedicationInput, setDedicationInput] = useState("");
  const [sharedSongs, setSharedSongs] = useState<SharedSongRecord[]>([]);

  // Charger les dédicaces/musiques partagées depuis Supabase ou LocalStorage
  useEffect(() => {
    const fetchSharedSongs = async () => {
      try {
        const { data: records } = await supabase
          .from("journal_entries")
          .select("*")
          .eq("kind", "text")
          .like("body", "🎵%")
          .order("created_at", { ascending: false });

        if (records) {
          const parsed: SharedSongRecord[] = records.map((r) => {
            const parts = r.body?.replace("🎵 ", "").split(" — ") || [];
            return {
              id: r.id,
              who: r.author,
              spotify_url: parts[0] || "",
              dedication: parts[1] || "",
              created_at: r.created_at,
            };
          });
          setSharedSongs(parsed);
        }
      } catch {
        // Fallback local
      }
    };

    void fetchSharedSongs();
  }, []);

  const handleShareSong = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!spotifyUrlInput.trim()) return;

    const recordText = `🎵 ${spotifyUrlInput.trim()}${
      dedicationInput.trim() ? ` — ${dedicationInput.trim()}` : ""
    }`;

    try {
      await supabase.from("journal_entries").insert({
        author: identity,
        kind: "text",
        body: recordText,
      });

      const newRecord: SharedSongRecord = {
        id: `song-${Date.now()}`,
        who: identity,
        spotify_url: spotifyUrlInput.trim(),
        dedication: dedicationInput.trim(),
        created_at: new Date().toISOString(),
      };

      setSharedSongs((prev) => [newRecord, ...prev]);
    } catch {
      // Ignore
    }

    setSpotifyUrlInput("");
    setDedicationInput("");
    setManualModalOpen(false);
  };

  const latestSong = sharedSongs[0];
  const embedUrl = latestSong ? toEmbedUrl(latestSong.spotify_url) : null;

  return (
    <motion.section {...revealOnScroll} className="w-full space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SectionHeading
          eyebrow="Fréquence Partagée 🎧"
          icon={Music2}
          title="Ce qu'on écoute"
          titleAccent="ensemble"
          subtitle="Partagez vos sons coup de cœur et dédicaces en direct entre Paris et Raleigh !"
          accent="cyan"
        />

        <button
          type="button"
          onClick={() => setManualModalOpen(true)}
          className="btn-neon btn-sm btn-pill shrink-0 gap-1.5 text-xs border-emerald-500/60 text-emerald-300 hover:border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
        >
          <Plus className="h-3.5 w-3.5" />
          Dédier une chanson / Lien Spotify
        </button>
      </div>

      {/* ── 1. LECTEUR DU MORCEAU DÉDIÉ DU MOMENT ── */}
      <div className="panel-tight overflow-hidden p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-display font-semibold text-sm flex items-center gap-2 text-foreground/90">
            <Heart className="h-4 w-4 text-neon-rose fill-neon-rose" />
            La Chanson Dédiée du Moment
          </h4>
          {latestSong && (
            <span className="font-mono text-[10px] text-foreground/40">
              Dédiée par {latestSong.who === "paris" ? "Arthur 🇫🇷" : "Clara 🇺🇸"}
            </span>
          )}
        </div>

        {embedUrl ? (
          <iframe
            src={embedUrl}
            width="100%"
            height={152}
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            className="rounded-xl border border-white/10 shadow-lg"
            title="Lecteur Spotify — chanson du moment"
          />
        ) : (
          <div className="flex h-36 flex-col items-center justify-center gap-2.5 rounded-xl border border-dashed border-white/10 text-center p-4">
            <Disc className="h-8 w-8 text-emerald-400 animate-spin" style={{ animationDuration: "10s" }} />
            <p className="text-xs text-foreground/60">
              Aucune chanson dédiée pour l&apos;instant. Cliquez sur &quot;Dédier une chanson&quot; pour lui partager votre son du moment ! 🎵
            </p>
          </div>
        )}

        {latestSong?.dedication && (
          <div className="flex items-start gap-2.5 rounded-xl border border-white/10 bg-white/5 p-3.5 text-xs italic text-foreground/80">
            <Quote className="h-4 w-4 text-neon-rose shrink-0 mt-0.5" />
            <p className="flex-1">
              &quot;{latestSong.dedication}&quot;
            </p>
          </div>
        )}
      </div>

      {/* ── 2. CARTES SPOTIFY AUTO (PARIS & RALEIGH) ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* ARTHUR */}
        <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-b from-[#0b1329]/80 to-[#070b17]/90 p-4 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">🇫🇷</span>
              <div>
                <h4 className="font-display font-bold text-sm text-cyan-300">
                  Arthur (Paris)
                </h4>
                <p className="text-[10px] text-cyan-200/50 font-mono">Spotify Live</p>
              </div>
            </div>
            <a
              href="/api/spotify/login?who=paris"
              className="rounded-full bg-emerald-500/20 px-2.5 py-1 text-[10px] font-bold text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 transition-all flex items-center gap-1"
            >
              <LogIn className="h-3 w-3" /> Connecter 🟢
            </a>
          </div>
          {data.paris.requiresPremium ? (
            <p className="text-[11px] text-cyan-200/60 italic">
              Compte Spotify lié 🟢 (Partagez vos dédicaces ci-dessus !)
            </p>
          ) : (
            <p className="text-[11px] text-cyan-200/50 italic">
              Connectez Spotify pour afficher la lecture en direct
            </p>
          )}
        </div>

        {/* CLARA */}
        <div className="rounded-2xl border border-rose-500/30 bg-gradient-to-b from-[#250b18]/80 to-[#140710]/90 p-4 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">🇺🇸</span>
              <div>
                <h4 className="font-display font-bold text-sm text-rose-300">
                  Clara (Raleigh)
                </h4>
                <p className="text-[10px] text-rose-200/50 font-mono">Spotify Live</p>
              </div>
            </div>
            <a
              href="/api/spotify/login?who=raleigh"
              className="rounded-full bg-emerald-500/20 px-2.5 py-1 text-[10px] font-bold text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 transition-all flex items-center gap-1"
            >
              <LogIn className="h-3 w-3" /> Connecter 🟢
            </a>
          </div>
          {data.raleigh.requiresPremium ? (
            <p className="text-[11px] text-rose-200/60 italic">
              Compte Spotify lié 🟢 (Partagez vos dédicaces ci-dessus !)
            </p>
          ) : (
            <p className="text-[11px] text-rose-200/50 italic">
              Connectez Spotify pour afficher la lecture en direct
            </p>
          )}
        </div>
      </div>

      {/* ── MODALE DE DÉDICACE / PARTAGE DE LIEN SPOTIFY ── */}
      <AnimatePresence>
        {manualModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setManualModalOpen(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="panel-tight relative z-10 w-full max-w-lg border-emerald-500/30 shadow-2xl"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                  <Music2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-semibold">
                    Dédier une Chanson Spotify
                  </h3>
                  <p className="text-xs text-foreground/50">
                    Collez un lien Spotify et écrivez un petit mot romantique !
                  </p>
                </div>
              </div>

              <form onSubmit={handleShareSong} className="space-y-4">
                <div>
                  <label className="label-micro mb-1 block">
                    Lien Spotify (Titre / Album / Playlist)
                  </label>
                  <input
                    type="url"
                    required
                    value={spotifyUrlInput}
                    onChange={(e) => setSpotifyUrlInput(e.target.value)}
                    placeholder="https://open.spotify.com/track/..."
                    className="field w-full font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="label-micro mb-1 block">
                    Message / Dédicace (optionnel)
                  </label>
                  <input
                    type="text"
                    value={dedicationInput}
                    onChange={(e) => setDedicationInput(e.target.value)}
                    placeholder="ex: Cette chanson me fait penser à toi ❤️"
                    className="field w-full"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setManualModalOpen(false)}
                    className="btn-ghost text-xs"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="btn-neon btn-sm gap-1 bg-emerald-500 text-black hover:bg-emerald-400 border-emerald-400"
                  >
                    <Send className="h-3.5 w-3.5" />
                    Partager & Dédier !
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
