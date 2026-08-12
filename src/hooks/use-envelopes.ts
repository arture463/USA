"use client";

import { useCallback, useEffect, useState } from "react";
import { ENVELOPES, type Envelope } from "@/lib/open-when-data";

const CUSTOM_STORAGE_KEY = "open-when:custom-envelopes";

export function useEnvelopes() {
  const [customEnvelopes, setCustomEnvelopes] = useState<Envelope[]>([]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(CUSTOM_STORAGE_KEY);
      if (raw) {
        setCustomEnvelopes(JSON.parse(raw) as Envelope[]);
      }
    } catch {
      // Storage non disponible
    }
  }, []);

  const addEnvelope = useCallback((envelope: Omit<Envelope, "id">) => {
    const newEnvelope: Envelope = {
      ...envelope,
      id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    };

    setCustomEnvelopes((prev) => {
      const next = [newEnvelope, ...prev];
      try {
        window.localStorage.setItem(CUSTOM_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Storage non disponible
      }
      return next;
    });

    return newEnvelope;
  }, []);

  const allEnvelopes = [...customEnvelopes, ...ENVELOPES];

  return {
    envelopes: allEnvelopes,
    addEnvelope,
  };
}
