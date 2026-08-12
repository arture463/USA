"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Mémorise les enveloppes déjà déverrouillées (localStorage).
 * → Une enveloppe à code déverrouillée une fois le reste pour toujours.
 * SSR-safe : lit le storage uniquement après le montage.
 */

const STORAGE_KEY = "open-when:unlocked";

export function useOpenedEnvelopes() {
  const [unlocked, setUnlocked] = useState<Set<string>>(new Set());

  // Hydratation depuis localStorage (côté client uniquement)
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setUnlocked(new Set(JSON.parse(raw) as string[]));
    } catch {
      // Storage inaccessible (navigation privée...) → état mémoire seul
    }
  }, []);

  const markUnlocked = useCallback((id: string) => {
    setUnlocked((prev) => {
      const next = new Set(prev);
      next.add(id);
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
      } catch {
        // Échec silencieux : l'état mémoire suffit pour la session
      }
      return next;
    });
  }, []);

  return { unlocked, markUnlocked };
}
