import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * `cn` — Fusionne des classes Tailwind de façon intelligente.
 *
 *  - `clsx`       : gère les classes conditionnelles (objets, tableaux, false…)
 *  - `twMerge`    : dédoublonne les classes Tailwind en conflit
 *                   (ex: `px-2 px-4` → `px-4`)
 *
 * Utilisé par shadcn/ui, Aceternity UI, Magic UI et tous nos composants.
 *
 * @example
 * cn("px-2 py-1", isActive && "bg-neon-violet", "px-4")
 * // → "py-1 bg-neon-violet px-4"
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
