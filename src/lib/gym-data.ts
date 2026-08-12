/**
 * ────────────────────────────────────────────────────────────────
 * MODULE 8 — La Salle de Sport RPG (Arthur 🏋️‍♂️ & Clara 🏋️‍♀️)
 *
 * Compétition ludique & suivi de musculation Push / Pull / Legs
 * avec évolution visuelle Pixel Art des avatars !
 * ────────────────────────────────────────────────────────────────
 */

export type WorkoutType = "push" | "pull" | "legs" | "cardio";

export interface MuscleStats {
  pushLevel: number; // Poitrail, Épaules, Triceps
  pullLevel: number; // Dos, Biceps
  legsLevel: number; // Quad, Fessiers
  cardioLevel: number; // Endurance, Abdos
  totalSessions: number;
}

export interface GymSessionRecord {
  id: string;
  who: "paris" | "raleigh"; // Arthur (paris) ou Clara (raleigh)
  type: WorkoutType;
  notes?: string;
  created_at: string;
}

export const WORKOUT_INFO: Record<
  WorkoutType,
  { label: string; emoji: string; color: string; muscles: string; description: string }
> = {
  push: {
    label: "Push Day",
    emoji: "💪",
    color: "hsl(18 95% 62%)",
    muscles: "Pectoraux · Épaules · Triceps",
    description: "Développé couché, militaire, dips",
  },
  pull: {
    label: "Pull Day",
    emoji: "🛷",
    color: "hsl(265 90% 65%)",
    muscles: "Dos · Biceps · Trapèzes",
    description: "Tractions, tirage vert, curl biceps",
  },
  legs: {
    label: "Legs Day",
    emoji: "🦵",
    color: "hsl(152 76% 60%)",
    muscles: "Quadriceps · Ischios · Fessiers · Mollets",
    description: "Squats, presse à cuisses, fentes",
  },
  cardio: {
    label: "Cardio & Abs",
    emoji: "🔥",
    color: "hsl(190 95% 60%)",
    muscles: "Sangle abdominale · Cardio · Énergie",
    description: "Tapis, rameur, gainage & abdos",
  },
};
