import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * En-tête de section du design system : surtitre néon + titre + accroche.
 *
 * Avant, ce bloc était recopié dans 4 modules avec des traques différentes
 * (0.3em / 0.35em / 0.4em) — et absent des modules Heure et Globe.
 * Ici : un seul rythme vertical, une seule traque (`.eyebrow`).
 */

/** Accent néon du surtitre + du mot mis en avant dans le titre. */
export type Accent = "violet" | "cyan" | "rose";

const ACCENT_TEXT: Record<Accent, string> = {
  violet: "text-neon-violet",
  cyan: "text-neon-cyan",
  rose: "text-neon-rose",
};

/** Classes littérales : le JIT Tailwind ne lit pas les noms concaténés. */
const ACCENT_GRADIENT: Record<Accent, string> = {
  violet: "text-gradient-violet",
  cyan: "text-gradient-cyan",
  rose: "text-gradient-rose",
};

interface SectionHeadingProps {
  /** Surtitre en petites capitales monospace (ex. « Courrier du cœur »). */
  eyebrow: string;
  /** Icône lucide affichée avant le surtitre. */
  icon: LucideIcon;
  /** Début du titre, en texte plein. */
  title: string;
  /** Fin du titre, en dégradé néon (optionnelle). */
  titleAccent?: string;
  /** Accroche sous le titre (optionnelle). */
  subtitle?: string;
  accent?: Accent;
  /** Classes supplémentaires sur le conteneur (marges, alignement). */
  className?: string;
}

export function SectionHeading({
  eyebrow,
  icon: Icon,
  title,
  titleAccent,
  subtitle,
  accent = "violet",
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn("mb-6 text-center", className)}>
      <p className={cn("eyebrow mb-2", ACCENT_TEXT[accent])}>
        <Icon className="h-3.5 w-3.5" />
        {eyebrow}
      </p>

      <h2 className="heading-section">
        {title}
        {titleAccent && (
          <>
            {" "}
            <span className={ACCENT_GRADIENT[accent]}>{titleAccent}</span>
          </>
        )}
      </h2>

      {subtitle && (
        <p className="mx-auto mt-2 max-w-md text-balance text-sm text-foreground/50">
          {subtitle}
        </p>
      )}
    </div>
  );
}
