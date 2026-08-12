"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FlaskConical, ChevronDown, RotateCcw } from "lucide-react";
import {
  MEAL_SOURCES,
  SOURCE_LABEL,
  SPECIES,
  STAGE_LABEL,
  TYPES,
  type MealSource,
  type Mood,
  type PetRow,
  type PetType,
  type Species,
  type Stage,
} from "@/lib/pet-data";
import { cn } from "@/lib/utils";
import type { Identity } from "@/types";

/**
 * PANNEAU DE TEST — visible uniquement en développement.
 *
 * Le parent ne le monte que si `process.env.NODE_ENV === "development"`,
 * donc ce fichier est éliminé du build de production.
 *
 * Deux registres, volontairement séparés :
 *
 *  1. FLUX RÉEL — écrit en base et déclenche le temps réel. Sert à tester le
 *     parcours : signatures, éclosion, changements de stade, assoupissement.
 *     « Nourrir en tant que » est la clé du test solo : `feed_pet` prend
 *     l'identité en paramètre, on peut donc signer à la place de l'autre.
 *
 *  2. APERÇU LOCAL — ne touche à rien. Force l'affichage d'une espèce, d'un
 *     stade et d'une humeur pour inspecter les 4 × 3 × 3 combinaisons du
 *     dessin sans polluer la vraie créature.
 */

/** Aperçu forcé côté client — `null` = on affiche l'état réel. */
export interface PetPreview {
  species: Species;
  stage: Exclude<Stage, "egg">;
  mood: Mood;
  /** Nature forcée : palette et ornements */
  type: PetType | null;
  /**
   * Fige la créature en ombre chinoise blanche — l'état intermédiaire de
   * l'évolution. Impossible à observer autrement : il ne dure que 50 ms.
   */
  silhouette: boolean;
}

interface PetDevPanelProps {
  pet: PetRow | null;
  working: boolean;
  preview: PetPreview | null;
  onPreviewChange: (preview: PetPreview | null) => void;
  onFeedAs: (
    who: Identity,
    amount: number,
    source?: MealSource
  ) => Promise<void>;
  onReset: () => Promise<void>;
  onSet: (args: {
    xp?: number;
    species?: Species;
    hoursSinceFed?: number;
    type?: PetType;
  }) => Promise<void>;
  /** Rejoue l'animation d'évolution sans toucher à la base */
  onReplayEvolution: (
    from: Exclude<Stage, "egg">,
    to: Exclude<Stage, "egg">
  ) => void;
}

const ALL_SPECIES = Object.keys(SPECIES) as Species[];
const ALL_STAGES: Exclude<Stage, "egg">[] = ["baby", "teen", "adult"];
const ALL_MOODS: Mood[] = ["happy", "content", "sleepy"];

const ALL_TYPES = Object.keys(TYPES) as PetType[];

const DEFAULT_PREVIEW: PetPreview = {
  species: "renard",
  stage: "baby",
  mood: "happy",
  type: null,
  silhouette: false,
};

export function PetDevPanel({
  pet,
  working,
  preview,
  onPreviewChange,
  onFeedAs,
  onReset,
  onSet,
  onReplayEvolution,
}: PetDevPanelProps) {
  const [open, setOpen] = useState(false);

  const patch = (next: Partial<PetPreview>) =>
    onPreviewChange({ ...(preview ?? DEFAULT_PREVIEW), ...next });

  return (
    <div className="mt-4 w-full">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="btn-ghost btn-sm btn-pill mx-auto flex"
      >
        <FlaskConical className="h-3.5 w-3.5" />
        Panneau de test
        <ChevronDown
          className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="panel-tight mt-3 space-y-5 border-dashed">
              {/* ── État brut ── */}
              <div>
                <p className="label-micro mb-2">État en base</p>
                <p className="font-mono text-[11px] leading-relaxed text-foreground/50">
                  espèce {pet?.species ?? "—"} · xp {pet?.xp ?? 0} · paris{" "}
                  {pet?.fed_by_paris ? "✓" : "✗"} · raleigh{" "}
                  {pet?.fed_by_raleigh ? "✓" : "✗"}
                  <br />
                  nature {pet?.type ?? "—"} · dernier repas{" "}
                  {pet?.last_fed_at?.slice(0, 16).replace("T", " ") ?? "jamais"}
                  <br />
                  régime · pensées {pet?.meals_thought ?? 0} · journal{" "}
                  {pet?.meals_journal ?? 0} · lettres {pet?.meals_letter ?? 0} ·
                  ensemble {pet?.meals_together ?? 0} · friandises{" "}
                  {pet?.meals_treat ?? 0}
                </p>
              </div>

              {/* ── 1. Flux réel ── */}
              <Section title="Flux réel — écrit en base, déclenche le temps réel">
                <Row label="Nourrir en tant que">
                  <Chip onClick={() => onFeedAs("paris", 2)} disabled={working}>
                    Paris +2
                  </Chip>
                  <Chip onClick={() => onFeedAs("raleigh", 2)} disabled={working}>
                    Raleigh +2
                  </Chip>
                </Row>

                <Row label="Nourrir d'un régime précis (× 5)">
                  {MEAL_SOURCES.map((src) => (
                    <Chip
                      key={src}
                      disabled={working}
                      onClick={async () => {
                        // Cinq repas d'affilée : de quoi rendre ce régime dominant
                        for (let i = 0; i < 5; i++) {
                          await onFeedAs("paris", 1, src);
                        }
                      }}
                    >
                      {SOURCE_LABEL[src]}
                    </Chip>
                  ))}
                </Row>

                <Row label="Imposer la nature">
                  {ALL_TYPES.map((t) => (
                    <Chip
                      key={t}
                      onClick={() => onSet({ type: t })}
                      disabled={working}
                    >
                      {TYPES[t].emoji} {TYPES[t].label}
                    </Chip>
                  ))}
                </Row>

                <Row label="Sauter à un stade">
                  <Chip onClick={() => onSet({ xp: 40 })} disabled={working}>
                    Ado (40)
                  </Chip>
                  <Chip onClick={() => onSet({ xp: 120 })} disabled={working}>
                    Adulte (120)
                  </Chip>
                  <Chip onClick={() => onSet({ xp: 0 })} disabled={working}>
                    Bébé (0)
                  </Chip>
                </Row>

                <Row label="Humeur (recule le dernier repas)">
                  <Chip onClick={() => onSet({ hoursSinceFed: 0 })} disabled={working}>
                    Aux petits soins
                  </Chip>
                  <Chip onClick={() => onSet({ hoursSinceFed: 12 })} disabled={working}>
                    Tranquille (12 h)
                  </Chip>
                  <Chip onClick={() => onSet({ hoursSinceFed: 60 })} disabled={working}>
                    Assoupie (60 h)
                  </Chip>
                </Row>

                <Row label="Imposer l'espèce (rejoue l'éclosion)">
                  {ALL_SPECIES.map((s) => (
                    <Chip
                      key={s}
                      onClick={() => onSet({ species: s })}
                      disabled={working}
                    >
                      {SPECIES[s].emoji} {s}
                    </Chip>
                  ))}
                </Row>

                <Row label="Repartir de zéro">
                  <Chip onClick={onReset} disabled={working} danger>
                    <RotateCcw className="h-3 w-3" />
                    Remettre l&apos;œuf à neuf
                  </Chip>
                </Row>
              </Section>

              {/* ── 2. Aperçu local ── */}
              <Section title="Aperçu local — ne touche pas à la base">
                <Row label="Rejouer l'évolution">
                  <Chip onClick={() => onReplayEvolution("baby", "teen")}>
                    Bébé → Ado
                  </Chip>
                  <Chip onClick={() => onReplayEvolution("teen", "adult")}>
                    Ado → Adulte
                  </Chip>
                  <Chip onClick={() => onReplayEvolution("baby", "adult")}>
                    Bébé → Adulte
                  </Chip>
                </Row>

                <Row label="Aperçu">
                  <Chip
                    onClick={() =>
                      onPreviewChange(preview ? null : DEFAULT_PREVIEW)
                    }
                    active={preview !== null}
                  >
                    {preview ? "Actif — revenir au réel" : "Activer l'aperçu"}
                  </Chip>
                </Row>

                {preview && (
                  <>
                    <Row label="Espèce">
                      {ALL_SPECIES.map((s) => (
                        <Chip
                          key={s}
                          onClick={() => patch({ species: s })}
                          active={preview.species === s}
                        >
                          {SPECIES[s].emoji} {s}
                        </Chip>
                      ))}
                    </Row>
                    <Row label="Stade">
                      {ALL_STAGES.map((s) => (
                        <Chip
                          key={s}
                          onClick={() => patch({ stage: s })}
                          active={preview.stage === s}
                        >
                          {STAGE_LABEL[s]}
                        </Chip>
                      ))}
                    </Row>
                    <Row label="Humeur">
                      {ALL_MOODS.map((m) => (
                        <Chip
                          key={m}
                          onClick={() => patch({ mood: m })}
                          active={preview.mood === m}
                        >
                          {m}
                        </Chip>
                      ))}
                    </Row>
                    <Row label="Nature (palette et ornements)">
                      <Chip
                        onClick={() => patch({ type: null })}
                        active={preview.type === null}
                      >
                        aucune
                      </Chip>
                      {ALL_TYPES.map((t) => (
                        <Chip
                          key={t}
                          onClick={() => patch({ type: t })}
                          active={preview.type === t}
                        >
                          {TYPES[t].emoji} {TYPES[t].label}
                        </Chip>
                      ))}
                    </Row>
                    <Row label="Ombre chinoise (état d'évolution)">
                      <Chip
                        onClick={() => patch({ silhouette: !preview.silhouette })}
                        active={preview.silhouette}
                      >
                        {preview.silhouette ? "Figée en blanc" : "Figer en blanc"}
                      </Chip>
                    </Row>
                  </>
                )}
              </Section>

              <p className="label-micro">
                Retirer les fonctions dev_* avant la mise en ligne — bloc final
                de supabase/schema.sql
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Petits éléments d'interface, locaux au panneau ── */

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2.5 border-t border-white/10 pt-4">
      <p className="label-micro">{title}</p>
      {children}
    </div>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="w-full text-[11px] text-foreground/40 sm:w-52 sm:shrink-0">
        {label}
      </span>
      {children}
    </div>
  );
}

function Chip({
  children,
  onClick,
  disabled,
  active,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "focus-ring hairline inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] transition-colors disabled:opacity-40",
        active
          ? "border-neon-cyan/40 bg-neon-cyan/10 text-neon-cyan"
          : "text-foreground/70 hover:text-foreground",
        danger && !active && "hover:border-destructive/40 hover:text-destructive"
      )}
    >
      {children}
    </button>
  );
}
