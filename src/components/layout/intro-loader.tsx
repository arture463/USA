"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

/**
 * Intro cinématique au premier chargement (une fois par session).
 * Overlay plein écran : le lien Paris↔Raleigh "s'établit", puis l'écran
 * se dissipe (fondu + léger zoom/flou) pour révéler le site.
 *
 * Respecte prefers-reduced-motion (skippé) et ne rejoue pas dans la session.
 */
const DURATION_MS = 2400;

export function IntroLoader() {
  const reduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (reduced) return;
    try {
      if (sessionStorage.getItem("intro-seen")) return;
    } catch {
      /* storage indisponible → on montre quand même */
    }
    setMounted(true);
    const t1 = window.setTimeout(() => {
      setDone(true);
      try {
        sessionStorage.setItem("intro-seen", "1");
      } catch {
        /* ignore */
      }
    }, DURATION_MS);

    const t2 = window.setTimeout(() => {
      setMounted(false);
    }, DURATION_MS + 900);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [reduced]);

  if (!mounted) return null;

  return (
    <AnimatePresence onExitComplete={() => setMounted(false)}>
      {!done && (
        <motion.div
          key="intro"
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background"
          exit={{ opacity: 0, scale: 1.08, filter: "blur(10px)" }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Halo central */}
          <div
            aria-hidden
            className="pointer-events-none absolute h-[40vmax] w-[40vmax] rounded-full opacity-40 blur-[100px]"
            style={{
              background:
                "radial-gradient(circle, hsl(265 90% 60% / 0.6), hsl(190 95% 55% / 0.2) 60%, transparent 75%)",
            }}
          />

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.6 }}
            className="relative mb-6 font-mono text-[11px] uppercase tracking-[0.4em] text-neon-cyan"
          >
            Établissement du lien
          </motion.p>

          {/* Paris ● ————————— ● Raleigh (la ligne se trace) */}
          <div className="relative mb-8 flex items-center gap-3">
            <span className="h-2 w-2 rounded-full bg-neon-violet shadow-[0_0_12px] shadow-neon-violet" />
            <div className="relative h-[2px] w-40 overflow-hidden rounded-full bg-white/10 sm:w-56">
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-neon-violet via-neon-cyan to-neon-rose"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ delay: 0.3, duration: 1.6, ease: "easeInOut" }}
              />
            </div>
            <span className="h-2 w-2 rounded-full bg-neon-cyan shadow-[0_0_12px] shadow-neon-cyan" />
          </div>

          <motion.h1
            initial={{ opacity: 0, filter: "blur(8px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            transition={{ delay: 0.6, duration: 0.9 }}
            className="animate-text-shimmer bg-gradient-to-r from-neon-violet via-neon-cyan to-neon-rose bg-clip-text text-center font-display text-3xl font-bold tracking-tight text-transparent sm:text-5xl"
            style={{ backgroundSize: "200% auto" }}
          >
            Us, across the ocean
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 0.6 }}
            className="relative mt-4 font-mono text-[10px] uppercase tracking-[0.3em] text-foreground/40"
          >
            Paris · Raleigh
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
