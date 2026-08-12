/**
 * Constantes globales du projet.
 * Centralise géographie, fuseaux horaires et dates du séjour.
 * → C'est LE seul fichier à modifier pour ajuster ces données.
 */

export interface CityLocation {
  label: string;
  country: string;
  lat: number;
  lng: number;
  /** Fuseau IANA : gère automatiquement heure d'été/hiver */
  timeZone: string;
}

export const LOCATIONS: Record<"paris" | "raleigh", CityLocation> = {
  paris: {
    label: "Paris",
    country: "France",
    lat: 48.8566,
    lng: 2.3522,
    timeZone: "Europe/Paris",
  },
  raleigh: {
    label: "Raleigh",
    country: "North Carolina, USA",
    lat: 35.7796,
    lng: -78.6382,
    timeZone: "America/New_York",
  },
};

/** Distance Paris ↔ Raleigh à vol d'oiseau (affichage HUD) */
export const DISTANCE_KM = 6379;

/**
 * ⚠️ À AJUSTER : vraies dates de départ et de retour.
 * Utilisées par le compte à rebours (Module 1).
 */
export const DEPARTURE_DATE = new Date("2026-07-24T10:00:00+02:00");
export const RETURN_DATE = new Date("2026-11-24T18:00:00+01:00");
