"use client";

import { useCallback, useEffect, useState } from "react";
import type { Identity } from "@/types";

const STORAGE_KEY = "us-together:identity";

/**
 * Mémorise et détecte automatiquement l'identité ("paris" = Arthur 🇫🇷 ou "raleigh" = Clara 🇺🇸).
 *
 * 1. Si une préférence est enregistrée dans localStorage, elle est prioritaire.
 * 2. Sinon, détection automatique intelligente basée sur le fuseau horaire & l'IP/Langue :
 *    - Fuseau "America/*" ou langue US → Clara 🇺🇸 (raleigh)
 *    - Fuseau "Europe/*" ou langue FR → Arthur 🇫🇷 (paris)
 * 3. L'utilisateur peut basculer manuellement à tout moment via la pastille du NavDock.
 */
export function useIdentity() {
  const [identity, setIdentityState] = useState<Identity>("paris");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === "paris" || stored === "raleigh") {
        setIdentityState(stored);
        setReady(true);
        return;
      }
    } catch {
      // Storage inaccessible
    }

    // 🌐 Auto-détection par Fuseau Horaire / Langue
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const lang = navigator.language || "";

      if (tz.includes("America") || tz.includes("New_York") || lang.startsWith("en")) {
        setIdentityState("raleigh"); // Clara 🇺🇸 aux USA
      } else {
        setIdentityState("paris"); // Arthur 🇫🇷 en France
      }
    } catch {
      setIdentityState("paris");
    }

    setReady(true);
  }, []);

  const setIdentity = useCallback((id: Identity) => {
    setIdentityState(id);
    try {
      window.localStorage.setItem(STORAGE_KEY, id);
    } catch {
      // Échec silencieux
    }
  }, []);

  return { identity, setIdentity, ready };
}
