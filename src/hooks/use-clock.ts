"use client";

import { useEffect, useState } from "react";

/**
 * Horloge live : renvoie l'heure courante, rafraîchie chaque seconde.
 *
 * Renvoie `null` au premier rendu : le serveur et le navigateur n'ont
 * jamais exactement la même heure, initialiser à `new Date()` créerait
 * un mismatch d'hydratation. Les composants affichent un skeleton
 * pendant ce (très court) instant.
 */
export function useClock(): Date | null {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date()); // première valeur, côté client uniquement
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return now;
}
