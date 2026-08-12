/**
 * Types partagés du projet.
 */

/** Qui utilise l'appareil : "paris" (lui) ou "raleigh" (elle). */
export type Identity = "paris" | "raleigh";

/** Une "pensée" envoyée via le bouton Thinking of You (table `thoughts`). */
export interface Thought {
  id: string;
  sender: Identity;
  created_at: string;
}
