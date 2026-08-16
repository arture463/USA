"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";
import { X, KeyRound, Heart } from "lucide-react";
import { useIdentity } from "@/hooks/use-identity";
import { useModal } from "@/hooks/use-modal";
import { usePetFeeder } from "@/hooks/use-pet";
import { FOOD } from "@/lib/pet-data";
import { SPRING } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { playLetterOpenSound } from "@/lib/sound-fx";
import type { Envelope } from "@/lib/open-when-data";

/**
 * Modale "lettre" : affiche le message d'une enveloppe.
 * Si l'enveloppe est à code et pas encore déverrouillée → écran de saisie.
 * À l'ouverture réussie : pluie de confettis aux couleurs néon.
 */

interface LetterModalProps {
  envelope: Envelope | null;
  isUnlocked: boolean;
  onUnlock: (id: string) => void;
  onClose: () => void;
}

/** Confettis néon (2 salves latérales, effet "canon") */
function fireConfetti() {
  const colors = ["#a855f7", "#22d3ee", "#f472b6", "#ffffff"];
  confetti({ particleCount: 90, spread: 70, origin: { x: 0.2, y: 0.7 }, colors });
  confetti({ particleCount: 90, spread: 70, origin: { x: 0.8, y: 0.7 }, colors });
}

export function LetterModal({
  envelope,
  isUnlocked,
  onUnlock,
  onClose,
}: LetterModalProps) {
  const [codeInput, setCodeInput] = useState("");
  const [codeError, setCodeError] = useState(false);

  const needsCode =
    envelope?.lock.type === "code" && !isUnlocked;

  // Échap + défilement verrouillé + focus piégé (hook partagé)
  const panelRef = useModal<HTMLDivElement>(envelope !== null, onClose);

  // Lire une lettre nourrit la créature du Module 7.
  // La clé `letter:<id>` fait que relire dix fois la même ne compte qu'une fois.
  const { identity } = useIdentity();
  const feedPet = usePetFeeder(identity);

  // Son et confettis dès que la lettre est visible (pas sur l'écran de code)
  useEffect(() => {
    if (!envelope || needsCode) return;
    playLetterOpenSound();
    fireConfetti();
    void feedPet(FOOD.letter, `letter:${envelope.id}`, "letter");
  }, [envelope, needsCode, feedPet]);

  // Reset de la saisie à chaque nouvelle enveloppe
  useEffect(() => {
    setCodeInput("");
    setCodeError(false);
  }, [envelope?.id]);

  const submitCode = () => {
    if (!envelope || envelope.lock.type !== "code") return;
    if (codeInput.trim().toUpperCase() === envelope.lock.code.toUpperCase()) {
      onUnlock(envelope.id); // → needsCode passe à false → lettre + confettis
    } else {
      setCodeError(true);
    }
  };

  return (
    <AnimatePresence>
      {envelope && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 12 }}
            transition={SPRING}
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="letter-title"
            tabIndex={-1}
            className="glass-floating relative w-full max-w-lg rounded-card p-8 outline-none"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Bouton fermer */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Fermer"
              className="btn-ghost btn-pill absolute right-4 top-4 p-2"
            >
              <X className="h-4 w-4" />
            </button>

            {needsCode ? (
              /* ── Écran de saisie du code secret ── */
              <div className="text-center">
                <span className="text-4xl">{envelope.emoji}</span>
                <h3
                  id="letter-title"
                  className="mt-3 font-display text-xl font-semibold"
                >
                  Enveloppe verrouillée
                </h3>
                {envelope.lock.type === "code" && envelope.lock.hint && (
                  <p className="mt-2 text-sm text-foreground/50">
                    Indice : {envelope.lock.hint}
                  </p>
                )}
                <div className="mt-6 flex gap-2">
                  <input
                    type="text"
                    value={codeInput}
                    onChange={(e) => {
                      setCodeInput(e.target.value);
                      setCodeError(false);
                    }}
                    onKeyDown={(e) => e.key === "Enter" && submitCode()}
                    placeholder="CODE SECRET"
                    autoFocus
                    aria-invalid={codeError}
                    className={cn(
                      "field text-center font-mono uppercase tracking-eyebrow",
                      codeError && "field-invalid"
                    )}
                  />
                  <button
                    type="button"
                    onClick={submitCode}
                    aria-label="Valider le code"
                    className="btn-neon rounded-inner px-4 py-3"
                  >
                    <KeyRound className="h-5 w-5" />
                  </button>
                </div>
                {codeError && (
                  <p className="mt-3 text-xs text-destructive">
                    Ce n'est pas le bon code... réessaie 😉
                  </p>
                )}
              </div>
            ) : (
              /* ── La lettre ── */
              <div>
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{envelope.emoji}</span>
                  <div>
                    <p className="label-micro">Ouvre quand...</p>
                    <h3
                      id="letter-title"
                      className="text-glow font-display text-xl font-semibold text-neon-rose"
                    >
                      {envelope.title}
                    </h3>
                  </div>
                </div>

                {/* Corps de la lettre — whitespace-pre-line respecte les \n */}
                <p className="mt-6 whitespace-pre-line text-[15px] leading-relaxed text-foreground/85">
                  {envelope.message}
                </p>

                <div className="mt-8 flex items-center justify-end gap-1.5 text-neon-rose">
                  <Heart className="h-4 w-4" fill="currentColor" />
                  <span className="label-micro text-inherit">
                    Avec tout mon amour
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
