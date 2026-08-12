"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * L'œuf, avant l'éclosion.
 *
 * Il ne réagit pas à l'expérience mais aux SIGNATURES : il faut que Paris
 * ET Raleigh l'aient nourri au moins une fois. Chaque signature ouvre une
 * fissure — ce qui rend l'attente lisible sans jauge de chiffres.
 */

interface EggProps {
  /** 0, 1 ou 2 — nombre de personnes qui l'ont déjà nourri */
  signatures: number;
  /** Tremblement continu (coupé si animations réduites) */
  animate?: boolean;
  /** Tremblement violent : l'éclosion est en cours */
  hatching?: boolean;
  className?: string;
}

export function Egg({
  signatures,
  animate = true,
  hatching = false,
  className,
}: EggProps) {
  const uid = useId().replace(/:/g, "");

  return (
    <motion.svg
      viewBox="0 0 200 200"
      role="img"
      aria-label={`Œuf, ${signatures} personne${signatures > 1 ? "s" : ""} sur 2 l'a nourri`}
      className={cn("h-full w-full", className)}
      style={{ filter: "drop-shadow(0 6px 28px hsl(265 90% 65% / 0.35))" }}
      animate={
        !animate
          ? undefined
          : hatching
            ? { rotate: [0, -7, 7, -6, 6, -3, 3, 0], y: [0, -4, 0, -3, 0] }
            : { rotate: [0, -1.6, 0, 1.6, 0], y: [0, -2, 0] }
      }
      transition={
        hatching
          ? { duration: 0.55, repeat: Infinity, ease: "easeInOut" }
          : { duration: 5, repeat: Infinity, ease: "easeInOut" }
      }
    >
      <defs>
        <radialGradient id={`shell-${uid}`} cx="36%" cy="26%" r="80%">
          <stop offset="0%" stopColor="hsl(265 90% 78%)" stopOpacity="0.7" />
          <stop offset="55%" stopColor="hsl(265 90% 65%)" stopOpacity="0.3" />
          <stop offset="100%" stopColor="hsl(190 95% 60%)" stopOpacity="0.18" />
        </radialGradient>
        <radialGradient id={`gloss-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="hsl(0 0% 100%)" stopOpacity="0.4" />
          <stop offset="100%" stopColor="hsl(0 0% 100%)" stopOpacity="0" />
        </radialGradient>
        {/* Lueur qui s'échappe des fissures */}
        <radialGradient id={`core-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="hsl(48 100% 80%)" stopOpacity="0.95" />
          <stop offset="100%" stopColor="hsl(48 100% 70%)" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Ombre au sol */}
      <ellipse cx="100" cy="176" rx="34" ry="7" fill="hsl(240 30% 2%)" opacity="0.45" />

      {/* La coquille — un ovale asymétrique, plus large en bas */}
      <path
        d="M 100 26
           C 132 26 152 74 152 108
           C 152 146 128 172 100 172
           C 72 172 48 146 48 108
           C 48 74 68 26 100 26 Z"
        fill={`url(#shell-${uid})`}
        stroke="hsl(265 90% 75%)"
        strokeOpacity="0.55"
        strokeWidth="1.8"
      />

      {/* Reflet en haut à gauche : donne le côté "poli" */}
      <ellipse cx="82" cy="66" rx="20" ry="26" fill={`url(#gloss-${uid})`} />

      {/* Motif de taches, façon œuf de caille */}
      <g fill="hsl(190 95% 70%)" fillOpacity="0.22">
        <ellipse cx="78" cy="104" rx="7" ry="5" />
        <ellipse cx="120" cy="88" rx="5" ry="4" />
        <ellipse cx="112" cy="130" rx="6.5" ry="4.5" />
        <ellipse cx="86" cy="142" rx="4.5" ry="3.5" />
        <ellipse cx="126" cy="112" rx="4" ry="3" />
      </g>

      {/* ── Fissures : une par personne qui a nourri ── */}
      {signatures >= 1 && <Crack uid={uid} d="M 72 78 l 9 11 l -7 9 l 11 8" />}
      {signatures >= 2 && (
        <Crack uid={uid} d="M 130 122 l -10 9 l 8 10 l -11 7" delay={0.15} />
      )}

      {/* Le cœur lumineux, d'autant plus visible que l'œuf est prêt */}
      {signatures >= 1 && (
        <motion.ellipse
          cx="100"
          cy="104"
          rx="26"
          ry="30"
          fill={`url(#core-${uid})`}
          animate={
            animate
              ? { opacity: signatures >= 2 ? [0.35, 0.7, 0.35] : [0.12, 0.28, 0.12] }
              : { opacity: signatures >= 2 ? 0.5 : 0.2 }
          }
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
    </motion.svg>
  );
}

/** Une fissure : un trait sombre doublé d'un liseré lumineux. */
function Crack({
  uid,
  d,
  delay = 0,
}: {
  uid: string;
  d: string;
  delay?: number;
}) {
  return (
    <g key={`${uid}-${d}`}>
      {/* Halo chaud qui fuit de la fêlure */}
      <motion.path
        d={d}
        fill="none"
        stroke="hsl(48 100% 75%)"
        strokeOpacity="0.75"
        strokeWidth="5"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.9, delay, ease: "easeOut" }}
        style={{ filter: "blur(2.5px)" }}
      />
      {/* La cassure elle-même */}
      <motion.path
        d={d}
        fill="none"
        stroke="hsl(240 20% 6%)"
        strokeOpacity="0.8"
        strokeWidth="2"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.9, delay, ease: "easeOut" }}
      />
    </g>
  );
}
