/**
 * MODULE 4 — "Open When..." : définition des enveloppes.
 *
 * ⚠️ CONTENU 100% PERSONNALISABLE — remplace les messages par les tiens.
 * Trois types de verrous :
 *  - { type: "free" }                        → s'ouvre librement
 *  - { type: "date", opensAt: "ISO..." }     → verrouillée jusqu'à la date
 *  - { type: "code", code: "...", hint }     → verrouillée par code secret
 */

export type EnvelopeLock =
  | { type: "free" }
  | { type: "date"; opensAt: string }
  | { type: "code"; code: string; hint?: string };

export interface Envelope {
  /** Identifiant stable (sert à mémoriser l'ouverture en localStorage) */
  id: string;
  /** Complète la phrase « Ouvre quand... » */
  title: string;
  emoji: string;
  /** Le contenu de la lettre (sauts de ligne avec \n) */
  message: string;
  lock: EnvelopeLock;
}

export const ENVELOPES: Envelope[] = [
  {
    id: "feeling-lonely",
    title: "tu te sens seule",
    emoji: "🫂",
    message:
      "Ferme les yeux deux secondes.\n\nTu sens ? C'est un câlin longue distance, envoyé depuis Paris à la vitesse de la lumière.\n\nLa distance c'est juste de la géographie. Nous deux, c'est bien plus solide que ça. Je suis là, à un message près, toujours.",
    lock: { type: "free" },
  },
  {
    id: "bad-day",
    title: "t'as passé une sale journée",
    emoji: "🌧️",
    message:
      "Respire. Cette journée est finie, elle ne reviendra pas.\n\nMets la chanson qu'on adore, fais-toi un truc bon à manger, et rappelle-toi : même tes pires journées là-bas font partie d'une aventure que très peu de gens osent vivre.\n\nJe suis fier de toi. Demain on recommence.",
    lock: { type: "free" },
  },
  {
    id: "miss-me",
    title: "je te manque trop",
    emoji: "💜",
    message:
      "Moi aussi tu me manques. Tout le temps.\n\nMais regarde le globe au-dessus : il y a une ligne lumineuse entre nous, et elle ne s'éteint jamais.\n\nChaque jour qui passe est un jour de moins avant que je te serre dans mes bras. Compte avec moi, le compteur descend.",
    lock: { type: "code", code: "RALEIGH", hint: "La ville où tu es 😉 (en majuscules)" },
  },
  {
    id: "first-day",
    title: "c'est ton premier jour de cours",
    emoji: "🎓",
    message:
      "C'est LE grand jour !\n\nTu vas déchirer. Sois curieuse, pose des questions avec ton accent français qui va tous les faire craquer, et n'oublie pas de me raconter TOUT ce soir.\n\nGo get them! 🇺🇸",
    lock: { type: "date", opensAt: "2026-08-17T08:00:00-04:00" },
  },
  {
    id: "halfway",
    title: "on est à la moitié",
    emoji: "⏳",
    message:
      "Mi-parcours !\n\nLe plus dur est derrière toi. À partir de maintenant, chaque jour te rapproche de la maison au lieu de t'en éloigner.\n\nLa pente est descendante, et au bout il y a moi, à l'aéroport, avec un panneau ridicule et ton dessert préféré.",
    lock: { type: "date", opensAt: "2026-09-23T12:00:00-04:00" },
  },
  {
    id: "last-day",
    title: "c'est le jour du retour",
    emoji: "✈️",
    message:
      "ÇA Y EST.\n\n4 mois. Tu l'as fait. On l'a fait.\n\nMonte dans cet avion, dors si tu peux (tu ne pourras pas), et quand tu atterris, cherche le mec qui court dans le terminal.\n\nC'est moi. J'arrive.",
    lock: { type: "date", opensAt: "2026-11-24T00:00:00+01:00" },
  },
];
