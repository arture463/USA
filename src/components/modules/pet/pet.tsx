"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Egg as EggIcon, Cookie, Pencil, Check } from "lucide-react";
import { useIdentity } from "@/hooks/use-identity";
import { usePet } from "@/hooks/use-pet";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { LOCATIONS } from "@/lib/constants";
import { revealOnScroll } from "@/lib/motion";
import {
  MOOD_LABEL,
  SOURCE_LABEL,
  SOURCE_TYPE,
  SPECIES,
  STAGE_LABEL,
  TYPES,
  getDietBreakdown,
  getMood,
  getStage,
  getStageProgress,
  predictType,
  type PetType,
  type Stage,
} from "@/lib/pet-data";
import { SectionHeading } from "@/components/ui/section-heading";
import { Creature } from "./creature";
import { Egg } from "./egg";
import { HatchOverlay } from "./hatch-overlay";
import { EvolutionOverlay } from "./evolution-overlay";
import { PetDevPanel, type PetPreview } from "./pet-dev-panel";

/** Le panneau de test est activé pour les essais et la visualisation. */
const IS_DEV = true;

/**
 * MODULE 7 — La créature partagée.
 *
 * Une seule créature pour vous deux. Elle est nourrie par vos gestes réels
 * (pensée, journal, lettre, présence simultanée) plus une friandise manuelle.
 * Elle ne perd jamais de points : au pire elle s'endort, et elle fait la fête
 * au retour. L'absence n'est pas une faute.
 */
export function Pet() {
  const { identity, setIdentity, ready } = useIdentity();
  const reduced = useReducedMotion();
  const {
    pet,
    loading,
    missing,
    working,
    justHatched,
    dismissHatch,
    treatCooldownMs,
    treat,
    rename,
    devFeedAs,
    devReset,
    devSet,
  } = usePet(identity);

  // Aperçu forcé par le panneau de test — null en usage normal
  const [preview, setPreview] = useState<PetPreview | null>(null);

  // Le regard suit le curseur (desktop uniquement, jamais si animations réduites)
  const stageRef = useRef<HTMLDivElement>(null);
  const [look, setLook] = useState({ x: 0, y: 0 });
  const [blink, setBlink] = useState(false);
  const [celebrating, setCelebrating] = useState(false);

  useEffect(() => {
    if (reduced || !window.matchMedia("(pointer: fine)").matches) return;
    const onMove = (e: MouseEvent) => {
      const box = stageRef.current?.getBoundingClientRect();
      if (!box) return;
      const cx = box.left + box.width / 2;
      const cy = box.top + box.height / 2;
      // Normalisé puis borné : au-delà de ~200 px le regard est déjà au maximum
      setLook({
        x: Math.max(-1, Math.min(1, (e.clientX - cx) / 200)),
        y: Math.max(-1, Math.min(1, (e.clientY - cy) / 200)),
      });
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [reduced]);

  // Clignement à intervalle irrégulier — un rythme régulier fait "robot"
  useEffect(() => {
    if (reduced) return;
    let timer: number;
    const schedule = () => {
      timer = window.setTimeout(() => {
        setBlink(true);
        window.setTimeout(() => setBlink(false), 130);
        schedule();
      }, 2600 + Math.random() * 4200);
    };
    schedule();
    return () => window.clearTimeout(timer);
  }, [reduced]);

  // Petit bond quand l'expérience augmente (y compris quand c'est l'autre qui nourrit)
  const previousXp = useRef<number | null>(null);
  useEffect(() => {
    if (!pet) return;
    if (previousXp.current !== null && pet.xp > previousXp.current) {
      setCelebrating(true);
      window.setTimeout(() => setCelebrating(false), 800);
    }
    previousXp.current = pet.xp;
  }, [pet]);

  /* ── Détection de l'évolution ──
   * On compare le stade réel au stade vu au rendu précédent. Le premier
   * relevé ne déclenche rien : arriver sur le site alors qu'elle est déjà
   * adulte ne doit pas rejouer l'animation. */
  const [evolution, setEvolution] = useState<{
    from: Exclude<Stage, "egg">;
    to: Exclude<Stage, "egg">;
    /** Nature d'AVANT : permet d'annoncer une révélation ou un changement */
    previousType: PetType | null;
    /** Incrémenté à chaque déclenchement → remonte la séquence */
    run: number;
  } | null>(null);
  const runCount = useRef(0);
  const previousStage = useRef<Stage | null>(null);
  const previousTypeRef = useRef<PetType | null>(null);

  const startEvolution = (
    from: Exclude<Stage, "egg">,
    to: Exclude<Stage, "egg">,
    previousType: PetType | null = null
  ) => {
    runCount.current += 1;
    setEvolution({ from, to, previousType, run: runCount.current });
  };

  useEffect(() => {
    const current = getStage(pet);
    const before = previousStage.current;
    previousStage.current = current;

    // La nature est écrite dans le MÊME update que l'expérience : quand on lit
    // la ligne, elle est déjà la nouvelle. D'où ce relevé du rendu précédent,
    // seul moyen de savoir si elle vient de changer.
    const beforeType = previousTypeRef.current;
    previousTypeRef.current = pet?.type ?? null;

    if (before === null || before === current) return;
    // L'éclosion a sa propre cérémonie : on ne la double pas
    if (before === "egg" || current === "egg") return;

    runCount.current += 1;
    setEvolution({
      from: before,
      to: current,
      previousType: beforeType,
      run: runCount.current,
    });
  }, [pet]);

  if (loading || !ready) {
    return <div className="skeleton h-[420px] w-full" />;
  }

  // La table n'existe pas encore → on le dit franchement plutôt que d'afficher un vide
  if (missing) {
    return (
      <motion.section {...revealOnScroll} className="w-full">
        <SectionHeading
          eyebrow="Notre créature"
          icon={EggIcon}
          title="Un œuf vous"
          titleAccent="attend"
          accent="violet"
        />
        <div className="panel-roomy text-center">
          <p className="text-sm text-foreground/60">
            La créature n&apos;est pas encore branchée : il reste le script SQL à
            exécuter.
          </p>
          <p className="label-micro mt-3">
            supabase/schema.sql — à coller dans le SQL Editor
          </p>
        </div>
      </motion.section>
    );
  }



  // L'aperçu de test court-circuite l'état réel pour l'affichage seulement :
  // la base, la progression et les boutons continuent de refléter la vérité.
  const stage = preview?.stage ?? getStage(pet);
  const mood = preview?.mood ?? getMood(pet, new Date());
  const progress = getStageProgress(pet);
  const species = preview?.species ?? pet?.species ?? null;
  const meta = species ? SPECIES[species] : null;

  // La nature décide de la couleur ; tant qu'elle est indéterminée, on garde
  // celle de l'espèce et on annonce simplement vers quoi elle penche.
  const type = preview?.type ?? pet?.type ?? null;
  const nature = type ? TYPES[type] : null;
  const leaning = TYPES[predictType(pet)];
  const accent = nature?.accent ?? meta?.accent ?? "hsl(265 90% 65%)";
  const diet = getDietBreakdown(pet);

  const signatures =
    (pet?.fed_by_paris ? 1 : 0) + (pet?.fed_by_raleigh ? 1 : 0);
  const iFed = identity === "paris" ? pet?.fed_by_paris : pet?.fed_by_raleigh;
  const other = identity === "paris" ? LOCATIONS.raleigh : LOCATIONS.paris;

  const treatReady = treatCooldownMs === 0;

  return (
    <>
      <HatchOverlay
        species={species}
        open={justHatched}
        onClose={dismissHatch}
      />

      <EvolutionOverlay
        species={species}
        type={pet?.type ?? null}
        previousType={evolution?.previousType ?? null}
        from={evolution?.from ?? null}
        to={evolution?.to ?? null}
        name={pet?.name ?? null}
        runKey={evolution?.run ?? 0}
        open={evolution !== null}
        onClose={() => setEvolution(null)}
      />

      <motion.section {...revealOnScroll} className="w-full">
        <SectionHeading
          eyebrow="Notre créature"
          icon={EggIcon}
          title={stage === "egg" ? "Un œuf vous" : "Elle grandit"}
          titleAccent={stage === "egg" ? "attend" : "avec vous"}
          subtitle={
            stage === "egg"
              ? "Il n'éclôra que quand vous l'aurez nourri tous les deux."
              : "Chaque pensée, chaque souvenir partagé la fait grandir. Elle ne vous en voudra jamais d'être occupés."
          }
          accent="violet"
        />

        <div className="panel-roomy relative overflow-hidden">

          {/* ── La scène ── */}
          <div
            ref={stageRef}
            className="relative mx-auto h-52 w-52 sm:h-60 sm:w-60"
          >
            {stage === "egg" ? (
              <Egg signatures={signatures} animate={!reduced} />
            ) : (
              species && (
                <Creature
                  species={species}
                  type={type}
                  stage={stage}
                  mood={mood}
                  look={look}
                  blink={blink}
                  celebrating={celebrating}
                  animate={!reduced}
                  silhouetteOnly={preview?.silhouette ?? false}
                />
              )
            )}
          </div>

          {/* ── Identité ── */}
          <div className="relative mt-2 text-center">
            {stage === "egg" ? (
              <>
                <h3 className="font-display text-2xl font-semibold">
                  {signatures === 0
                    ? "Personne ne l'a encore nourri"
                    : signatures === 1
                      ? iFed
                        ? `Il n'attend plus que ${other.label}`
                        : `${other.label} l'a nourri. À ton tour.`
                      : "Il est prêt à éclore…"}
                </h3>
                <p className="label-micro mt-2">
                  {signatures} signature{signatures > 1 ? "s" : ""} sur 2
                </p>
              </>
            ) : (
              <>
                <PetName
                  name={pet?.name ?? null}
                  accent={accent}
                  working={working}
                  onRename={rename}
                />
                {/* La nature : ce qu'elle est devenue à cause de vous */}
                <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
                  {nature ? (
                    <span
                      className="chip-text"
                      style={{
                        color: nature.accent,
                        borderColor: nature.accentSoft,
                        backgroundColor: nature.accentSoft,
                      }}
                    >
                      {nature.emoji} Type {nature.label}
                    </span>
                  ) : (
                    <span className="chip-text">
                      Nature indéterminée · penche vers {leaning.emoji}{" "}
                      {leaning.label}
                    </span>
                  )}
                </div>

                <p className="label-micro mt-2">
                  {STAGE_LABEL[stage]} · {MOOD_LABEL[mood]} · {pet?.xp ?? 0} repas
                </p>

                {nature && (
                  <p className="mx-auto mt-3 max-w-sm text-sm text-foreground/55">
                    {nature.portrait}
                  </p>
                )}
              </>
            )}
          </div>

          {/* ── Progression ── */}
          <div className="relative mt-6">
            <div className="label-micro mb-1.5 flex justify-between">
              <span>
                {stage === "egg"
                  ? "Éclosion"
                  : progress.nextLabel
                    ? `Vers ${progress.nextLabel}`
                    : "Stade final"}
              </span>
              <span>
                {stage === "egg"
                  ? `${signatures}/2`
                  : progress.nextLabel
                    ? `${progress.remaining} repas`
                    : "au complet"}
              </span>
            </div>
            <div className="track">
              <motion.div
                className="track-fill"
                initial={{ width: 0 }}
                animate={{ width: `${progress.percent}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* ── Dernier repas ── */}
          {pet?.last_fed_by && (
            <p className="relative mt-4 text-center text-sm text-foreground/60">
              Dernier repas offert par{" "}
              <span className="font-semibold" style={{ color: accent }}>
                {LOCATIONS[pet.last_fed_by].label}
              </span>
            </p>
          )}

          {/* ── La friandise ── */}
          <div className="relative mt-6 flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={treat}
              disabled={!treatReady || working}
              className="btn-neon btn-md btn-pill"
            >
              <Cookie className="h-4 w-4" />
              {stage === "egg" ? "Nourrir l'œuf" : "Donner une friandise"}
            </button>
            <p className="label-micro">
              {treatReady
                ? "Disponible maintenant"
                : `Prochaine friandise dans ${formatCooldown(treatCooldownMs)}`}
            </p>
          </div>

          {/* ── SON RÉGIME ──
              C'est le cœur du mécanisme : chaque geste pousse une nature,
              et le régime dominant décide de ce qu'elle devient. */}
          <div className="relative mt-8 border-t border-white/10 pt-5">
            <p className="label-micro mb-1 text-center">Son régime</p>
            <p className="mb-4 text-center text-xs text-foreground/45">
              Le geste qui domine décide de sa nature à la prochaine évolution
            </p>

            <ul className="space-y-2.5">
              {diet.map((row) => {
                const pushed = TYPES[SOURCE_TYPE[row.source]];
                const dominant = row.share >= 0.35 && row.count > 0;
                return (
                  <li key={row.source}>
                    <div className="mb-1 flex items-baseline justify-between gap-2 text-sm">
                      <span
                        className={
                          dominant ? "font-medium text-foreground" : "text-foreground/60"
                        }
                      >
                        {SOURCE_LABEL[row.source]}
                      </span>
                      <span className="shrink-0 font-mono text-[11px] text-foreground/40">
                        {row.count} · {Math.round(row.share * 100)}%
                        <span
                          className="ml-2"
                          style={{ color: pushed.accent }}
                          title={`Pousse la nature ${pushed.label}`}
                        >
                          {pushed.emoji} {pushed.label}
                        </span>
                      </span>
                    </div>
                    {/* Barre à la couleur de la nature que ce geste pousse */}
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: pushed.accent }}
                        initial={{ width: 0 }}
                        animate={{ width: `${row.share * 100}%` }}
                        transition={{ duration: 0.9, ease: "easeOut" }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {IS_DEV && (
          <PetDevPanel
            pet={pet}
            working={working}
            preview={preview}
            onPreviewChange={setPreview}
            onFeedAs={devFeedAs}
            onReset={devReset}
            onSet={devSet}
            onReplayEvolution={startEvolution}
          />
        )}
      </motion.section>
    </>
  );
}

/** Formate une durée restante en « 3 h 12 » ou « 47 min ». */
function formatCooldown(ms: number): string {
  const totalMinutes = Math.ceil(ms / 60_000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes} min`;
  return `${hours} h ${String(minutes).padStart(2, "0")}`;
}

/**
 * Prénom de la créature, modifiable sur place.
 * `onRename` est passé par le parent : rappeler usePet() ici ouvrirait un
 * second canal temps réel sur la même table.
 */
function PetName({
  name,
  accent,
  working,
  onRename,
}: {
  name: string | null;
  accent: string;
  working: boolean;
  onRename: (name: string) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(name ?? "");

  const submit = async () => {
    await onRename(draft);
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="mx-auto flex max-w-xs items-center gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && void submit()}
          placeholder="Son prénom…"
          maxLength={24}
          autoFocus
          className="field text-center"
        />
        <button
          type="button"
          onClick={submit}
          disabled={working}
          aria-label="Valider le prénom"
          className="btn-neon btn-icon-sm rounded-inner"
        >
          <Check className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        setDraft(name ?? "");
        setEditing(true);
      }}
      className="focus-ring group mx-auto flex items-center gap-2 rounded-lg px-2 py-1"
    >
      <h3
        className="font-display text-2xl font-semibold"
        style={{ color: name ? accent : undefined }}
      >
        {name || "Lui donner un prénom"}
      </h3>
      <Pencil className="h-3.5 w-3.5 text-foreground/30 transition-colors group-hover:text-foreground/70" />
    </button>
  );
}
