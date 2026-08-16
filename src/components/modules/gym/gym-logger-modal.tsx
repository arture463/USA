"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Dumbbell, Sparkles, X } from "lucide-react";
import { WORKOUT_INFO, type WorkoutType } from "@/lib/gym-data";
import type { Identity } from "@/types";

interface GymLoggerModalProps {
  open: boolean;
  onClose: () => void;
  onLog: (who: Identity, type: WorkoutType, notes?: string) => Promise<void>;
  currentIdentity: Identity;
}

/**
 * Modale de saisie d'une séance de musculation.
 * L'identité est automatiquement détectée (Arthur 🇫🇷 ou Clara 🇺🇸)
 * → pas besoin de choisir manuellement.
 */
export function GymLoggerModal({
  open,
  onClose,
  onLog,
  currentIdentity,
}: GymLoggerModalProps) {
  const [selectedType, setSelectedType] = useState<WorkoutType>("push");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isArthur = currentIdentity === "paris";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      await onLog(currentIdentity, selectedType, notes.trim() || undefined);
      setNotes("");
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/80 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="panel-tight relative z-10 w-full max-w-lg border-amber-500/30 shadow-2xl"
          >
            <button
              type="button"
              onClick={onClose}
              className="btn-ghost btn-icon-sm absolute right-4 top-4"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
                <Dumbbell className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold">
                  Enregistrer une Séance
                </h3>
                <p className="text-xs text-foreground/50 flex items-center gap-1.5">
                  Séance pour
                  <span className={`font-bold ${isArthur ? "text-neon-cyan" : "text-neon-rose"}`}>
                    {isArthur ? "Arthur 🇫🇷" : "Clara 🇺🇸"}
                  </span>
                  — détecté automatiquement
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Type de séance (Push / Pull / Legs / Cardio) */}
              <div>
                <label className="label-micro mb-2 block">
                  Type de séance
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {(Object.keys(WORKOUT_INFO) as WorkoutType[]).map((t) => {
                    const info = WORKOUT_INFO[t];
                    const active = selectedType === t;
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setSelectedType(t)}
                        className={`flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition-all ${
                          active
                            ? "border-amber-400 bg-amber-400/10 shadow-[0_0_15px_rgba(251,191,36,0.2)]"
                            : "border-white/10 bg-white/5 hover:border-white/20"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-semibold text-sm">
                          <span>{info.emoji}</span>
                          <span style={{ color: active ? info.color : undefined }}>
                            {info.label}
                          </span>
                          <span className="rounded bg-amber-500/20 px-1.5 py-0.5 font-mono text-[10px] text-amber-300 font-bold">
                            +{info.xp} XP
                          </span>
                        </div>
                        <p className="text-[11px] text-foreground/50">
                          {info.muscles}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Notes / PR */}
              <div>
                <label className="label-micro mb-1 block">
                  Notes ou Record Personnel (optionnel)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="ex: Nouveau PR développé couché 80kg ! 🔥"
                  className="field w-full"
                />
              </div>

              {/* Submit */}
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-ghost text-xs"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-neon btn-sm gap-1 bg-amber-500 text-black hover:bg-amber-400 border-amber-400"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  {submitting ? "Envoi…" : "Valider & Fondre les muscles !"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
