"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe2, RotateCcw } from "lucide-react";
import { DISTANCE_KM } from "@/lib/constants";
import { DURATION, EASE_OUT_EXPO } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { SectionHeading } from "@/components/ui/section-heading";
import { ModuleErrorBoundary } from "@/components/ui/error-boundary";
import type { CityKey } from "./globe-scene";

const GlobeScene = dynamic(() => import("./globe-scene"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center">
      <div className="h-40 w-40 animate-pulse-glow rounded-full bg-neon-violet/10 blur-2xl" />
    </div>
  ),
});

export function Globe() {
  const [focusCity, setFocusCity] = useState<CityKey | null>(null);

  return (
    <motion.section
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: DURATION.cinematic, ease: EASE_OUT_EXPO }}
      className="relative w-full"
    >
      <SectionHeading
        eyebrow="Liaison orbitale"
        icon={Globe2}
        title="Un arc entre"
        titleAccent="nous deux"
        subtitle="Touche une ville pour la centrer, ou fais tourner la Terre."
        accent="cyan"
      />

      <div className="relative h-[380px] w-full sm:h-[480px]">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-[70%] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60 blur-[70px]"
          style={{
            background:
              "radial-gradient(circle, hsl(265 90% 60% / 0.55), hsl(190 95% 55% / 0.25) 55%, transparent 70%)",
          }}
        />
        <div className="relative h-full w-full cursor-grab active:cursor-grabbing">
          <ModuleErrorBoundary fallbackTitle="Globe 3D non supporté sur ce navigateur">
            <GlobeScene focusCity={focusCity} onFocusCity={setFocusCity} />
          </ModuleErrorBoundary>
        </div>

        <AnimatePresence>
          {focusCity && (
            <motion.button
              type="button"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              onClick={() => setFocusCity(null)}
              className="btn-ghost btn-pill focus-ring absolute right-3 top-3 gap-1.5 px-3 py-1.5 font-mono text-[10px] uppercase tracking-micro backdrop-blur-md"
            >
              <RotateCcw className="h-3 w-3" />
              Vue libre
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-center gap-3 font-mono text-[10px] uppercase tracking-micro sm:text-[11px]">
        <button
          type="button"
          onClick={() => setFocusCity("paris")}
          className={cn(
            "focus-ring flex items-center gap-1.5 rounded-full px-2.5 py-1 transition-colors",
            focusCity === "paris"
              ? "bg-neon-violet/15 text-neon-violet ring-1 ring-neon-violet/40"
              : "text-neon-violet/80 hover:text-neon-violet"
          )}
        >
          <span className="dot-glow bg-neon-violet text-neon-violet" />
          Paris
        </button>

        <span className="text-foreground/40">
          ─── {DISTANCE_KM.toLocaleString("fr-FR")} km ───
        </span>

        <button
          type="button"
          onClick={() => setFocusCity("raleigh")}
          className={cn(
            "focus-ring flex items-center gap-1.5 rounded-full px-2.5 py-1 transition-colors",
            focusCity === "raleigh"
              ? "bg-neon-cyan/15 text-neon-cyan ring-1 ring-neon-cyan/40"
              : "text-neon-cyan/80 hover:text-neon-cyan"
          )}
        >
          <span className="dot-glow bg-neon-cyan text-neon-cyan" />
          Raleigh
        </button>
      </div>

      <p className="label-micro mt-1 text-center">
        Touche une ville · glisse pour explorer
      </p>
    </motion.section>
  );
}
