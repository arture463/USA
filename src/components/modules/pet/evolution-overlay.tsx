"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";
import {
  SPECIES,
  STAGE_LABEL,
  TYPES,
  type PetType,
  type Species,
  type Stage,
} from "@/lib/pet-data";
import { useModal } from "@/hooks/use-modal";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { playEvolution } from "@/lib/chime";
import { EASE_OUT_EXPO } from "@/lib/motion";
import { Creature } from "./creature";

/**
 * ÉVOLUTION — hommage assumé aux évolutions Pokémon.
 *
 * Quatre temps :
 *  1. CHARGE      (0 → 1,1 s)  fond noir, rayons de lumière qui tournent,
 *                              la créature encore en couleur
 *  2. CLIGNOTEMENT(1,1 → 4,2 s) elle devient une ombre chinoise blanche qui
 *                              alterne entre l'ANCIENNE et la NOUVELLE
 *                              silhouette, de plus en plus vite. C'est le
 *                              cœur de l'effet : il ne fonctionne que parce
 *                              que chaque stade a un contour différent.
 *  3. FLASH       (4,2 → 4,7 s) l'écran blanchit, les rayons accélèrent
 *  4. RÉVÉLATION  (4,7 s →)    la nouvelle forme en couleur, confettis,
 *                              « X a évolué ! »
 *
 * Animations réduites : on saute directement à la révélation, sans
 * clignotement ni rayons.
 */

type Phase = "charge" | "flicker" | "flash" | "reveal";

/** Intervalles du clignotement, en ms — ils se resserrent : l'accélération. */
const FLICKER_STEPS = [
  420, 400, 360, 330, 290, 260, 230, 200, 175, 150, 130, 115, 100, 90, 80, 72,
  66, 60, 56, 52, 48,
];

interface EvolutionOverlayProps {
  species: Species | null;
  /** Nature APRÈS l'évolution (elle vient peut-être de changer) */
  type: PetType | null;
  /** Nature AVANT — si elle diffère, on l'annonce comme un changement */
  previousType: PetType | null;
  from: Exclude<Stage, "egg"> | null;
  to: Exclude<Stage, "egg"> | null;
  /** Prénom de la créature, pour le texte final */
  name: string | null;
  /**
   * Change à chaque nouvelle évolution. Sert de `key` à la séquence : sans
   * ça, déclencher une évolution alors que l'overlay est DÉJÀ ouvert ne
   * remonterait pas l'enfant, et l'animation ne serait pas rejouée.
   */
  runKey: number;
  open: boolean;
  onClose: () => void;
}

export function EvolutionOverlay({
  species,
  type,
  previousType,
  from,
  to,
  name,
  runKey,
  open,
  onClose,
}: EvolutionOverlayProps) {
  const overlayRef = useModal<HTMLDivElement>(open, onClose);
  const ready = open && species !== null && from !== null && to !== null;

  return (
    <AnimatePresence>
      {ready && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          ref={overlayRef}
          role="dialog"
          aria-modal="true"
          aria-label="Évolution"
          tabIndex={-1}
          onClick={onClose}
          className="fixed inset-0 z-[80] flex flex-col items-center justify-center overflow-hidden bg-black p-6 text-center outline-none"
        >
          {/* Séquence dans un enfant keyé : elle repart de zéro à chaque
              évolution, sans jamais réinitialiser d'état à la main. */}
          <Sequence
            key={runKey}
            species={species}
            type={type}
            previousType={previousType}
            from={from}
            to={to}
            name={name}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Sequence({
  species,
  type,
  previousType,
  from,
  to,
  name,
}: {
  species: Species;
  type: PetType | null;
  previousType: PetType | null;
  from: Exclude<Stage, "egg">;
  to: Exclude<Stage, "egg">;
  name: string | null;
}) {
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState<Phase>(reduced ? "reveal" : "charge");
  /** Pendant le clignotement : affiche-t-on la nouvelle forme ? */
  const [showNew, setShowNew] = useState(false);
  const timers = useRef<number[]>([]);

  const meta = SPECIES[species];
  const nature = type ? TYPES[type] : null;
  const label = name?.trim() || meta.label;
  // Rayons, confettis et titre prennent la couleur de la NOUVELLE nature
  const accent = nature?.accent ?? meta.accent;
  /** La nature vient-elle d'apparaître, ou de changer ? */
  const natureNews: "revealed" | "changed" | null = !nature
    ? null
    : previousType === null
      ? "revealed"
      : previousType !== type
        ? "changed"
        : null;

  useEffect(() => {
    if (reduced) return;

    const push = (fn: () => void, delay: number) => {
      timers.current.push(window.setTimeout(fn, delay));
    };

    playEvolution();

    // 1 → 2
    push(() => setPhase("flicker"), 1100);

    // 2. Le clignotement : on empile les bascules aux instants cumulés
    let t = 1100;
    FLICKER_STEPS.forEach((step, i) => {
      t += step;
      push(() => setShowNew(i % 2 === 0), t);
    });

    // 3. Flash — on fige sur la nouvelle forme juste avant
    push(() => {
      setShowNew(true);
      setPhase("flash");
    }, 4200);

    // 4. Révélation
    push(() => setPhase("reveal"), 4700);

    return () => {
      timers.current.forEach(window.clearTimeout);
      timers.current = [];
    };
  }, [reduced]);

  // Confettis à la révélation
  useEffect(() => {
    if (phase !== "reveal") return;
    const colors = [accent, "#ffffff", "#a855f7", "#22d3ee"];
    confetti({
      particleCount: 140,
      spread: 95,
      startVelocity: 42,
      origin: { x: 0.5, y: 0.6 },
      colors,
    });
    const again = window.setTimeout(
      () =>
        confetti({
          particleCount: 90,
          spread: 130,
          startVelocity: 30,
          origin: { x: 0.5, y: 0.45 },
          colors,
        }),
      280
    );
    return () => window.clearTimeout(again);
  }, [phase, accent]);

  const flickering = phase === "flicker" || phase === "flash";
  const shownStage = phase === "charge" ? from : showNew ? to : from;

  return (
    <>
      {/* ── Rayons de lumière tournants ── */}
      {!reduced && (
        <Rays
          accent={accent}
          speed={phase === "charge" ? 26 : phase === "flicker" ? 9 : 3}
          intensity={phase === "reveal" ? 0.35 : 1}
        />
      )}

      {/* ── La créature ── */}
      <motion.div
        className="relative h-60 w-60 sm:h-72 sm:w-72"
        animate={
          reduced
            ? undefined
            : phase === "charge"
              ? { scale: [1, 1.04, 1] }
              : flickering
                ? { scale: 1.12 }
                : { scale: 1 }
        }
        transition={
          phase === "charge"
            ? { duration: 1.1, ease: "easeInOut" }
            : { duration: 0.4, ease: EASE_OUT_EXPO }
        }
      >
        <Creature
          species={species}
          type={type}
          stage={shownStage}
          mood="happy"
          silhouetteOnly={flickering}
          celebrating={phase === "reveal"}
          animate={!reduced}
        />
      </motion.div>

      {/* ── Le flash ── */}
      <AnimatePresence>
        {phase === "flash" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28 }}
            className="pointer-events-none absolute inset-0 bg-white"
          />
        )}
      </AnimatePresence>

      {/* ── Le texte ── */}
      <div className="relative mt-6 min-h-[8rem] max-w-sm">
        <AnimatePresence mode="wait">
          {phase === "reveal" ? (
            <motion.div
              key="done"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.7, ease: EASE_OUT_EXPO }}
            >
              <p className="eyebrow mb-2" style={{ color: accent }}>
                Évolution
              </p>
              <h2 className="heading-section">
                {label} a{" "}
                <span className="text-gradient-violet">évolué&nbsp;!</span>
              </h2>
              <p className="mt-3 flex items-center justify-center gap-2 font-mono text-sm text-foreground/60">
                <span>{STAGE_LABEL[from]}</span>
                <span style={{ color: accent }}>→</span>
                <span className="font-semibold text-foreground">
                  {STAGE_LABEL[to]}
                </span>
              </p>

              {/* LA NATURE : ce que votre façon de la nourrir a produit */}
              {nature && natureNews && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1, duration: 0.7, ease: EASE_OUT_EXPO }}
                  className="mt-5"
                >
                  <p
                    className="chip-text mx-auto"
                    style={{
                      color: nature.accent,
                      borderColor: nature.accentSoft,
                      backgroundColor: nature.accentSoft,
                    }}
                  >
                    {nature.emoji}{" "}
                    {natureNews === "changed"
                      ? `Devient de type ${nature.label}`
                      : `Type ${nature.label}`}
                  </p>
                  <p className="mx-auto mt-3 max-w-xs text-sm text-foreground/60">
                    {nature.trigger}
                  </p>
                </motion.div>
              )}
              <p className="label-micro mt-6">
                Touche l&apos;écran pour continuer
              </p>
            </motion.div>
          ) : (
            <motion.p
              key="pending"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.4, 1, 0.4] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.4, repeat: Infinity }}
              className="eyebrow"
              style={{ color: meta.accent }}
            >
              Quelque chose se passe…
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

/**
 * Le fond de rayons : deux couronnes de triangles en rotation inverse.
 * `speed` = secondes par tour (plus petit = plus rapide).
 */
function Rays({
  accent,
  speed,
  intensity,
}: {
  accent: string;
  speed: number;
  intensity: number;
}) {
  const wedges = Array.from({ length: 16 }, (_, i) => (i * 360) / 16);

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      {[
        { dir: 1, scale: 1, opacity: 0.5, color: "hsl(0 0% 100%)" },
        { dir: -1, scale: 0.78, opacity: 0.4, color: accent },
      ].map((layer, li) => (
        <motion.svg
          key={li}
          viewBox="-100 -100 200 200"
          className="absolute h-[190vmax] w-[190vmax]"
          style={{ opacity: layer.opacity * intensity }}
          animate={{ rotate: layer.dir * 360 }}
          transition={{ duration: speed, repeat: Infinity, ease: "linear" }}
        >
          <defs>
            <radialGradient id={`ray-${li}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={layer.color} stopOpacity="0.9" />
              <stop offset="45%" stopColor={layer.color} stopOpacity="0.25" />
              <stop offset="100%" stopColor={layer.color} stopOpacity="0" />
            </radialGradient>
          </defs>
          <g transform={`scale(${layer.scale})`}>
            {wedges.map((angle) => (
              <path
                key={angle}
                d="M 0 0 L 100 -7 L 100 7 Z"
                fill={`url(#ray-${li})`}
                transform={`rotate(${angle})`}
              />
            ))}
          </g>
        </motion.svg>
      ))}
    </div>
  );
}
