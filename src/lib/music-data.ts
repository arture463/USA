/**
 * MODULE 6 — Music Player : la chanson du moment.
 *
 * ⚠️ PERSONNALISABLE : colle n'importe quel lien Spotify
 * (clic droit sur un titre → Partager → Copier le lien).
 * Formats acceptés : /track/..., /album/..., /playlist/...
 * La dédicace s'affiche sous le lecteur.
 */

export interface SharedTrack {
  /** Lien Spotify complet (open.spotify.com/...) */
  spotifyUrl: string;
  /** Petit mot qui accompagne la chanson */
  dedication: string;
  /** Qui la dédie */
  from: string;
}

export const SHARED_TRACK: SharedTrack = {
  spotifyUrl: "https://open.spotify.com/track/0tgVpDi06FyKpA1z0VMD4v",
  dedication:
    "Celle-là, c'est notre chanson. Mets tes écouteurs, je l'écoute en même temps que toi.",
  from: "A.",
};
