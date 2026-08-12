"use client";

import { motion, useAnimationControls } from "framer-motion";
import { Lock, LockOpen, CalendarClock, KeyRound } from "lucide-react";
import type { Envelope } from "@/lib/open-when-data";
import { cn } from "@/lib/utils";

/**
 * Carte enveloppe : affiche l'état du verrou et gère le clic.
 * Une enveloppe verrouillée par date "tremble" quand on la touche.
 */

interface EnvelopeCardProps {
  envelope: Envelope;
  /** Déjà déverrouillée (code trouvé précédemment / date passée) */
  isUnlocked: boolean;
  /** L'heure actuelle (poussée par le parent pour rester synchro) */
  now: Date;
  onOpen: (envelope: Envelope) => void;
}

/** Formate la date de déblocage (ex. « 17 août ») */
function formatOpensAt(iso: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
  }).format(new Date(iso));
}

export function EnvelopeCard({
  envelope,
  isUnlocked,
  now,
  onOpen,
}: EnvelopeCardProps) {
  const controls = useAnimationControls();
  const { lock } = envelope;

  // Une enveloppe datée se déverrouille automatiquement le jour J
  const dateLocked =
    lock.type === "date" && now.getTime() < new Date(lock.opensAt).getTime();
  const codeLocked = lock.type === "code" && !isUnlocked;
  const openable = !dateLocked; // le code se saisit dans la modale

  const handleClick = () => {
    if (dateLocked) {
      // Verrouillée : petit refus animé (tremblement)
      controls.start({
        x: [0, -7, 7, -5, 5, -2, 2, 0],
        transition: { duration: 0.45 },
      });
      return;
    }
    onOpen(envelope);
  };

  return (
    <motion.button
      type="button"
      animate={controls}
      whileHover={openable ? { y: -5, scale: 1.02 } : undefined}
      whileTap={openable ? { scale: 0.97 } : undefined}
      onClick={handleClick}
      className={cn(
        "glass focus-ring group relative flex flex-col items-start gap-3 rounded-card p-5 text-left transition-shadow",
        openable
          ? "cursor-pointer hover:shadow-glow-violet"
          : "cursor-not-allowed opacity-70"
      )}
    >
      {/* Emoji + statut du verrou */}
      <div className="flex w-full items-start justify-between">
        <span className="text-3xl" aria-hidden>
          {envelope.emoji}
        </span>
        <span
          className={cn(
            "chip",
            dateLocked && "text-foreground/50",
            codeLocked && "border-neon-rose/30 bg-neon-rose/10 text-neon-rose",
            !dateLocked &&
              !codeLocked &&
              "border-neon-cyan/30 bg-neon-cyan/10 text-neon-cyan"
          )}
        >
          {dateLocked ? (
            <>
              <CalendarClock className="h-3 w-3" />
              {formatOpensAt((lock as { opensAt: string }).opensAt)}
            </>
          ) : codeLocked ? (
            <>
              <KeyRound className="h-3 w-3" />
              Code
            </>
          ) : (
            <>
              <LockOpen className="h-3 w-3" />
              Prête
            </>
          )}
        </span>
      </div>

      {/* Titre */}
      <div>
        <p className="label-micro">Ouvre quand...</p>
        <h3 className="mt-1 font-display text-base font-semibold leading-snug text-foreground/90">
          {envelope.title}
        </h3>
      </div>

      {/* Liseré lumineux au survol (uniquement si ouvrable) */}
      {openable && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-card opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background:
              "linear-gradient(120deg, transparent 30%, hsl(265 90% 65% / 0.08) 50%, transparent 70%)",
          }}
        />
      )}

      {/* Cadenas discret pour les verrouillées par date */}
      {dateLocked && (
        <Lock className="absolute bottom-4 right-4 h-4 w-4 text-foreground/25" />
      )}
    </motion.button>
  );
}
