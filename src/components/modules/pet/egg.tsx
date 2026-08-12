"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

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
    <div className={cn("relative flex items-center justify-center p-4", className)}>
      {/* HaloCosmique arrière-plan */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute h-56 w-56 rounded-full bg-gradient-to-r from-neon-violet/35 via-neon-cyan/25 to-neon-rose/30 blur-3xl"
        animate={{
          scale: [0.9, 1.15, 0.9],
          opacity: [0.4, 0.75, 0.4],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative h-56 w-56 sm:h-64 sm:w-64">
        <motion.div
          className="relative h-full w-full overflow-hidden rounded-[42%_42%_50%_50%] border-2 border-white/20 shadow-[0_0_40px_rgba(168,85,247,0.4)] backdrop-blur-sm"
          animate={
            !animate
              ? undefined
              : hatching
                ? { rotate: [0, -8, 8, -6, 6, -3, 3, 0], y: [0, -6, 0, -4, 0] }
                : { rotate: [0, -2, 0, 2, 0], y: [0, -3, 0] }
          }
          transition={
            hatching
              ? { duration: 0.55, repeat: Infinity, ease: "easeInOut" }
              : { duration: 4.5, repeat: Infinity, ease: "easeInOut" }
          }
        >
          {/* Image d'illustration 3D Cosmic Egg */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/pet/egg.jpg"
            alt="Œuf cosmique"
            className="h-full w-full object-cover brightness-105 contrast-110 transition-transform duration-700 hover:scale-105"
          />

          {/* Superposition d'éclat lumineux */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent" />

          {/* Fissures SVG interactives plaquées sur l'image */}
          <svg
            viewBox="0 0 200 200"
            className="pointer-events-none absolute inset-0 h-full w-full"
          >
            {signatures >= 1 && (
              <Crack uid={uid} d="M 72 78 l 9 11 l -7 9 l 11 8" />
            )}
            {signatures >= 2 && (
              <Crack uid={uid} d="M 130 122 l -10 9 l 8 10 l -11 7" delay={0.15} />
            )}
          </svg>
        </motion.div>
      </div>
    </div>
  );
}

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
      <motion.path
        d={d}
        fill="none"
        stroke="hsl(48 100% 75%)"
        strokeOpacity="0.9"
        strokeWidth="6"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.9, delay, ease: "easeOut" }}
        style={{ filter: "blur(3px)" }}
      />
      <motion.path
        d={d}
        fill="none"
        stroke="#ffffff"
        strokeOpacity="1"
        strokeWidth="2.5"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.9, delay, ease: "easeOut" }}
      />
    </g>
  );
}
