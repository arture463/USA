/**
 * ────────────────────────────────────────────────────────────────
 * MODULE 7 — Données de la créature partagée
 *
 * Une seule créature pour vous deux. Elle est nourrie par vos gestes
 * réels ; elle ne perd JAMAIS de points et ne meurt jamais — au pire
 * elle s'endort et fait la fête au retour.
 * ────────────────────────────────────────────────────────────────
 */

/** Les 4 espèces possibles (tirée au sort à l'éclosion, côté base). */
export type Species = "renard" | "chat" | "axolotl" | "hibou";

/**
 * La NATURE de la créature. Contrairement à l'espèce, elle n'est pas tirée au
 * sort : elle est déduite de la façon dont vous l'avez nourrie.
 *
 * L'espèce donne la SILHOUETTE, la nature donne la PALETTE et les ORNEMENTS.
 * Les deux se combinent librement → 4 × 6 = 24 créatures possibles.
 *
 * `null` tant qu'elle n'a pas atteint sa première évolution.
 */
export type PetType =
  | "ardent"
  | "onde"
  | "foudre"
  | "sylve"
  | "spectre"
  | "astral";

/** Stade de croissance, déduit de l'expérience cumulée. */
export type Stage = "egg" | "baby" | "teen" | "adult";

/** Humeur, déduite du temps écoulé depuis le dernier repas. */
export type Mood = "happy" | "content" | "sleepy";

export interface PetRow {
  id: number;
  species: Species | null;
  type: PetType | null;
  xp: number;
  fed_by_paris: boolean;
  fed_by_raleigh: boolean;
  name: string | null;
  hatched_at: string | null;
  last_fed_at: string | null;
  last_fed_by: "paris" | "raleigh" | null;
  last_treat_paris: string | null;
  last_treat_raleigh: string | null;
  created_at: string;
  /** Compteurs de régime : combien de repas de chaque sorte */
  meals_thought: number;
  meals_journal: number;
  meals_letter: number;
  meals_together: number;
  meals_treat: number;
}

/* ── Espèces ──────────────────────────────────────────────────── */

export interface SpeciesMeta {
  label: string;
  /** Ce qu'on lit à l'éclosion */
  intro: string;
  /** Couleur d'accent — reprend les néons du design system */
  accent: string;
  accentSoft: string;
  emoji: string;
}

export const SPECIES: Record<Species, SpeciesMeta> = {
  renard: {
    label: "Renard des étoiles",
    intro: "Un petit renard. Il a les oreilles trop grandes pour lui.",
    accent: "hsl(265 90% 65%)",
    accentSoft: "hsl(265 90% 65% / 0.25)",
    emoji: "🦊",
  },
  chat: {
    label: "Chat cosmique",
    intro: "Un chaton. Il vous regarde comme s'il vous connaissait déjà.",
    accent: "hsl(190 95% 60%)",
    accentSoft: "hsl(190 95% 60% / 0.25)",
    emoji: "🐱",
  },
  axolotl: {
    label: "Axolotl de l'Atlantique",
    intro: "Un axolotl. Il sourit sans arrêt, on ne sait pas pourquoi.",
    accent: "hsl(330 90% 68%)",
    accentSoft: "hsl(330 90% 68% / 0.25)",
    emoji: "🩷",
  },
  hibou: {
    label: "Hibou des fuseaux",
    intro: "Un hibou. Évidemment, il ne dort jamais aux mêmes heures que vous.",
    accent: "hsl(152 76% 60%)",
    accentSoft: "hsl(152 76% 60% / 0.25)",
    emoji: "🦉",
  },
};

/* ── Natures ──────────────────────────────────────────────────── */

/** Ornement animé qui accompagne chaque nature. */
export type Ornament =
  | "flames"
  | "drops"
  | "sparks"
  | "leaves"
  | "wisps"
  | "stars";

export interface TypeMeta {
  label: string;
  /** L'élément, pour le HUD */
  element: string;
  emoji: string;
  /** Ce qui l'a fait naître — affiché à la révélation */
  trigger: string;
  /** Ce que ça dit de vous deux */
  portrait: string;
  accent: string;
  accentSoft: string;
  ornament: Ornament;
}

export const TYPES: Record<PetType, TypeMeta> = {
  ardent: {
    label: "Ardent",
    element: "Feu",
    emoji: "🔥",
    trigger: "Vous avez surtout pensé l'un à l'autre, d'un coup, sans prévenir.",
    portrait: "Des élans. Vous n'attendez pas le bon moment, vous l'inventez.",
    accent: "hsl(18 95% 62%)",
    accentSoft: "hsl(18 95% 62% / 0.3)",
    ornament: "flames",
  },
  onde: {
    label: "Onde",
    element: "Eau",
    emoji: "💧",
    trigger: "Vous êtes venus la nourrir, encore et encore, sans jamais oublier.",
    portrait: "Du soin régulier. Rien de spectaculaire, et c'est bien mieux.",
    accent: "hsl(196 92% 58%)",
    accentSoft: "hsl(196 92% 58% / 0.3)",
    ornament: "drops",
  },
  foudre: {
    label: "Foudre",
    element: "Électrik",
    emoji: "⚡",
    trigger: "Vous avez réussi à être là en même temps, malgré les six heures.",
    portrait: "De la synchronicité. Vous vous trouvez, même à contretemps.",
    accent: "hsl(50 96% 60%)",
    accentSoft: "hsl(50 96% 60% / 0.3)",
    ornament: "sparks",
  },
  sylve: {
    label: "Sylve",
    element: "Plante",
    emoji: "🌿",
    trigger: "Vous avez écrit, photographié, raconté. Jour après jour.",
    portrait: "De la patience. Vous construisez une mémoire, pas des instants.",
    accent: "hsl(140 70% 55%)",
    accentSoft: "hsl(140 70% 55% / 0.3)",
    ornament: "leaves",
  },
  spectre: {
    label: "Spectre",
    element: "Lunaire",
    emoji: "🌙",
    trigger: "Vous avez ouvert les lettres, une à une, quand il fallait.",
    portrait: "Des secrets et de l'attente. Vous savez faire durer les choses.",
    accent: "hsl(280 82% 70%)",
    accentSoft: "hsl(280 82% 70% / 0.3)",
    ornament: "wisps",
  },
  astral: {
    label: "Astral",
    element: "Équilibre",
    emoji: "✨",
    trigger: "Aucune habitude n'a pris le dessus. Vous faites tout, un peu.",
    portrait: "De l'équilibre. La nature la plus rare : rien ne domine.",
    accent: "hsl(265 90% 70%)",
    accentSoft: "hsl(265 90% 70% / 0.3)",
    ornament: "stars",
  },
};

/** Les cinq régimes possibles, dans l'ordre d'affichage. */
export const MEAL_SOURCES = [
  "thought",
  "journal",
  "letter",
  "together",
  "treat",
] as const;

export type MealSource = (typeof MEAL_SOURCES)[number];

/** Quelle nature chaque régime pousse. */
export const SOURCE_TYPE: Record<MealSource, PetType> = {
  thought: "ardent",
  journal: "sylve",
  letter: "spectre",
  together: "foudre",
  treat: "onde",
};

export const SOURCE_LABEL: Record<MealSource, string> = {
  thought: "Pensées envoyées",
  journal: "Entrées de journal",
  letter: "Lettres ouvertes",
  together: "Journées ensemble",
  treat: "Friandises",
};

/**
 * Part de la nourriture qu'un régime doit représenter pour imposer sa nature.
 * En dessous, aucune habitude ne domine → Astral.
 * Doit rester aligné sur `pet_compute_type` dans supabase/schema.sql.
 */
export const DOMINANCE_THRESHOLD = 0.35;

/** Nombre de repas de chaque sorte, lu sur la ligne en base. */
export function getMealCounts(pet: PetRow | null): Record<MealSource, number> {
  return {
    thought: pet?.meals_thought ?? 0,
    journal: pet?.meals_journal ?? 0,
    letter: pet?.meals_letter ?? 0,
    together: pet?.meals_together ?? 0,
    treat: pet?.meals_treat ?? 0,
  };
}

/**
 * Répartition du régime, en expérience apportée (et non en nombre de repas) :
 * une journée passée ensemble vaut 6 alors qu'une pensée vaut 2, il serait
 * injuste de les compter à l'identique.
 */
export function getDietBreakdown(pet: PetRow | null): {
  source: MealSource;
  count: number;
  xp: number;
  share: number;
}[] {
  const counts = getMealCounts(pet);
  const rows = MEAL_SOURCES.map((source) => ({
    source,
    count: counts[source],
    xp: counts[source] * FOOD[source],
  }));
  const total = rows.reduce((sum, r) => sum + r.xp, 0);

  return rows.map((r) => ({
    ...r,
    share: total > 0 ? r.xp / total : 0,
  }));
}

/**
 * La nature que le régime actuel produirait.
 * Reproduit `pet_compute_type` côté SQL — utile pour annoncer à l'avance
 * vers quoi elle penche, sans attendre l'évolution.
 */
export function predictType(pet: PetRow | null): PetType {
  const breakdown = getDietBreakdown(pet);
  const top = breakdown.reduce((best, r) => (r.xp > best.xp ? r : best));
  if (top.xp === 0 || top.share < DOMINANCE_THRESHOLD) return "astral";
  return SOURCE_TYPE[top.source];
}

/* ── Croissance ───────────────────────────────────────────────── */

/** Seuils d'expérience de chaque stade (une fois éclos). */
export const STAGE_XP = {
  baby: 0,
  teen: 40,
  adult: 120,
} as const;

export const STAGE_LABEL: Record<Stage, string> = {
  egg: "Œuf",
  baby: "Bébé",
  teen: "Adolescent",
  adult: "Adulte",
};

/** Stade courant à partir de la ligne en base. */
export function getStage(pet: PetRow | null): Stage {
  if (!pet || !pet.species) return "egg";
  if (pet.xp >= STAGE_XP.adult) return "adult";
  if (pet.xp >= STAGE_XP.teen) return "teen";
  return "baby";
}

/**
 * Progression vers le stade suivant, en pourcentage.
 * Renvoie 100 au stade adulte (plus rien à atteindre).
 */
export function getStageProgress(pet: PetRow | null): {
  percent: number;
  nextLabel: string | null;
  remaining: number;
} {
  const stage = getStage(pet);

  if (stage === "egg" || !pet) {
    // L'œuf ne progresse pas à l'expérience : il attend vos deux signatures
    const signatures =
      (pet?.fed_by_paris ? 1 : 0) + (pet?.fed_by_raleigh ? 1 : 0);
    return {
      percent: (signatures / 2) * 100,
      nextLabel: "Éclosion",
      remaining: 2 - signatures,
    };
  }

  if (stage === "adult") {
    return { percent: 100, nextLabel: null, remaining: 0 };
  }

  const from = stage === "baby" ? STAGE_XP.baby : STAGE_XP.teen;
  const to = stage === "baby" ? STAGE_XP.teen : STAGE_XP.adult;
  const percent = ((pet.xp - from) / (to - from)) * 100;

  return {
    percent: Math.min(Math.max(percent, 0), 100),
    nextLabel: stage === "baby" ? STAGE_LABEL.teen : STAGE_LABEL.adult,
    remaining: to - pet.xp,
  };
}

/* ── Humeur ───────────────────────────────────────────────────── */

const SLEEPY_AFTER_MS = 48 * 3_600_000; // 48 h
const CONTENT_AFTER_MS = 8 * 3_600_000; // 8 h

/**
 * Humeur en fonction du dernier repas.
 * Volontairement bienveillante : le pire état est « endormie », jamais
 * « triste » ni « affamée » — l'absence ne doit pas devenir un reproche.
 */
export function getMood(pet: PetRow | null, now: Date): Mood {
  if (!pet?.last_fed_at) return "content";
  const elapsed = now.getTime() - new Date(pet.last_fed_at).getTime();
  if (elapsed > SLEEPY_AFTER_MS) return "sleepy";
  if (elapsed > CONTENT_AFTER_MS) return "content";
  return "happy";
}

export const MOOD_LABEL: Record<Mood, string> = {
  happy: "Aux petits soins",
  content: "Tranquille",
  sleepy: "Assoupie",
};

/* ── Nourriture ───────────────────────────────────────────────── */

/**
 * Valeurs nutritives. Les deux premières sont appliquées par des
 * triggers en base (voir supabase/02-pet.sql) : elles comptent même
 * si l'onglet de l'autre est fermé.
 */
export const FOOD = {
  /** Une pensée « Thinking of you » — trigger sur public.thoughts */
  thought: 2,
  /** Une entrée de journal — trigger sur public.journal_entries */
  journal: 3,
  /** Une lettre lue — appel client, dédoublonné par enveloppe */
  letter: 4,
  /** Une journée où vous étiez en ligne en même temps — 1 fois par jour */
  together: 6,
  /** Friandise manuelle — recharge de 4 h, vérifiée côté serveur */
  treat: 5,
} as const;

/** Recharge de la friandise, en millisecondes (doit suivre le SQL). */
export const TREAT_COOLDOWN_MS = 4 * 3_600_000;

/** Ce qui la nourrit, tel qu'affiché dans le module. */
export const FOOD_SOURCES: { label: string; amount: number }[] = [
  { label: "Une pensée envoyée", amount: FOOD.thought },
  { label: "Une entrée de journal", amount: FOOD.journal },
  { label: "Une lettre ouverte", amount: FOOD.letter },
  { label: "Une journée en ligne ensemble", amount: FOOD.together },
  { label: "Une friandise", amount: FOOD.treat },
];
