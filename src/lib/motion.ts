import type { Transition, Variants } from "framer-motion";

/**
 * ────────────────────────────────────────────────────────────────
 * TOKENS DE MOUVEMENT
 * La courbe [0.22, 1, 0.36, 1] et le duo initial/whileInView étaient
 * recopiés à l'identique dans 7 fichiers. Une seule source ici :
 * changer la sensation du site = changer cette valeur.
 * ────────────────────────────────────────────────────────────────
 */

/** Courbe "out expo" — décélération franche, la signature du site. */
export const EASE_OUT_EXPO = [0.22, 1, 0.36, 1] as const;

/** Durées canoniques (secondes). */
export const DURATION = {
  /** Micro-retour : pastille, survol, bascule d'état. */
  fast: 0.25,
  /** Transition standard : apparition d'un élément. */
  base: 0.45,
  /** Entrée d'une section entière. */
  slow: 0.7,
  /** Effet cinématique (hero, globe). */
  cinematic: 1,
} as const;

/** Ressort utilisé pour les éléments qui "attrapent" une position. */
export const SPRING: Transition = {
  type: "spring",
  stiffness: 260,
  damping: 24,
};

/**
 * Entrée d'une section au défilement.
 * À étaler sur le composant : `{...revealOnScroll}`.
 */
export const revealOnScroll = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.05 },
  transition: { duration: DURATION.slow, ease: EASE_OUT_EXPO },
} as const;

/**
 * Entrée immédiate au montage (sections visibles dès le chargement,
 * là où whileInView déclencherait trop tard).
 */
export const revealOnMount = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: DURATION.slow, ease: EASE_OUT_EXPO },
} as const;

/**
 * Apparition séquencée avec dé-flou (hero).
 * `custom` reçoit le délai en secondes.
 */
export const fadeUpBlur: Variants = {
  hidden: { opacity: 0, y: 28, filter: "blur(6px)" },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.8, delay, ease: EASE_OUT_EXPO },
  }),
};
