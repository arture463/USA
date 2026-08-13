"use client";

import { useCallback, useEffect, useState } from "react";
import type { Identity } from "@/types";

const STORAGE_KEY = "us-together:identity";
const EVENT_KEY = "us-together:identity-change";

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
  const [hasChosen, setHasChosen] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === "paris" || stored === "raleigh") {
        setIdentityState(stored);
        setHasChosen(true);
        setReady(true);
      } else {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const lang = navigator.language || "";
        if (tz.includes("America") || tz.includes("New_York") || lang.startsWith("en")) {
          setIdentityState("raleigh");
        } else {
          setIdentityState("paris");
        }
        setReady(true);
      }
    } catch {
      setIdentityState("paris");
      setReady(true);
    }

    // Écouter les changements d'identité globaux déclenchés par NavDock ou IdentityWelcomeModal
    const handleGlobalChange = (e: Event) => {
      const customEvent = e as CustomEvent<Identity>;
      if (customEvent.detail === "paris" || customEvent.detail === "raleigh") {
        setIdentityState(customEvent.detail);
        setHasChosen(true);
      }
    };

    window.addEventListener(EVENT_KEY, handleGlobalChange);
    return () => {
      window.removeEventListener(EVENT_KEY, handleGlobalChange);
    };
  }, []);

  const setIdentity = useCallback((id: Identity) => {
    setIdentityState(id);
    setHasChosen(true);
    try {
      window.localStorage.setItem(STORAGE_KEY, id);
      window.dispatchEvent(new CustomEvent<Identity>(EVENT_KEY, { detail: id }));
    } catch {
      // Échec silencieux
    }
  }, []);

  return { identity, setIdentity, ready, hasChosen };
}
