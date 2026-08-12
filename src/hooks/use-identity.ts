"use client";

import { useCallback, useEffect, useState } from "react";
import type { Identity } from "@/types";

/**
 * Mémorise qui utilise cet appareil ("paris" ou "raleigh") dans localStorage.
 * → Choisi une seule fois par appareil, puis persistant.
 *
 * `ready` évite un flash de l'écran de choix pendant la lecture du storage.
 */

const STORAGE_KEY = "us-together:identity";

export function useIdentity() {
  const [identity, setIdentityState] = useState<Identity | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === "paris" || stored === "raleigh") {
        setIdentityState(stored);
      }
    } catch {
      // Storage inaccessible → l'utilisateur choisira à chaque session
    }
    setReady(true);
  }, []);

  const setIdentity = useCallback((id: Identity) => {
    setIdentityState(id);
    try {
      window.localStorage.setItem(STORAGE_KEY, id);
    } catch {
      // Échec silencieux : l'état mémoire suffit pour la session
    }
  }, []);

  return { identity, setIdentity, ready };
}
