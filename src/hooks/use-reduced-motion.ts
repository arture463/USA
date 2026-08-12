"use client";

import { useEffect, useState } from "react";

/**
 * Renvoie `true` si l'utilisateur a activé "réduire les animations"
 * (préférence système). Sert à désactiver les effets lourds (spotlight,
 * parallaxe) pour l'accessibilité et le confort.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return reduced;
}
