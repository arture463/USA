"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Heart } from "lucide-react";
import { RETURN_DATE, DEPARTURE_DATE } from "@/lib/constants";

/**
 * Valeur numérique qui "roule" verticalement quand elle change.
 * `key={value}` fait sortir l'ancienne (vers le haut) et entrer la nouvelle.
 */
function RollingValue({ value }: { value: number }) {
  const label = String(value).padStart(2, "0");
  return (
    <span className="relative block h-[1.1em] overflow-hidden">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={label}
          initial={{ y: "-100%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="block"
        >
          {label}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/**
 * Compte à rebours jusqu'aux retrouvailles + barre de progression
 * du séjour (façon "mission progress" HUD).
 */

interface CountdownProps {
  now: Date;
}

/** Décompose des millisecondes en jours / heures / minutes / secondes. */
function breakdown(ms: number) {
  const clamped = Math.max(ms, 0);
  return {
    days: Math.floor(clamped / 86_400_000),
    hours: Math.floor((clamped / 3_600_000) % 24),
    minutes: Math.floor((clamped / 60_000) % 60),
    seconds: Math.floor((clamped / 1000) % 60),
  };
}

export function Countdown({ now }: CountdownProps) {
  const remaining = RETURN_DATE.getTime() - now.getTime();
  const { days, hours, minutes, seconds } = breakdown(remaining);

  // Progression du séjour, bornée entre 0 et 100 %
  const total = RETURN_DATE.getTime() - DEPARTURE_DATE.getTime();
  const elapsed = now.getTime() - DEPARTURE_DATE.getTime();
  const progress = Math.min(Math.max((elapsed / total) * 100, 0), 100);

  const units = [
    { value: days, label: "Jours" },
    { value: hours, label: "Heures" },
    { value: minutes, label: "Min" },
    { value: seconds, label: "Sec" },
  ];

  return (
    <div className="panel text-center">
      <p className="eyebrow mb-4 text-neon-rose">
        <Heart className="h-4 w-4 animate-pulse" fill="currentColor" />
        Retrouvailles dans
      </p>

      {/* Les 4 compteurs */}
      <div className="grid grid-cols-4 gap-2 sm:gap-3">
        {units.map((u) => (
          <div key={u.label} className="hairline rounded-inner py-3">
            <p className="numeral text-glow text-2xl sm:text-4xl">
              <RollingValue value={u.value} />
            </p>
            <p className="label-micro mt-1">{u.label}</p>
          </div>
        ))}
      </div>

      {/* Barre de progression du séjour */}
      <div className="mt-6">
        <div className="label-micro mb-1.5 flex justify-between">
          <span>Mission USA</span>
          <span>{progress.toFixed(1)}%</span>
        </div>
        <div className="track">
          <motion.div
            className="track-fill"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        </div>
      </div>
    </div>
  );
}
