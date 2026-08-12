"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

/**
 * Spotlight qui suit le curseur (effet "new-gen").
 *
 * ⚡ Version optimisée : un élément de taille FIXE avec un dégradé STATIQUE,
 * déplacé uniquement par `transform: translate` (composité par le GPU).
 * → Aucune reconstruction de dégradé ni repaint plein écran à chaque frame,
 *   contrairement à une approche qui recalcule le `background`.
 *
 * Désactivé sur tactile et si l'utilisateur préfère moins d'animations.
 */

const SIZE = 640; // diamètre du halo (px)

export function CursorGlow() {
  const reduced = useReducedMotion();
  const [enabled, setEnabled] = useState(false);

  // On centre le halo sur le curseur → position = souris - SIZE/2
  const x = useMotionValue(-SIZE);
  const y = useMotionValue(-SIZE);
  const sx = useSpring(x, { stiffness: 200, damping: 30, mass: 0.5 });
  const sy = useSpring(y, { stiffness: 200, damping: 30, mass: 0.5 });

  useEffect(() => {
    if (reduced || !window.matchMedia("(pointer: fine)").matches) return;
    setEnabled(true);
    const move = (e: MouseEvent) => {
      x.set(e.clientX - SIZE / 2);
      y.set(e.clientY - SIZE / 2);
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [reduced, x, y]);

  if (!enabled) return null;

  return (
    <motion.div
      aria-hidden
      style={{
        x: sx,
        y: sy,
        width: SIZE,
        height: SIZE,
        // Dégradé statique : peint une seule fois, jamais recalculé
        background:
          "radial-gradient(circle, hsl(265 90% 65% / 0.13), transparent 70%)",
      }}
      className="pointer-events-none fixed left-0 top-0 z-30 rounded-full mix-blend-screen will-change-transform"
    />
  );
}
