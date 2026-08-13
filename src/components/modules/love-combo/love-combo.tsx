"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Zap, Flame, Trophy, Sparkles, Send, Volume2 } from "lucide-react";
import confetti from "canvas-confetti";
import { revealOnScroll } from "@/lib/motion";
import { SectionHeading } from "@/components/ui/section-heading";
import { useIdentity } from "@/hooks/use-identity";
import { usePetFeeder } from "@/hooks/use-pet";
import { supabase } from "@/lib/supabase/client";

interface FloatingHeart {
  id: number;
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

export function LoveCombo() {
  const { identity } = useIdentity();
  const feedPet = usePetFeeder(identity);
  const [comboCount, setComboCount] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [floatingHearts, setFloatingHearts] = useState<FloatingHeart[]>([]);
  const [liveSender, setLiveSender] = useState<string | null>(null);
  const [liveTaps, setLiveTaps] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Sound generator for rapid taps
  const playTapPitch = (combo: number) => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") void ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      const pitch = 300 + Math.min(combo * 15, 1200);
      osc.frequency.setValueAtTime(pitch, ctx.currentTime);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {}
  };

  // Synchronisation Realtime des vagues d'amour
  useEffect(() => {
    const channel = supabase
      .channel("realtime:love_combo")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "thoughts" },
        (payload) => {
          const rec = payload.new as { sender: string; thought_type: string; message: string };
          if (rec.thought_type === "love_combo") {
            const taps = parseInt(rec.message || "10", 10);
            setLiveSender(rec.sender);
            setLiveTaps(taps);
            void confetti({
              particleCount: Math.min(taps * 2, 100),
              spread: 80,
              origin: { y: 0.5 },
            });
            setTimeout(() => setLiveSender(null), 4000);
          }
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  const handleTap = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newCombo = comboCount + 1;
    setComboCount(newCombo);
    if (newCombo > maxCombo) setMaxCombo(newCombo);

    playTapPitch(newCombo);

    // Ajouter un cœur volant
    const heartId = Date.now() + Math.random();
    setFloatingHearts((prev) => [
      ...prev.slice(-15),
      {
        id: heartId,
        x: x + (Math.random() * 40 - 20),
        y: y + (Math.random() * 40 - 20),
        scale: 0.8 + Math.random() * 0.6,
        rotation: Math.random() * 40 - 20,
      },
    ]);

    // Paliers Dopamine Confetti
    if (newCombo === 10 || newCombo === 25 || newCombo === 50 || newCombo === 100) {
      void confetti({
        particleCount: newCombo * 2,
        spread: 60 + newCombo,
        origin: { y: 0.6 },
      });
      void feedPet(Math.floor(newCombo / 5), null, "together");
    }

    // Reset du combo après 2 secondes d'inactivité + envoi du combo final à l'autre !
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      if (newCombo >= 5) {
        try {
          await supabase.from("thoughts").insert({
            sender: identity,
            recipient: identity === "paris" ? "raleigh" : "paris",
            thought_type: "love_combo",
            message: String(newCombo),
          });
        } catch {}
      }
      setComboCount(0);
    }, 2000);
  };

  return (
    <motion.section {...revealOnScroll} className="w-full">
      <SectionHeading
        eyebrow="Générateur d'Amour Accéléré 💖⚡"
        icon={Heart}
        title="L'Amour-o-Mètre"
        titleAccent="Combo Tap"
        subtitle="Tapotez le cœur le plus vite possible pour créer une vague de combos et l'envoyer en direct !"
        accent="rose"
      />

      <div className="panel-roomy relative overflow-hidden space-y-6 text-center">
        {/* Toast Vague reçue en direct */}
        <AnimatePresence>
          {liveSender && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -10 }}
              className="rounded-2xl border border-pink-500/50 bg-gradient-to-r from-pink-950/80 to-purple-950/80 p-4 shadow-[0_0_30px_rgba(244,114,182,0.4)] backdrop-blur-md flex items-center justify-center gap-3"
            >
              <Heart className="h-6 w-6 text-pink-400 animate-ping" />
              <div>
                <h4 className="font-display font-bold text-sm text-pink-300">
                  {liveSender === "paris" ? "Arthur 🇫🇷" : "Clara 🇺🇸"} VIRTUAL LOVE WAVE !
                </h4>
                <p className="text-xs text-foreground/80 font-mono">
                  {liveTaps} Cœurs envoyés à la vitesse du son ! 🔥
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── LE GROS BOUTON CŒUR DOPAMINE ── */}
        <div className="relative flex flex-col items-center justify-center py-6">
          {/* Aura de Combo d'Énergie */}
          <div
            className={`pointer-events-none absolute h-64 w-64 rounded-full transition-all duration-300 ${
              comboCount > 50
                ? "bg-rose-500/40 blur-3xl scale-125"
                : comboCount > 20
                ? "bg-pink-500/30 blur-2xl scale-110"
                : comboCount > 5
                ? "bg-purple-500/20 blur-xl scale-100"
                : "bg-transparent"
            }`}
          />

          {/* Bouton Cœur avec effet Pulsation */}
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={handleTap}
            className={`relative flex h-40 w-40 sm:h-48 sm:w-48 items-center justify-center rounded-full border-4 shadow-2xl transition-all select-none cursor-pointer ${
              comboCount > 50
                ? "border-rose-400 bg-gradient-to-tr from-rose-600 via-pink-500 to-amber-400 shadow-[0_0_60px_rgba(244,63,94,0.8)]"
                : comboCount > 20
                ? "border-pink-400 bg-gradient-to-tr from-pink-600 to-rose-500 shadow-[0_0_45px_rgba(236,72,153,0.6)]"
                : comboCount > 5
                ? "border-purple-400 bg-gradient-to-tr from-purple-600 to-pink-500 shadow-[0_0_30px_rgba(168,85,247,0.4)]"
                : "border-white/30 bg-gradient-to-tr from-slate-900 via-rose-950/50 to-slate-900 shadow-[0_0_20px_rgba(244,63,94,0.2)]"
            }`}
          >
            <Heart
              className={`h-20 w-20 sm:h-24 sm:w-24 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.8)] transition-all ${
                comboCount > 0 ? "scale-110 animate-bounce" : ""
              }`}
            />

            {/* Cœurs volants au clic */}
            <AnimatePresence>
              {floatingHearts.map((h) => (
                <motion.div
                  key={h.id}
                  initial={{ opacity: 1, y: 0, scale: h.scale, rotate: h.rotation }}
                  animate={{ opacity: 0, y: -120, scale: h.scale * 1.4 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="pointer-events-none absolute text-2xl"
                  style={{ left: h.x, top: h.y }}
                >
                  💖
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.button>

          {/* Affichage du Combo */}
          <div className="mt-4 space-y-1">
            <motion.div
              key={comboCount}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="font-display font-black text-3xl sm:text-4xl text-rose-400 drop-shadow-[0_0_10px_#fb7185] flex items-center justify-center gap-2"
            >
              <Zap className="h-6 w-6 text-amber-400 animate-bounce" />
              COMBO x{comboCount}
            </motion.div>

            <p className="text-xs text-foreground/60">
              {comboCount === 0
                ? "Tapotez le cœur plusieurs fois de suite !"
                : comboCount > 50
                ? "🔥 SUPERNOVA D'AMOUR UNSTOPPABLE !"
                : comboCount > 20
                ? "⚡ VAGUE DE CHOCK AMOUR DÉCHAÎNÉE !"
                : "💖 La flamme monte..."}
            </p>
          </div>
        </div>

        {/* Record de Combo */}
        {maxCombo > 0 && (
          <div className="flex items-center justify-center gap-2 font-mono text-xs text-amber-300/80">
            <Trophy className="h-4 w-4 text-amber-400" />
            Meilleur Combo de la session : x{maxCombo} !
          </div>
        )}
      </div>
    </motion.section>
  );
}
