/**
 * ────────────────────────────────────────────────────────────────
 * MODULE 8 — La Salle de Sport RPG Next-Gen (Arthur 🏋️‍♂️ & Clara 🏋️‍♀️)
 *
 * Système de Gamification, XP, Niveaux, Badges, Série Duo 🔥
 * ────────────────────────────────────────────────────────────────
 */

export type WorkoutType = "push" | "pull" | "legs" | "cardio";

export interface MuscleStats {
  pushLevel: number;
  pullLevel: number;
  legsLevel: number;
  cardioLevel: number;
  totalSessions: number;
  xp: number;
  title: string;
  nextLevelXp: number;
}

export interface GymSessionRecord {
  id: string;
  who: "paris" | "raleigh";
  type: WorkoutType;
  notes?: string;
  created_at: string;
}

export interface GymBadge {
  id: string;
  title: string;
  description: string;
  emoji: string;
  unlocked: boolean;
}

export const WORKOUT_INFO: Record<
  WorkoutType,
  { label: string; emoji: string; color: string; muscles: string; description: string; xp: number }
> = {
  push: {
    label: "Push Day",
    emoji: "💪",
    color: "hsl(190 95% 55%)",
    muscles: "Pectoraux · Épaules · Triceps",
    description: "Développé couché, militaire, dips",
    xp: 120,
  },
  pull: {
    label: "Pull Day",
    emoji: "🛷",
    color: "hsl(265 90% 65%)",
    muscles: "Dos · Biceps · Trapèzes",
    description: "Tractions, tirage vert, curl biceps",
    xp: 120,
  },
  legs: {
    label: "Legs Day",
    emoji: "🦵",
    color: "hsl(152 76% 60%)",
    muscles: "Quadriceps · Ischios · Fessiers · Mollets",
    description: "Squats, presse à cuisses, fentes",
    xp: 150,
  },
  cardio: {
    label: "Cardio & Abs",
    emoji: "🔥",
    color: "hsl(340 95% 60%)",
    muscles: "Sangle abdominale · Cardio · Énergie",
    description: "Tapis, rameur, gainage & abdos",
    xp: 100,
  },
};

/** Titres de Niveaux de Musculation */
export const GYM_TITLES = [
  { level: 1, title: "Recrue du Gym 🏋️‍♂️", minXp: 0 },
  { level: 2, title: "Habitué des Haltères 🥊", minXp: 200 },
  { level: 3, title: "Athlète Émérite ⚡", minXp: 500 },
  { level: 4, title: "Guerrier du Bench 🔥", minXp: 900 },
  { level: 5, title: "Légende du Fitness 🏆", minXp: 1400 },
  { level: 6, title: "Titan de Paris / Raleigh 👑", minXp: 2000 },
];

/** Badges d'Accomplissement à Débloquer */
export function getBadges(arthurSessions: number, claraSessions: number, totalSessions: number): GymBadge[] {
  return [
    {
      id: "first-session",
      title: "Première Goutte de Transpiration",
      description: "Enregistrer sa toute première séance au gym",
      emoji: "🌱",
      unlocked: totalSessions >= 1,
    },
    {
      id: "duo-power",
      title: "Duo Inarrêtable",
      description: "Chacun a validé au moins 3 séances",
      emoji: "🔥",
      unlocked: arthurSessions >= 3 && claraSessions >= 3,
    },
    {
      id: "leg-day-master",
      title: "N'a Jamais Sauté le Leg Day",
      description: "Atteindre 5 séances Legs cumulées",
      emoji: "🦵",
      unlocked: totalSessions >= 5,
    },
    {
      id: "century-club",
      title: "Club des Champions",
      description: "Accumuler 10 séances au total à deux",
      emoji: "🏆",
      unlocked: totalSessions >= 10,
    },
    {
      id: "transatlantic-beast",
      title: "Titre Transatlantique",
      description: "Atteindre 20 séances partagées entre Paris et Raleigh",
      emoji: "👑",
      unlocked: totalSessions >= 20,
    },
  ];
}
