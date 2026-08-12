"use client";

import { useEffect, useRef } from "react";

/**
 * Comportement partagé des surfaces modales (modale lettre, visionneuse photo).
 *
 * Regroupe ce qui manquait ou était dupliqué :
 *  - fermeture avec Échap (la logique était recopiée dans les deux composants)
 *  - verrouillage du défilement de l'arrière-plan (absent : la page défilait
 *    derrière la modale à la molette)
 *  - focus piégé dans la modale, puis restitué à l'élément d'origine (absent :
 *    Tab sortait de la modale vers la page cachée derrière)
 *
 * @param open    la modale est-elle affichée ?
 * @param onClose appelé sur Échap
 * @returns       ref à poser sur le conteneur de la modale (avec tabIndex={-1})
 */
export function useModal<T extends HTMLElement>(
  open: boolean,
  onClose: () => void
) {
  const ref = useRef<T>(null);

  // ── Fermeture au clavier ──
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // ── Verrouillage du défilement ──
  useEffect(() => {
    if (!open) return;

    const { overflow, paddingRight } = document.body.style;
    // Masquer la barre de défilement élargit la fenêtre : on compense en
    // marge droite pour que le contenu ne saute pas latéralement.
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = overflow;
      document.body.style.paddingRight = paddingRight;
    };
  }, [open]);

  // ── Piège à focus ──
  useEffect(() => {
    if (!open) return;

    const node = ref.current;
    if (!node) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;

    const focusable = () =>
      Array.from(
        node.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => el.offsetParent !== null);

    // On ne déplace le focus que s'il n'est pas déjà dans la modale :
    // un champ en autoFocus (saisie du code secret) garde la main.
    if (!node.contains(document.activeElement)) {
      (focusable()[0] ?? node).focus();
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      const items = focusable();
      if (items.length === 0) {
        e.preventDefault();
        return;
      }

      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;

      // Boucle : Tab sur le dernier revient au premier, et inversement
      if (e.shiftKey && (active === first || active === node)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    node.addEventListener("keydown", onKeyDown);

    return () => {
      node.removeEventListener("keydown", onKeyDown);
      // Rend le focus à l'élément qui a ouvert la modale (l'enveloppe, la photo)
      previouslyFocused?.focus?.();
    };
  }, [open]);

  return ref;
}
