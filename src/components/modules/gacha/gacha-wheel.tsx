"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Dices, Gift, Crown, Flame, Trophy, Volume2, VolumeX, History } from "lucide-react";
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
  // ⚪ COMMUN (50%)
  {
    id: "c1",
    title: "Selfie Grimace Instantané",
    description: "Envoie un selfie drôle ou mignon dans le journal sous 10 min !",
    rarity: "common",
    emoji: "🤪",
    xp: 25,
  },
  {
    id: "c2",
    title: "Mot Doux du Matin",
    description: "Promesse d'envoyer un petit mot gentil au réveil demain !",
    rarity: "common",
    emoji: "💌",
    xp: 25,
  },
  {
    id: "c3",
    title: "Anecdote Inédite",
    description: "Raconte un souvenir marrant ou gênant que l'autre ne connaît pas encore !",
    rarity: "common",
    emoji: "💬",
    xp: 30,
  },

  // 🔵 RARE (30%)
  {
    id: "r1",
    title: "Dédicace Musicale Surprise",
    description: "Dédie une chanson coup de cœur dans la section Musique !",
    rarity: "rare",
    emoji: "🎵",
    xp: 75,
  },
  {
    id: "r2",
    title: "Vocal d'Amour 30s",
    description: "Envoie une note vocale d'au moins 30 secondes en chuchotant !",
    rarity: "rare",
    emoji: "🎙️",
    xp: 80,
  },
  {
    id: "r3",
    title: "Photo Souvenir Nostalgie",
    description: "Retrouve et partage une photo de vous deux datant de plusieurs mois !",
    rarity: "rare",
    emoji: "📸",
    xp: 100,
  },

  // 🟣 ÉPIQUE (15%)
  {
    id: "e1",
    title: "Joker Soirée Cinéma",
    description: "Tu choisis le film/série qu'on regarde ensemble à distance !",
    rarity: "epic",
    emoji: "🎬",
    xp: 200,
  },
  {
    id: "e2",
    title: "Petit-Déjeuner Offert",
    description: "L'autre te fait livrer ton petit-déjeuner / boisson préférée !",
    rarity: "epic",
    emoji: "🥐",
    xp: 250,
  },

  // 🟡 LÉGENDAIRE (4.5%)
  {
    id: "l1",
    title: "Massage Complet du 24 Décembre",
    description: "Bon pour un massage royal complet le soir des retrouvailles !",
    rarity: "legendary",
    emoji: "👑",
    xp: 500,
  },
  {
    id: "l2",
    title: "Repas de Chef aux Retrouvailles",
    description: "L'autre cuisinera ton plat préféré absolu le jour de ton retour !",
    rarity: "legendary",
    emoji: "🥘",
    xp: 600,
  },

  // 🌈 MYTHIQUE / JACKPOT (0.5%)
  {
    id: "m1",
    title: "JACKPOT COSMIQUE — Vœu Magique Accordé !",
    description: "VŒU ABSOLU ACCORDÉ : L'autre doit réaliser 1 souhait de ton choix sans discuter !",
    rarity: "mythic",
    emoji: "🌈",
    xp: 1000,
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
    bg: "from-slate-900/90 to-slate-950/90",
    shadow: "shadow-[0_0_15px_rgba(148,163,184,0.2)]",
    soundPitch: 440,
  },
  rare: {
    label: "RARE",
    color: "text-sky-400",
    border: "border-sky-500/50",
    bg: "from-sky-950/90 to-slate-950/90",
    shadow: "shadow-[0_0_20px_rgba(56,189,248,0.3)]",
    soundPitch: 587.33,
  },
  epic: {
    label: "ÉPIQUE",
    color: "text-purple-400",
    border: "border-purple-500/60",
    bg: "from-purple-950/90 to-slate-950/90",
    shadow: "shadow-[0_0_25px_rgba(192,132,252,0.4)]",
    soundPitch: 783.99,
  },
  legendary: {
    label: "LÉGENDAIRE 🌟",
    color: "text-amber-300 font-bold animate-pulse",
    border: "border-amber-400/80",
    bg: "from-amber-950/90 via-yellow-950/50 to-slate-950/90",
    shadow: "shadow-[0_0_35px_rgba(251,191,36,0.6)]",
    soundPitch: 1046.5,
  },
  mythic: {
    label: "MYTHIQUE JACKPOT 🌈",
    color: "text-pink-300 font-extrabold animate-bounce",
    border: "border-pink-400/90",
    bg: "from-pink-950/90 via-purple-950/70 to-cyan-950/90",
    shadow: "shadow-[0_0_50px_rgba(244,114,182,0.8)]",
    soundPitch: 1318.51,
  },
};

const STORAGE_KEY_WIN = "us-together:gacha-wins";
const STORAGE_KEY_LAST = "us-together:gacha-last-spin";

export function GachaWheel() {
  const { identity } = useIdentity();
  const feedPet = usePetFeeder(identity);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [wonItem, setWonItem] = useState<GachaItem | null>(null);
  const [history, setHistory] = useState<(GachaItem & { wonAt: string; who: string })[]>([]);
  const [cooldownMs, setCooldownMs] = useState(0);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Synthesizer Audio tick sound for dopamine spin
  const playTickSound = (frequency = 600) => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") void ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch {}
  };

  // Synchronisation des gains
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

  // Timer cooldown 24h
  useEffect(() => {
    if (cooldownMs <= 0) return;
    const interval = setInterval(() => {
      setCooldownMs((prev) => Math.max(0, prev - 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldownMs]);

  // Tirage Gacha avec probabilités pondérées
  const getRandomItem = (): GachaItem => {
    const rand = Math.random() * 100;
    let targetRarity: Rarity = "common";

    if (rand < 0.5) targetRarity = "mythic"; // 0.5%
    else if (rand < 5.0) targetRarity = "legendary"; // 4.5%
    else if (rand < 20.0) targetRarity = "epic"; // 15%
    else if (rand < 50.0) targetRarity = "rare"; // 30%
    else targetRarity = "common"; // 50%

    const subPool = GACHA_POOL.filter((i) => i.rarity === targetRarity);
    return subPool[Math.floor(Math.random() * subPool.length)] || GACHA_POOL[0];
  };

  const handleSpin = () => {
    if (spinning) return;

    setSpinning(true);
    setWonItem(null);

    const prize = getRandomItem();
    const prizeIndex = GACHA_POOL.findIndex((i) => i.id === prize.id);
    const totalItems = GACHA_POOL.length;
    const sliceAngle = 360 / totalItems;

    // Calcul de la rotation avec ralentissement dramatique (5 tours complets + angle cible)
    const extraRounds = 5 * 360;
    const targetAngle = extraRounds + (totalItems - prizeIndex) * sliceAngle - sliceAngle / 2;
    const finalRotation = rotation + targetAngle;

    setRotation(finalRotation);

    // Bruits de tics saccadés pendant le spin
    let speed = 40;
    let ticks = 0;
    const playSpinTicks = () => {
      if (ticks < 35) {
        playTickSound(300 + (ticks % 8) * 60);
        ticks++;
        speed += 6;
        setTimeout(playSpinTicks, speed);
      }
    };
    playSpinTicks();

    // Révélation du lot après 4 secondes
    setTimeout(async () => {
      setSpinning(false);
      setWonItem(prize);

      // Effets visuels & sonores selon la rareté
      const rarityConfig = RARITY_CONFIG[prize.rarity];
      playTickSound(rarityConfig.soundPitch);

      if (prize.rarity === "legendary" || prize.rarity === "mythic") {
        void confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.5 },
        });
      } else {
        void confetti({
          particleCount: 70,
          spread: 70,
          origin: { y: 0.6 },
        });
      }

      // Nourrir la créature commune avec l'XP gagné !
      void feedPet(prize.xp, null, "treat");

      // Cooldown 24h
      const now = Date.now();
      window.localStorage.setItem(`${STORAGE_KEY_LAST}:${identity}`, String(now));
      setCooldownMs(24 * 3600 * 1000);

      // Sauvegarder dans Supabase
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
    }, 4200);
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
      <SectionHeading
        eyebrow="Tirage Surprise Quotidien 🎰"
        icon={Dices}
        title="La Roulette"
        titleAccent="Dopamine"
        subtitle="1 lancer gratuit par jour ! Gagnez des privilèges exclusifs, du bonus d'XP et des défis uniques !"
        accent="rose"
      />

      <div className="panel-roomy relative overflow-hidden space-y-6">
        {/* ── ARÈNE ROUE GACHA 3D ── */}
        <div className="flex flex-col items-center justify-center py-4 space-y-6">
          {/* Pointeur Flèche Néon */}
          <div className="relative flex flex-col items-center">
            <div className="z-20 -mb-3 h-0 w-0 border-x-8 border-x-transparent border-t-[16px] border-t-amber-400 drop-shadow-[0_0_10px_#fbbf24]" />

            {/* La Roue Tournante */}
            <div className="relative h-64 w-64 sm:h-80 sm:w-80 rounded-full border-4 border-white/20 p-2 shadow-[0_0_40px_rgba(244,63,94,0.3)] bg-gradient-to-b from-slate-900 to-black overflow-hidden">
              <motion.div
                animate={{ rotate: rotation }}
                transition={{ duration: 4, ease: [0.15, 0.85, 0.35, 1] }}
                className="h-full w-full rounded-full relative overflow-hidden"
              >
                {GACHA_POOL.map((item, idx) => {
                  const total = GACHA_POOL.length;
                  const angle = (360 / total) * idx;
                  const rarityConf = RARITY_CONFIG[item.rarity];
                  return (
                    <div
                      key={item.id}
                      className="absolute inset-0 origin-center flex items-start justify-center pt-3"
                      style={{
                        transform: `rotate(${angle}deg)`,
                      }}
                    >
                      <div className="flex flex-col items-center gap-0.5 text-center">
                        <span className="text-xl sm:text-2xl drop-shadow">{item.emoji}</span>
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

              {/* Centre de la Roue Néon */}
              <div className="absolute inset-0 m-auto h-16 w-16 sm:h-20 sm:w-20 rounded-full border-2 border-white/30 bg-background/90 backdrop-blur-md flex flex-col items-center justify-center shadow-2xl z-10 pointer-events-none">
                <Crown className="h-6 w-6 text-amber-400 animate-pulse" />
                <span className="text-[9px] font-mono text-foreground/60">GACHA</span>
              </div>
            </div>
          </div>

          {/* Bouton Lancer Dopamine */}
          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={handleSpin}
              disabled={spinning}
              className={`btn-neon btn-lg btn-pill gap-2 text-sm px-8 py-3 ${
                cooldownMs > 0 && !spinning
                  ? "opacity-80 border-slate-600 bg-slate-800 text-slate-300"
                  : "bg-gradient-to-r from-neon-rose via-purple-600 to-neon-violet text-white border-rose-400 shadow-[0_0_25px_rgba(244,63,94,0.5)]"
              }`}
            >
              <Dices className={`h-5 w-5 ${spinning ? "animate-spin" : ""}`} />
              {spinning
                ? "Tirage en cours..."
                : cooldownMs > 0
                ? "Tirage Rejouable ! 🎲"
                : "LANCER LA ROUETTE (GRATUIT) 🎰"}
            </button>

            {cooldownMs > 0 && !spinning && (
              <p className="font-mono text-[11px] text-foreground/50">
                Prochain tirage quotidien disponible dans {formatTimeLeft(cooldownMs)}
              </p>
            )}
          </div>
        </div>

        {/* ── MODALE RÉSULTAT RARETÉ / REWARD ── */}
        <AnimatePresence>
          {wonItem && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              className={`rounded-2xl border p-6 text-center space-y-3 backdrop-blur-xl bg-gradient-to-b ${
                RARITY_CONFIG[wonItem.rarity].bg
              } ${RARITY_CONFIG[wonItem.rarity].border} ${
                RARITY_CONFIG[wonItem.rarity].shadow
              }`}
            >
              <span className="text-5xl block animate-bounce">{wonItem.emoji}</span>
              <div>
                <span
                  className={`inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-mono font-bold tracking-widest ${
                    RARITY_CONFIG[wonItem.rarity].color
                  }`}
                >
                  {RARITY_CONFIG[wonItem.rarity].label}
                </span>
                <h3 className="font-display font-bold text-xl text-foreground mt-2">
                  {wonItem.title}
                </h3>
                <p className="text-xs text-foreground/80 mt-1 max-w-md mx-auto">
                  {wonItem.description}
                </p>
              </div>

              <div className="pt-2 flex items-center justify-center gap-2">
                <span className="chip-text bg-emerald-500/20 text-emerald-300 border-emerald-500/40">
                  +{wonItem.xp} XP Créature 🎉
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── HISTORIQUE DES TIRAGES ── */}
        {history.length > 0 && (
          <div className="border-t border-white/10 pt-4 space-y-3">
            <h4 className="font-display font-semibold text-xs text-foreground/70 flex items-center gap-1.5">
              <History className="h-3.5 w-3.5" /> Galerie des Lots Gagnés
            </h4>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {history.slice(0, 4).map((h, i) => {
                const conf = RARITY_CONFIG[h.rarity];
                return (
                  <div
                    key={`${h.id}-${i}`}
                    className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 text-left"
                  >
                    <span className="text-2xl shrink-0">{h.emoji}</span>
                    <div className="min-w-0 flex-1">
                      <h5 className="font-bold text-xs text-foreground truncate">
                        {h.title}
                      </h5>
                      <p className="text-[10px] text-foreground/50 truncate">
                        Gagné par {h.who === "paris" ? "Arthur 🇫🇷" : "Clara 🇺🇸"}
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
