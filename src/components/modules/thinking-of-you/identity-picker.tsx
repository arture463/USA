"use client";

import { motion } from "framer-motion";
import type { Identity } from "@/types";

/**
 * Écran de choix d'identité (affiché une seule fois par appareil).
 * Détermine à qui seront destinées les pensées envoyées.
 */

interface IdentityPickerProps {
  onPick: (id: Identity) => void;
}

// hoverBorder est une classe LITTÉRALE complète : indispensable pour que
// le JIT de Tailwind la génère (il ne lit pas les classes concaténées).
const OPTIONS: {
  id: Identity;
  label: string;
  emoji: string;
  hoverBorder: string;
}[] = [
  {
    id: "paris",
    label: "Moi, à Paris",
    emoji: "💜",
    hoverBorder: "hover:border-neon-violet/50",
  },
  {
    id: "raleigh",
    label: "Moi, à Raleigh",
    emoji: "💙",
    hoverBorder: "hover:border-neon-cyan/50",
  },
];

export function IdentityPicker({ onPick }: IdentityPickerProps) {
  return (
    <div className="panel-roomy text-center">
      <h3 className="font-display text-xl font-semibold">Qui es-tu ?</h3>
      <p className="mx-auto mt-2 max-w-sm text-sm text-foreground/50">
        Juste pour savoir vers qui envoyer tes pensées. C&apos;est mémorisé sur
        cet appareil, tu ne le choisiras qu&apos;une fois.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3">
        {OPTIONS.map((opt) => (
          <motion.button
            key={opt.id}
            type="button"
            whileHover={{ y: -4, scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onPick(opt.id)}
            className={`hairline focus-ring flex flex-col items-center gap-2 rounded-inner p-5 transition-colors ${opt.hoverBorder}`}
          >
            <span className="text-3xl">{opt.emoji}</span>
            <span className="text-sm font-medium">{opt.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
