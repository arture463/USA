"use client";

import { useEffect } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { MapPin, ChevronDown } from "lucide-react";
import { DISTANCE_KM } from "@/lib/constants";
import { fadeUpBlur } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

/**
 * Hero cinématique :
 *  - titre au dégradé qui ondule en continu (animate-text-shimmer)
 *  - parallaxe subtile du contenu selon la position de la souris (desktop)
 *  - entrées séquencées avec dé-flou (variants `fadeUpBlur` du design system)
 *  - indicateur de scroll animé
 */
export function Hero() {
  const reduced = useReducedMotion();

  // Parallaxe : position souris normalisée (-0.5 → 0.5) → petit décalage lissé
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const tx = useSpring(useTransform(mx, [-0.5, 0.5], [14, -14]), {
    stiffness: 120,
    damping: 20,
  });
  const ty = useSpring(useTransform(my, [-0.5, 0.5], [10, -10]), {
    stiffness: 120,
    damping: 20,
  });

  useEffect(() => {
    if (reduced || !window.matchMedia("(pointer: fine)").matches) return;
    const onMove = (e: MouseEvent) => {
      mx.set(e.clientX / window.innerWidth - 0.5);
      my.set(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [reduced, mx, my]);

  const goToFirstSection = () =>
    document
      .getElementById("time")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <header className="relative flex min-h-[88vh] flex-col items-center justify-center text-center">
      <motion.div style={{ x: tx, y: ty }}>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="eyebrow mb-4 text-neon-cyan"
        >
          <MapPin className="h-3.5 w-3.5" />
          Paris — {DISTANCE_KM.toLocaleString("fr-FR")} km — Raleigh
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.25 }}
          className="animate-text-shimmer bg-gradient-to-r from-neon-violet via-neon-cyan to-neon-rose bg-clip-text font-display text-5xl font-bold tracking-tight text-transparent sm:text-7xl"
          style={{ backgroundSize: "200% auto" }}
        >
          Us, across
          <br />
          the ocean
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-5 text-balance text-sm text-muted-foreground sm:text-base"
        >
          Un océan entre nous. Aucune distance entre nos deux écrans.
        </motion.p>
      </motion.div>

      {/* Indicateur de scroll */}
      <motion.button
        type="button"
        onClick={goToFirstSection}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1, duration: 0.8 }}
        aria-label="Défiler vers le contenu"
        className="focus-ring absolute bottom-24 flex flex-col items-center gap-1 rounded-lg p-2 text-foreground/40 transition-colors hover:text-foreground/70"
      >
        <span className="label-micro text-inherit">Explore</span>
        <ChevronDown className="h-5 w-5 animate-scroll-cue" />
      </motion.button>
    </header>
  );
}
