import { LOCATIONS } from "./constants";

/**
 * Helpers de manipulation du temps multi-fuseaux.
 * Tout repose sur Intl.DateTimeFormat → aucune librairie externe,
 * gestion automatique des heures d'été/hiver des deux pays.
 */

/** Formate l'heure HH:MM:SS dans un fuseau donné. */
export function formatTime(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone,
  }).format(date);
}

/**
 * Heure courte, sans les secondes (ex. « 21:47 ») — pour les étiquettes
 * compactes (labels de villes sur le globe) où la seconde serait du bruit.
 */
export function formatShortTime(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone,
  }).format(date);
}

/** Formate la date complète (ex. « jeudi 24 juil. ») dans un fuseau. */
export function formatDate(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "short",
    timeZone,
  }).format(date);
}

/** Heure locale (0-23) d'un fuseau donné. */
export function getHourInZone(date: Date, timeZone: string): number {
  const str = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    hour12: false,
    timeZone,
  }).format(date);
  // Certains moteurs renvoient "24" à minuit → normalisation en 0
  return parseInt(str, 10) % 24;
}

/** Décalage horaire (heures) Raleigh vs Paris, corrigé du passage minuit. */
export function getTimeDifference(date: Date): number {
  let diff =
    getHourInZone(date, LOCATIONS.raleigh.timeZone) -
    getHourInZone(date, LOCATIONS.paris.timeZone);
  // Normalise dans [-12, +12] (ex. 23h - 5h = +18 → -6)
  if (diff > 12) diff -= 24;
  if (diff < -12) diff += 24;
  return diff;
}

/* ────────────────────────────────────────────────
 * Phases du jour (indicateur visuel jour/nuit)
 * ──────────────────────────────────────────────── */

export type DayPhase = "night" | "sunrise" | "day" | "sunset";

/**
 * Phase approximative selon l'heure locale :
 * 5-7h lever · 7-18h jour · 18-20h coucher · sinon nuit.
 */
export function getDayPhase(hour: number): DayPhase {
  if (hour >= 5 && hour < 7) return "sunrise";
  if (hour >= 7 && hour < 18) return "day";
  if (hour >= 18 && hour < 20) return "sunset";
  return "night";
}

/** Métadonnées visuelles par phase (icône Lucide + gradient du halo). */
export const PHASE_META: Record<
  DayPhase,
  { label: string; icon: "Sunrise" | "Sun" | "Sunset" | "Moon"; gradient: string }
> = {
  sunrise: {
    label: "Lever du soleil",
    icon: "Sunrise",
    gradient: "from-amber-400/30 to-rose-400/20",
  },
  day: {
    label: "Jour",
    icon: "Sun",
    gradient: "from-cyan-400/25 to-sky-300/15",
  },
  sunset: {
    label: "Coucher du soleil",
    icon: "Sunset",
    gradient: "from-orange-500/30 to-rose-500/25",
  },
  night: {
    label: "Nuit",
    icon: "Moon",
    gradient: "from-indigo-500/25 to-violet-600/20",
  },
};
