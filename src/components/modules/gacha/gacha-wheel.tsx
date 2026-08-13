"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Dices, Gift, Crown, Flame, Trophy, History, Orbit, Compass, Stars, Play, Wrench, RefreshCw, Zap } from "lucide-react";
import confetti from "canvas-confetti";
import { revealOnScroll } from "@/lib/motion";
import { SectionHeading } from "@/components/ui/section-heading";
import { useIdentity } from "@/hooks/use-identity";
import { usePetFeeder } from "@/hooks/use-pet";
import { supabase } from "@/lib/supabase/client";

export type Rarity = "common" | "rare" | "epic" | "legendary" | "mythic";

export interface GachaItem {
  id: string;
  title: string;
  description: string;
  rarity: Rarity;
  emoji: string;
  xp: number;
}

export const GACHA_POOL: GachaItem[] = [
  {
    id: "c1",
    title: "Selfie Grimace Instantané",
    description: "Envoie un selfie ultra-drôle ou mignon dans le journal sous 10 min !",
    rarity: "common",
    emoji: "🤪",
    xp: 30,
  },
  {
    id: "c2",
    title: "Vocal Doux du Réveil",
    description: "Promesse d'envoyer un message vocal ultra-doux au réveil demain !",
    rarity: "common",
    emoji: "💌",
    xp: 30,
  },
  {
    id: "c3",
    title: "Anecdote Secrète",
    description: "Raconte un souvenir marrant ou un petit secret que l'autre ne connaît pas !",
    rarity: "common",
    emoji: "💬",
    xp: 40,
  },
  {
    id: "r1",
    title: "Dédicace Musicale Surprise",
    description: "Dédie une chanson coup de cœur dans la section Musique avec un mot doux !",
    rarity: "rare",
    emoji: "🎵",
    xp: 80,
  },
  {
    id: "r2",
    title: "Joker Soirée Fast-Food & Film au Lit",
    description: "Au retour, plateau télé complet au lit sans aucune vaisselle à faire !",
    rarity: "rare",
    emoji: "🍔",
    xp: 100,
  },
  {
    id: "r3",
    title: "Photo Souvenir Nostalgie",
    description: "Retrouve et partage une photo de vous deux datant d'au moins 6 mois !",
    rarity: "rare",
    emoji: "📸",
    xp: 100,
  },
  {
    id: "e1",
    title: "Destination Surprise Week-End 2027",
    description: "L'autre choisit la destination de votre premier week-end surprise l'année prochaine !",
    rarity: "epic",
    emoji: "✈️",
    xp: 250,
  },
  {
    id: "e2",
    title: "Sortie Sensation Forte / Activité Extrême",
    description: "Une activité originale/karting/parc offerte par l'autre pendant les vacances !",
    rarity: "epic",
    emoji: "🏎️",
    xp: 300,
  },
  {
    id: "l1",
    title: "Passe-Droit Absolu 24h",
    description: "Pendant 24h, l'autre ne peut dire 'Non' à aucune idée d'activité ou de sortie !",
    rarity: "legendary",
    emoji: "👑",
    xp: 600,
  },
  {
    id: "l2",
    title: "Capsule du Souhait Secret du 24 Décembre",
    description: "Tu rédiges 1 souhait secrètement verrouillé jusqu'au 24 Décembre, l'autre s'engage à le réaliser sans savoir ce que c'est à l'avance !",
    rarity: "legendary",
    emoji: "🔮",
    xp: 750,
  },
  {
    id: "m1",
    title: "JACKPOT TROU NOIR COSMIQUE — 3 VŒUX MAGIQUES !",
    description: "SINGULARITÉ ABSOLUE : 3 Vœux magiques accordés sans aucune restriction + 1500 XP Créature !",
    rarity: "mythic",
    emoji: "🌀",
    xp: 1500,
  },
];

export const RARITY_CONFIG: Record<
  Rarity,
  { label: string; color: string; border: string; bg: string; shadow: string; soundPitch: number }
> = {
  common: {
    label: "COMMUN",
    color: "text-slate-300",
    border: "border-slate-500/40",
    bg: "from-slate-900/95 via-purple-950/40 to-slate-950/95",
    shadow: "shadow-[0_0_20px_rgba(148,163,184,0.2)]",
    soundPitch: 350,
  },
  rare: {
    label: "RARE",
    color: "text-sky-400 font-bold",
    border: "border-sky-500/60",
    bg: "from-sky-950/95 via-slate-950/80 to-indigo-950/95",
    shadow: "shadow-[0_0_30px_rgba(56,189,248,0.4)]",
    soundPitch: 520,
  },
  epic: {
    label: "ÉPIQUE",
    color: "text-purple-300 font-bold",
    border: "border-purple-500/80",
    bg: "from-purple-950/95 via-fuchsia-950/50 to-slate-950/95",
    shadow: "shadow-[0_0_40px_rgba(192,132,252,0.6)]",
    soundPitch: 700,
  },
  legendary: {
    label: "LÉGENDAIRE 🌟",
    color: "text-amber-300 font-extrabold animate-pulse",
    border: "border-amber-400",
    bg: "from-amber-950/95 via-yellow-950/60 to-purple-950/95",
    shadow: "shadow-[0_0_60px_rgba(251,191,36,0.8)]",
    soundPitch: 980,
  },
  mythic: {
    label: "SINGULARITÉ TROU NOIR 🌀",
    color: "text-pink-300 font-black animate-bounce",
    border: "border-pink-500",
    bg: "from-pink-950/95 via-purple-950/80 to-cyan-950/95",
    shadow: "shadow-[0_0_80px_rgba(244,114,182,0.9)]",
    soundPitch: 1200,
  },
};

const STORAGE_KEY_WIN = "us-together:gacha-wins";
const STORAGE_KEY_LAST = "us-together:gacha-last-spin";

export function GachaWheel() {
  const { identity } = useIdentity();
  const feedPet = usePetFeeder(identity);
  const [spinning, setSpinning] = useState(false);
  const [cutscenePhase, setCutscenePhase] = useState<"idle" | "singularity" | "warp" | "reveal">("idle");
  const [rotation, setRotation] = useState(0);
  const [wonItem, setWonItem] = useState<GachaItem | null>(null);
  const [history, setHistory] = useState<(GachaItem & { wonAt: string; who: string })[]>([]);
  const [cooldownMs, setCooldownMs] = useState(0);
  const [devPanelOpen, setDevPanelOpen] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playCosmicWarpSound = (frequency = 400, duration = 0.1) => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") void ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {}
  };

  useEffect(() => {
    const loadGachaData = async () => {
      try {
        const lastSpin = window.localStorage.getItem(`${STORAGE_KEY_LAST}:${identity}`);
        if (lastSpin) {
          const lastTime = parseInt(lastSpin, 10);
          const elapsed = Date.now() - lastTime;
          const remaining = Math.max(0, 24 * 3600 * 1000 - elapsed);
          setCooldownMs(remaining);
        }

        const { data } = await supabase
          .from("journal_entries")
          .select("*")
          .eq("kind", "text")
          .like("body", "GACHA:%")
          .order("created_at", { ascending: false });

        if (data && data.length > 0) {
          const parsed = data.map((r) => {
            const jsonStr = r.body.replace("GACHA:", "");
            const item = JSON.parse(jsonStr) as GachaItem;
            return { ...item, wonAt: r.created_at, who: r.author };
          });
          setHistory(parsed);
        } else {
          const local = window.localStorage.getItem(STORAGE_KEY_WIN);
          if (local) setHistory(JSON.parse(local));
        }
      } catch {
        const local = window.localStorage.getItem(STORAGE_KEY_WIN);
        if (local) setHistory(JSON.parse(local));
      }
    };

    void loadGachaData();
  }, [identity]);

  useEffect(() => {
    if (cooldownMs <= 0) return;
    const interval = setInterval(() => {
      setCooldownMs((prev) => Math.max(0, prev - 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldownMs]);

  const getRandomItem = (): GachaItem => {
    const rand = Math.random() * 100;
    let targetRarity: Rarity = "common";

    if (rand < 0.5) targetRarity = "mythic";
    else if (rand < 5.0) targetRarity = "legendary";
    else if (rand < 20.0) targetRarity = "epic";
    else if (rand < 50.0) targetRarity = "rare";
    else targetRarity = "common";

    const subPool = GACHA_POOL.filter((i) => i.rarity === targetRarity);
    return subPool[Math.floor(Math.random() * subPool.length)] || GACHA_POOL[0];
  };

  const handleSpin = (forcedItem?: GachaItem) => {
    if (spinning) return;

    setSpinning(true);
    setWonItem(null);
    setCutscenePhase("singularity");

    const prize = forcedItem || getRandomItem();
    const prizeIndex = GACHA_POOL.findIndex((i) => i.id === prize.id);
    const totalItems = GACHA_POOL.length;
    const sliceAngle = 360 / totalItems;

    const extraRounds = 8 * 360;
    const targetAngle = extraRounds + (totalItems - prizeIndex) * sliceAngle - sliceAngle / 2;
    const finalRotation = rotation + targetAngle;

    setRotation(finalRotation);

    // Phase 1 : Singularity Sound & Ticks
    let speed = 25;
    let ticks = 0;
    const playWarpTicks = () => {
      if (ticks < 40) {
        playCosmicWarpSound(150 + (ticks % 10) * 90, 0.08);
        ticks++;
        speed += 7;
        setTimeout(playWarpTicks, speed);
      }
    };
    playWarpTicks();

    // Transition Phase 2 : Warp Speed Lines
    setTimeout(() => {
      setCutscenePhase("warp");
    }, 2200);

    // Transition Phase 3 : Reveal Holographic Card
    setTimeout(async () => {
      setSpinning(false);
      setCutscenePhase("reveal");
      setWonItem(prize);

      const rarityConfig = RARITY_CONFIG[prize.rarity];
      playCosmicWarpSound(rarityConfig.soundPitch, 0.5);

      if (prize.rarity === "legendary" || prize.rarity === "mythic") {
        void confetti({
          particleCount: 250,
          spread: 140,
          origin: { y: 0.5 },
        });
      } else {
        void confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
        });
      }

      void feedPet(prize.xp, null, "treat");

      const now = Date.now();
      window.localStorage.setItem(`${STORAGE_KEY_LAST}:${identity}`, String(now));
      setCooldownMs(24 * 3600 * 1000);

      const newWinRecord = {
        ...prize,
        wonAt: new Date().toISOString(),
        who: identity,
      };

      setHistory((prev) => [newWinRecord, ...prev]);

      try {
        await supabase.from("journal_entries").insert({
          author: identity,
          kind: "text",
          body: `GACHA:${JSON.stringify(prize)}`,
        });
      } catch {}
    }, 4500);
  };

  const handleResetCooldown = () => {
    window.localStorage.removeItem(`${STORAGE_KEY_LAST}:${identity}`);
    setCooldownMs(0);
  };

  const formatTimeLeft = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return `${h}h ${m}m ${s < 10 ? "0" : ""}${s}s`;
  };

  return (
    <motion.section {...revealOnScroll} className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <SectionHeading
          eyebrow="Singularité Spatio-Temporelle 🌀"
          icon={Orbit}
          title="Le Trou Noir"
          titleAccent="Gacha Cosmique"
          subtitle="Aspirez la poussière d'étoiles pour débloquer des privilèges légendaires et des vœux secrets !"
          accent="violet"
        />

        {/* Bouton Panneau Testeur */}
        <button
          type="button"
          onClick={() => setDevPanelOpen(!devPanelOpen)}
          className="btn-ghost btn-xs gap-1.5 text-slate-400 hover:text-slate-200 border-white/10 shrink-0 self-start sm:self-auto"
        >
          <Wrench className="h-3.5 w-3.5" />
          {devPanelOpen ? "Fermer Panel Test" : "🛠️ Panel Testeur"}
        </button>
      </div>

      {/* ── PANNEAU DE TEST DEVELOPPER ── */}
      <AnimatePresence>
        {devPanelOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-2xl border border-amber-500/40 bg-amber-950/20 p-4 mb-4 backdrop-blur-md space-y-3"
          >
            <div className="flex items-center justify-between">
              <h4 className="font-display font-bold text-xs text-amber-300 flex items-center gap-1.5">
                <Wrench className="h-4 w-4" /> PANNEAU DE TEST GACHA (ADMIN MODE)
              </h4>
              <span className="text-[10px] font-mono text-amber-400/80">Bypass Cooldown Active</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleResetCooldown}
                className="btn-pill btn-xs border-amber-400/50 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 gap-1"
              >
                <RefreshCw className="h-3 w-3" /> Reset Cooldown (Rejouer Direct)
              </button>

              <button
                type="button"
                onClick={() => handleSpin(GACHA_POOL.find((i) => i.rarity === "legendary"))}
                className="btn-pill btn-xs border-purple-400/50 bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 gap-1"
              >
                <Crown className="h-3 w-3" /> Test Gagnant LÉGENDAIRE 👑
              </button>

              <button
                type="button"
                onClick={() => handleSpin(GACHA_POOL.find((i) => i.rarity === "mythic"))}
                className="btn-pill btn-xs border-pink-400/50 bg-pink-500/20 text-pink-300 hover:bg-pink-500/30 gap-1"
              >
                <Zap className="h-3 w-3 animate-pulse" /> Test JACKPOT MYTHIQUE 🌀
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="panel-roomy relative overflow-hidden space-y-6">
        {/* ── CUTSCENE OVERLAY OVERFLOW WORMHOLE CINEMATIC ── */}
        <AnimatePresence>
          {spinning && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-40 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center"
            >
              {cutscenePhase === "singularity" && (
                <motion.div
                  initial={{ scale: 0.5, rotate: 0 }}
                  animate={{ scale: [1, 1.3, 1], rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="flex flex-col items-center space-y-4"
                >
                  <div className="h-32 w-32 rounded-full border-4 border-purple-500/80 bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-400 shadow-[0_0_80px_#c084fc] flex items-center justify-center animate-spin">
                    <Orbit className="h-16 w-16 text-white" />
                  </div>
                  <h3 className="font-display font-black text-2xl text-purple-300 animate-pulse">
                    ASPIRATION DE LA SINGULARITÉ...
                  </h3>
                </motion.div>
              )}

              {cutscenePhase === "warp" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1.2 }}
                  transition={{ duration: 1.5 }}
                  className="flex flex-col items-center space-y-4"
                >
                  <div className="h-40 w-40 rounded-full border-4 border-cyan-400 bg-cyan-500/30 shadow-[0_0_100px_#38bdf8] flex items-center justify-center animate-ping">
                    <Sparkles className="h-20 w-20 text-white" />
                  </div>
                  <h3 className="font-display font-black text-3xl text-cyan-300 drop-shadow-[0_0_15px_#38bdf8]">
                    SAUT QUANTIQUE EN COURS ! ⚡
                  </h3>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── ARÈNE CINÉMATIQUE TROU NOIR HOLOGRAPHIQUE ── */}
        <div className="flex flex-col items-center justify-center py-6 space-y-8">
          <div className="relative flex flex-col items-center">
            <div className="z-20 -mb-4 h-6 w-1 rounded-full bg-cyan-400 shadow-[0_0_15px_#38bdf8] animate-pulse" />

            <div className="relative h-72 w-72 sm:h-96 sm:w-96 rounded-full border-4 border-purple-500/40 p-3 shadow-[0_0_70px_rgba(168,85,247,0.5)] bg-gradient-to-b from-black via-[#090314] to-[#04010a] overflow-hidden flex items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 m-auto h-full w-full rounded-full border border-purple-500/20 shadow-[inset_0_0_40px_rgba(192,132,252,0.3)] pointer-events-none"
              />

              <motion.div
                animate={{ rotate: rotation }}
                transition={{ duration: 4.5, ease: [0.12, 0.8, 0.25, 1] }}
                className="h-full w-full rounded-full relative overflow-hidden flex items-center justify-center"
              >
                {GACHA_POOL.map((item, idx) => {
                  const total = GACHA_POOL.length;
                  const angle = (360 / total) * idx;
                  const rarityConf = RARITY_CONFIG[item.rarity];
                  return (
                    <div
                      key={item.id}
                      className="absolute inset-0 origin-center flex items-start justify-center pt-4"
                      style={{
                        transform: `rotate(${angle}deg)`,
                      }}
                    >
                      <div className="flex flex-col items-center gap-0.5 text-center">
                        <span className="text-2xl sm:text-3xl drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">
                          {item.emoji}
                        </span>
                        <span
                          className={`text-[8px] font-bold uppercase tracking-wider ${rarityConf.color}`}
                        >
                          {item.rarity.substring(0, 3)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </motion.div>

              <div className="absolute inset-0 m-auto h-24 w-24 sm:h-28 sm:w-28 rounded-full border-2 border-cyan-400/50 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center shadow-[0_0_35px_rgba(56,189,248,0.8)] z-10 pointer-events-none">
                <Orbit className={`h-8 w-8 text-cyan-300 ${spinning ? "animate-spin" : ""}`} />
                <span className="text-[9px] font-mono text-cyan-200/80 font-bold tracking-widest mt-1">
                  SINGULARITÉ
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={() => handleSpin()}
              disabled={spinning}
              className={`btn-neon btn-lg btn-pill gap-2 text-sm px-10 py-4 ${
                cooldownMs > 0 && !spinning
                  ? "opacity-80 border-slate-700 bg-slate-900 text-slate-400"
                  : "bg-gradient-to-r from-purple-600 via-fuchsia-600 to-cyan-500 text-white border-cyan-300 shadow-[0_0_35px_rgba(168,85,247,0.7)] hover:scale-105 transition-all"
              }`}
            >
              <Stars className={`h-5 w-5 ${spinning ? "animate-spin" : ""}`} />
              {spinning
                ? "ASPIRATION SPATIO-TEMPORELLE..."
                : cooldownMs > 0
                ? "RECHARGER LE TROU NOIR 🎲"
                : "ASPIRER LA GALAXIE (TIRAGE GRATUIT) 🌀"}
            </button>

            {cooldownMs > 0 && !spinning && (
              <p className="font-mono text-[11px] text-foreground/50">
                Prochain saut quantique dans {formatTimeLeft(cooldownMs)}
              </p>
            )}
          </div>
        </div>

        {/* ── MODALE RÉSULTAT HOLOGRAPHIQUE ── */}
        <AnimatePresence>
          {wonItem && (
            <motion.div
              initial={{ opacity: 0, scale: 0.7, rotate: -5 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.7, rotate: 5 }}
              className={`rounded-3xl border p-6 text-center space-y-4 backdrop-blur-2xl bg-gradient-to-b ${
                RARITY_CONFIG[wonItem.rarity].bg
              } ${RARITY_CONFIG[wonItem.rarity].border} ${
                RARITY_CONFIG[wonItem.rarity].shadow
              }`}
            >
              <span className="text-6xl block animate-bounce drop-shadow-[0_0_20px_rgba(255,255,255,0.8)]">
                {wonItem.emoji}
              </span>
              <div>
                <span
                  className={`inline-block rounded-full bg-white/10 px-4 py-1 text-xs font-mono font-black tracking-widest ${
                    RARITY_CONFIG[wonItem.rarity].color
                  }`}
                >
                  {RARITY_CONFIG[wonItem.rarity].label}
                </span>
                <h3 className="font-display font-black text-2xl text-foreground mt-2 drop-shadow">
                  {wonItem.title}
                </h3>
                <p className="text-xs text-foreground/90 mt-2 max-w-md mx-auto leading-relaxed">
                  {wonItem.description}
                </p>
              </div>

              <div className="pt-2 flex items-center justify-center gap-2">
                <span className="chip-text bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-xs py-1 px-3">
                  +{wonItem.xp} XP Créature Spatiale 🎉
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── GALERIE DES GAINS COSMIQUES ── */}
        {history.length > 0 && (
          <div className="border-t border-white/10 pt-4 space-y-3">
            <h4 className="font-display font-semibold text-xs text-foreground/70 flex items-center gap-1.5">
              <History className="h-3.5 w-3.5 text-cyan-400" /> Registre des Découvertes Spatiales
            </h4>

            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {history.slice(0, 4).map((h, i) => {
                const conf = RARITY_CONFIG[h.rarity];
                return (
                  <div
                    key={`${h.id}-${i}`}
                    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 text-left backdrop-blur-md"
                  >
                    <span className="text-3xl shrink-0">{h.emoji}</span>
                    <div className="min-w-0 flex-1">
                      <h5 className="font-bold text-xs text-foreground truncate">
                        {h.title}
                      </h5>
                      <p className="text-[10px] text-foreground/50 truncate">
                        Obtenu par {h.who === "paris" ? "Arthur 🇫🇷" : "Clara 🇺🇸"}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 font-mono text-[9px] font-bold px-2 py-0.5 rounded ${conf.color}`}
                    >
                      +{h.xp} XP
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </motion.section>
  );
}
