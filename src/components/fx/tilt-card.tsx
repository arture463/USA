"use client";

import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useMotionTemplate,
} from "framer-motion";
import { useRef, type ReactNode, type MouseEvent } from "react";
import { cn } from "@/lib/utils";

/**
 * ── TILT CARD 3D ──
 * Carte "verre" qui pivote en vraie perspective 3D sous le curseur,
 * avec un reflet lumineux (glare) qui suit la souris et un contenu
 * légèrement surélevé (translateZ) pour l'effet de profondeur.
 *
 * 100% GPU (transform + spring Framer Motion), zéro re-render React
 * pendant le mouvement. Sur mobile (pas de hover), la carte reste
 * simplement une belle carte glass — aucune casse.
 */

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  /** Inclinaison max en degrés (défaut : 10) */
  maxTilt?: number;
}

export function TiltCard({ children, className, maxTilt = 10 }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  // Position du curseur normalisée dans la carte (0 → 1)
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);

  // Rotation avec inertie "spring" → mouvement organique, jamais sec
  const springCfg = { stiffness: 180, damping: 22, mass: 0.6 };
  const rotateX = useSpring(
    useTransform(my, [0, 1], [maxTilt, -maxTilt]),
    springCfg
  );
  const rotateY = useSpring(
    useTransform(mx, [0, 1], [-maxTilt, maxTilt]),
    springCfg
  );

  // Reflet lumineux : un dégradé radial centré sur le curseur
  const glareX = useTransform(mx, (v) => `${v * 100}%`);
  const glareY = useTransform(my, (v) => `${v * 100}%`);
  const glare = useMotionTemplate`radial-gradient(480px circle at ${glareX} ${glareY}, hsl(0 0% 100% / 0.09), transparent 45%)`;

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    mx.set((e.clientX - rect.left) / rect.width);
    my.set((e.clientY - rect.top) / rect.height);
  };

  const handleMouseLeave = () => {
    // Retour au repos, le spring gère la fluidité
    mx.set(0.5);
    my.set(0.5);
  };

  return (
    // Le parent porte la perspective — indispensable au rendu 3D
    <div style={{ perspective: 1100 }} className="w-full">
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className={cn("glass relative rounded-3xl", className)}
      >
        {/* Contenu surélevé de 40px dans l'espace 3D de la carte */}
        <div style={{ transform: "translateZ(40px)" }}>{children}</div>

        {/* Reflet qui suit le curseur */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-3xl"
          style={{ background: glare }}
        />
      </motion.div>
    </div>
  );
}
