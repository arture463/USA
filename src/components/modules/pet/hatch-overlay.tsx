"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";
import { SPECIES, type Species } from "@/lib/pet-data";
import { useModal } from "@/hooks/use-modal";
import { EASE_OUT_EXPO } from "@/lib/motion";
import { Creature } from "./creature";
import { Egg } from "./egg";

/**
 * Cérémonie d'éclosion — le seul moment "événement" du module.
 *
 * Déroulé : l'œuf tremble (1,4 s) → flash blanc → la créature apparaît
 * avec confettis à sa couleur. Ne se joue qu'une fois, à l'instant où
 * l'espèce passe de null à une valeur (voir `justHatched` dans use-pet).
 */

interface HatchOverlayProps {
  species: Species | null;
  open: boolean;
  onClose: () => void;
}

type Phase = "shaking" | "flash" | "reveal";

export function HatchOverlay({ species, open, onClose }: HatchOverlayProps) {
  const overlayRef = useModal<HTMLDivElement>(open, onClose);

  return (
    <AnimatePresence>
      {open && species && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          ref={overlayRef}
          role="dialog"
          aria-modal="true"
          aria-label="Éclosion"
          tabIndex={-1}
          onClick={onClose}
          className="fixed inset-0 z-[70] flex flex-col items-center justify-center bg-black/90 p-6 text-center outline-none backdrop-blur-xl"
        >
          {/* La séquence est un composant enfant : monté seulement quand
              l'overlay s'ouvre, il repart donc naturellement de "shaking"
              sans qu'on ait à réinitialiser un état. */}
          <HatchSequence species={species} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Les trois temps de l'éclosion : tremblement → flash → révélation. */
function HatchSequence({ species }: { species: Species }) {
  const [phase, setPhase] = useState<Phase>("shaking");
  const meta = SPECIES[species];

  // Enchaînement
  useEffect(() => {
    const toFlash = window.setTimeout(() => setPhase("flash"), 1400);
    const toReveal = window.setTimeout(() => setPhase("reveal"), 1750);
    return () => {
      window.clearTimeout(toFlash);
      window.clearTimeout(toReveal);
    };
  }, []);

  // Confettis à la couleur de l'espèce, au moment de la révélation
  useEffect(() => {
    if (phase !== "reveal") return;
    const colors = [meta.accent, "#ffffff", "#a855f7", "#22d3ee"];
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { x: 0.5, y: 0.62 },
      colors,
    });
    const second = window.setTimeout(
      () =>
        confetti({
          particleCount: 70,
          spread: 110,
          startVelocity: 34,
          origin: { x: 0.5, y: 0.5 },
          colors,
        }),
      260
    );
    return () => window.clearTimeout(second);
  }, [phase, meta.accent]);

  return (
    <>
      {/* Flash blanc au moment de la cassure */}
      <AnimatePresence>
            {phase === "flash" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="pointer-events-none absolute inset-0 bg-white"
              />
            )}
          </AnimatePresence>

          <div className="relative h-56 w-56 sm:h-64 sm:w-64">
            <AnimatePresence mode="wait">
              {phase === "reveal" ? (
                <motion.div
                  key="creature"
                  initial={{ scale: 0.3, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.8, ease: EASE_OUT_EXPO }}
                  className="h-full w-full"
                >
                  <Creature
                    species={species}
                    stage="baby"
                    mood="happy"
                    celebrating
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="egg"
                  exit={{ opacity: 0, scale: 1.2 }}
                  className="h-full w-full"
                >
                  <Egg signatures={2} hatching />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <AnimatePresence>
            {phase === "reveal" && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.7, ease: EASE_OUT_EXPO }}
                className="relative mt-4 max-w-sm"
              >
                <p className="eyebrow mb-2" style={{ color: meta.accent }}>
                  Il a éclos
                </p>
                <h2 className="heading-section">{meta.label}</h2>
                <p className="mt-3 text-sm text-foreground/60">{meta.intro}</p>
                <p className="label-micro mt-6">Touche l&apos;écran pour continuer</p>
              </motion.div>
            )}
          </AnimatePresence>
    </>
  );
}
