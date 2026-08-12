"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import {
  SPECIES,
  TYPES,
  type Mood,
  type Ornament,
  type PetType,
  type Species,
  type Stage,
} from "@/lib/pet-data";
import { cn } from "@/lib/utils";

/**
 * La créature, entièrement en SVG (aucun asset externe).
 *
 * ── PRINCIPE DE CONSTRUCTION ──
 * Le corps est UNE SEULE silhouette continue (tête et ventre fusionnés en un
 * chemin unique), remplie puis contournée d'un seul trait. Tous les détails
 * (ventre clair, museau, yeux, pattes) sont dessinés À L'INTÉRIEUR, sans
 * contour, et découpés par un clipPath sur cette silhouette.
 *
 * La version précédente empilait deux cercles avec des appendices posés à
 * côté : on voyait la jointure, la queue flottait dans le vide et les quatre
 * espèces se ressemblaient toutes. Une silhouette unique règle les trois.
 *
 * ── LES STADES ──
 * Chaque stade a sa PROPRE silhouette, pas un simple changement d'échelle :
 *   bébé   — courte, tête énorme, presque ronde
 *   ado    — plus haute, corps qui s'élargit, tête qui rétrécit
 *   adulte — la plus haute, tête fine, posture dressée, oreilles plus grandes
 * C'est cette différence de contour qui rend l'évolution lisible quand les
 * deux silhouettes alternent en blanc (voir evolution-overlay.tsx).
 */

interface StageSpec {
  /** Contour fermé de la créature, dans un viewBox 0 0 200 200 */
  silhouette: string;
  face: { x: number; y: number; r: number };
  belly: { x: number; y: number; rx: number; ry: number };
  tail: { x: number; y: number };
  /** Ligne du sol où se séparent les orteils */
  footY: number;
  earScale: number;
  tailScale: number;
  shadowRx: number;
  /**
   * Échelle globale, ancrée AU SOL : le bébé est une petite boule perdue dans
   * le cadre, l'adulte le remplit. C'est le levier le plus fort pour rendre
   * l'évolution spectaculaire — plus qu'un changement de contour.
   */
  scale: number;
  /** Les yeux rétrécissent en grandissant : c'est ce qui fait « bébé » */
  eyeScale: number;
  /** Collerette de l'adulte : l'attribut qui n'apparaît qu'au dernier stade */
  hasRuff: boolean;
}

/** Point d'ancrage au sol : toutes les tailles grandissent vers le haut. */
const GROUND_Y = 182;

const STAGE_SPEC: Record<Exclude<Stage, "egg">, StageSpec> = {
  /**
   * BÉBÉ — une boule. Presque pas de cou, tête énorme, minuscule dans le
   * cadre. Oreilles réduites à des bourgeons, queue à un moignon : les
   * attributs de l'espèce sont là, mais pas encore développés.
   */
  baby: {
    silhouette: `M 100 40
      C 68 40 52 62 52 92
      C 52 112 58 124 64 130
      C 58 138 56 150 62 160
      C 70 170 84 174 100 174
      C 116 174 130 170 138 160
      C 144 150 142 138 136 130
      C 142 124 148 112 148 92
      C 148 62 132 40 100 40 Z`,
    face: { x: 100, y: 92, r: 44 },
    belly: { x: 100, y: 150, rx: 28, ry: 20 },
    tail: { x: 138, y: 158 },
    footY: 172,
    earScale: 0.42,
    tailScale: 0.35,
    shadowRx: 32,
    scale: 0.66,
    eyeScale: 1.3,
    hasRuff: false,
  },
  /**
   * ADO — le cou se marque, le corps dépasse la tête, oreilles et queue
   * atteignent leur taille normale. La silhouette s'inverse : c'est le corps
   * qui domine, plus la tête.
   */
  teen: {
    silhouette: `M 100 30
      C 80 30 66 48 66 72
      C 66 90 71 100 77 106
      C 60 114 52 136 56 152
      C 62 168 80 176 100 176
      C 120 176 138 168 144 152
      C 148 136 140 114 123 106
      C 129 100 134 90 134 72
      C 134 48 120 30 100 30 Z`,
    face: { x: 100, y: 70, r: 33 },
    belly: { x: 100, y: 150, rx: 32, ry: 24 },
    tail: { x: 144, y: 152 },
    footY: 176,
    earScale: 1,
    tailScale: 1,
    shadowRx: 38,
    scale: 0.85,
    eyeScale: 1,
    hasRuff: false,
  },

  /**
   * ADULTE — long cou, tête fine, poitrail large, et une COLLERETTE qui
   * n'existe à aucun autre stade. Remplit le cadre.
   */
  adult: {
    silhouette: `M 100 22
      C 82 22 70 38 70 58
      C 70 74 74 86 79 92
      C 74 98 70 104 70 110
      C 58 120 52 140 56 156
      C 62 172 80 180 100 180
      C 120 180 138 172 144 156
      C 148 140 142 120 130 110
      C 130 104 126 98 121 92
      C 126 86 130 74 130 58
      C 130 38 118 22 100 22 Z`,
    face: { x: 100, y: 56, r: 29 },
    belly: { x: 100, y: 152, rx: 34, ry: 26 },
    tail: { x: 146, y: 150 },
    footY: 180,
    earScale: 1.32,
    tailScale: 1.35,
    shadowRx: 42,
    scale: 1,
    eyeScale: 0.85,
    hasRuff: true,
  },
};

interface CreatureProps {
  species: Species;
  /**
   * La nature : elle décide de la PALETTE et des ORNEMENTS.
   * `null` avant la première évolution → on retombe sur la couleur de l'espèce.
   */
  type?: PetType | null;
  stage: Exclude<Stage, "egg">;
  mood: Mood;
  /** Direction du regard, -1 → 1 sur chaque axe (suit le curseur) */
  look?: { x: number; y: number };
  blink?: boolean;
  /** Petit bond au moment d'un repas */
  celebrating?: boolean;
  animate?: boolean;
  /**
   * Mode « ombre chinoise » : uniquement la silhouette, en blanc plein.
   * C'est la brique de l'animation d'évolution façon Pokémon.
   */
  silhouetteOnly?: boolean;
  className?: string;
}

export function Creature({
  species,
  type = null,
  stage,
  mood,
  look = { x: 0, y: 0 },
  blink = false,
  celebrating = false,
  animate = true,
  silhouetteOnly = false,
  className,
}: CreatureProps) {
  const uid = useId().replace(/:/g, "");
  const meta = SPECIES[species];
  const nature = type ? TYPES[type] : null;
  const spec = STAGE_SPEC[stage];
  // La nature prime sur l'espèce pour la couleur : c'est elle qu'on a méritée
  const accent = nature?.accent ?? meta.accent;
  const accentSoft = nature?.accentSoft ?? meta.accentSoft;
  const asleep = mood === "sleepy";
  const eyesShut = asleep || blink;

  // Décalage des pupilles, borné pour rester dans l'œil
  const px = look.x * (spec.face.r * 0.09);
  const py = look.y * (spec.face.r * 0.07);

  return (
    <motion.svg
      viewBox="0 0 200 200"
      role="img"
      aria-label={`${meta.label}, stade ${stage}`}
      className={cn("h-full w-full", className)}
      style={{
        filter: silhouetteOnly
          ? "drop-shadow(0 0 30px rgba(255,255,255,0.85))"
          : `drop-shadow(0 8px 30px ${accentSoft})`,
      }}
      animate={
        animate
          ? celebrating
            ? { y: [0, -14, 0, -6, 0], scale: [1, 1.06, 1] }
            : { y: [0, -3, 0] }
          : undefined
      }
      transition={
        celebrating
          ? { duration: 0.7, ease: "easeOut" }
          : { duration: 3.4, repeat: Infinity, ease: "easeInOut" }
      }
    >
      <defs>
        {/* Le clip : garantit qu'aucun détail ne bave hors du contour */}
        <clipPath id={`clip-${uid}`}>
          <path d={spec.silhouette} />
        </clipPath>

        {/* Volume : lumière en haut à gauche */}
        <radialGradient id={`skin-${uid}`} cx="32%" cy="22%" r="82%">
          <stop offset="0%" stopColor={accent} stopOpacity="0.72" />
          <stop offset="55%" stopColor={accent} stopOpacity="0.3" />
          <stop offset="100%" stopColor={accent} stopOpacity="0.14" />
        </radialGradient>

        {/* Ombre interne au bas du corps : c'est elle qui donne le poids */}
        <linearGradient id={`weight-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(240 40% 3%)" stopOpacity="0" />
          <stop offset="100%" stopColor="hsl(240 40% 3%)" stopOpacity="0.55" />
        </linearGradient>

        {/* Liseré : vif sur le dessus, éteint en bas — lumière du ciel */}
        <linearGradient id={`rim-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(0 0% 100%)" stopOpacity="0.75" />
          <stop offset="45%" stopColor={accent} stopOpacity="0.6" />
          <stop offset="100%" stopColor={accent} stopOpacity="0.15" />
        </linearGradient>

        {/* Nappe claire du ventre et des joues */}
        <radialGradient id={`pale-${uid}`} cx="50%" cy="38%" r="68%">
          <stop offset="0%" stopColor="hsl(0 0% 100%)" stopOpacity="0.3" />
          <stop offset="100%" stopColor="hsl(0 0% 100%)" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Tout est mis à l'échelle du stade, ANCRÉ AU SOL : la créature
          grandit vers le haut au lieu de gonfler depuis son centre. */}
      <g
        transform={`translate(100 ${GROUND_Y}) scale(${spec.scale}) translate(-100 ${-GROUND_Y})`}
      >
      {/* ── Mode ombre chinoise : on s'arrête au contour ── */}
      {silhouetteOnly ? (
        <>
          <g opacity="0.95">
            <Behind species={species} spec={spec} uid={uid} accent="#fff" flat />
            {spec.hasRuff && (
              <Ruff spec={spec} accent="#fff" uid={uid} flat />
            )}
            <path d={spec.silhouette} fill="hsl(0 0% 100%)" />
            <Ears species={species} spec={spec} uid={uid} accent="#fff" flat />
          </g>
        </>
      ) : (
        <>
          {/* Ombre portée au sol */}
          <ellipse
            cx="100"
            cy={spec.footY + 12}
            rx={spec.shadowRx}
            ry="6"
            fill="hsl(240 30% 2%)"
            opacity="0.45"
          />

          {/* Ornements de la nature, derrière la créature */}
          {nature && (
            <Ornaments
              kind={nature.ornament}
              accent={accent}
              spec={spec}
              animate={animate && !asleep}
              layer="back"
            />
          )}

          {/* Derrière le corps : queue, ailes */}
          <Behind species={species} spec={spec} uid={uid} accent={accent} />

          {/* La collerette : l'attribut réservé à l'adulte */}
          {spec.hasRuff && <Ruff spec={spec} accent={accent} uid={uid} />}

          {/* Les oreilles passent sous la silhouette : la jointure disparaît */}
          <Ears species={species} spec={spec} uid={uid} accent={accent} />

          {/* LA SILHOUETTE — une seule forme, un seul contour */}
          <path d={spec.silhouette} fill={`url(#skin-${uid})`} />

          {/* Tous les détails, découpés par le contour */}
          <g clipPath={`url(#clip-${uid})`}>
            {/* Poids en bas du corps */}
            <rect
              x="0"
              y={spec.belly.y - 30}
              width="200"
              height="120"
              fill={`url(#weight-${uid})`}
            />
            {/* Ventre clair */}
            <ellipse
              cx={spec.belly.x}
              cy={spec.belly.y}
              rx={spec.belly.rx}
              ry={spec.belly.ry}
              fill={`url(#pale-${uid})`}
            />
            {/* Museau clair */}
            <ellipse
              cx={spec.face.x}
              cy={spec.face.y + spec.face.r * 0.42}
              rx={spec.face.r * 0.52}
              ry={spec.face.r * 0.38}
              fill={`url(#pale-${uid})`}
            />
            {/* Reflet spéculaire en haut à gauche */}
            <ellipse
              cx={spec.face.x - spec.face.r * 0.42}
              cy={spec.face.y - spec.face.r * 0.5}
              rx={spec.face.r * 0.3}
              ry={spec.face.r * 0.4}
              fill="hsl(0 0% 100%)"
              opacity="0.16"
              transform={`rotate(-25 ${spec.face.x - spec.face.r * 0.42} ${
                spec.face.y - spec.face.r * 0.5
              })`}
            />
            {/* Séparation des orteils : deux entailles sombres */}
            {[-1, 1].map((side) => (
              <path
                key={side}
                d={`M ${100 + side * 13} ${spec.footY + 6}
                    L ${100 + side * 13} ${spec.footY - 6}`}
                stroke="hsl(240 40% 4%)"
                strokeOpacity="0.4"
                strokeWidth="3"
                strokeLinecap="round"
              />
            ))}
          </g>

          {/* Le liseré, par-dessus : un seul trait continu */}
          <path
            d={spec.silhouette}
            fill="none"
            stroke={`url(#rim-${uid})`}
            strokeWidth="2"
          />

          {/* ── Le visage ── */}
          <Face
            species={species}
            spec={spec}
            accent={accent}
            eyesShut={eyesShut}
            px={px}
            py={py}
          />

          {/* Ornements de la nature, devant (les plus lumineux) */}
          {nature && (
            <Ornaments
              kind={nature.ornament}
              accent={accent}
              spec={spec}
              animate={animate && !asleep}
              layer="front"
            />
          )}

          {/* Zzz quand elle dort */}
          {asleep && animate && <SleepZs accent={accent} spec={spec} />}
        </>
      )}
      </g>
    </motion.svg>
  );
}

/**
 * COLLERETTE — six touffes autour du cou, réservées au stade adulte.
 * Dessinée AVANT la silhouette (donc dessous) : seule la partie qui dépasse
 * du corps se voit, la base reste cachée.
 */
function Ruff({
  spec,
  accent,
  uid,
  flat = false,
}: {
  spec: StageSpec;
  accent: string;
  uid: string;
  flat?: boolean;
}) {
  const { face } = spec;
  // Le cou : entre le bas du crâne et le haut du poitrail
  const neckY = face.y + face.r * 1.55;
  const inner = face.r * 0.92;
  const outer = face.r * 1.62;

  return (
    <g>
      {[196, 218, 244, 296, 322, 344].map((deg) => {
        const a = (deg * Math.PI) / 180;
        // Base large : des touffes trop fines ressemblaient à des piquants
        const spread = 0.26;
        const p1 = {
          x: 100 + Math.cos(a - spread) * inner,
          y: neckY + Math.sin(a - spread) * inner * 0.75,
        };
        const p2 = {
          x: 100 + Math.cos(a + spread) * inner,
          y: neckY + Math.sin(a + spread) * inner * 0.75,
        };
        const tip = {
          x: 100 + Math.cos(a) * outer,
          y: neckY + Math.sin(a) * outer * 0.75,
        };
        return (
          <path
            key={deg}
            d={`M ${p1.x} ${p1.y} L ${tip.x} ${tip.y} L ${p2.x} ${p2.y} Z`}
            fill={flat ? "hsl(0 0% 100%)" : `url(#skin-${uid})`}
            stroke={flat ? "none" : accent}
            strokeOpacity="0.5"
            strokeWidth="1.4"
          />
        );
      })}
    </g>
  );
}

/* ════════════════════════════════════════════════════════════════
 * DERRIÈRE LE CORPS — queue, ailes
 * ════════════════════════════════════════════════════════════════ */

function Behind({
  species,
  spec,
  uid,
  accent,
  flat = false,
}: {
  species: Species;
  spec: StageSpec;
  uid: string;
  accent: string;
  /** Mode ombre chinoise : blanc plein, sans dégradé */
  flat?: boolean;
}) {
  const fill = flat ? "hsl(0 0% 100%)" : `url(#skin-${uid})`;
  const stroke = flat ? "none" : accent;

  // Ancrage DANS le corps (le contour du corps masquera la naissance de la
  // queue), et taille proportionnelle à la créature : une queue exprimée en
  // pixels absolus disparaissait derrière le corps des grands stades.
  const ax = spec.tail.x - 10;
  const ay = spec.tail.y;
  const S = spec.face.r * spec.tailScale;

  switch (species) {
    case "renard":
      // Grosse queue touffue relevée, bout clair : LA signature du renard
      return (
        <>
          <path
            d={`M ${ax} ${ay + 0.2 * S}
                C ${ax + 0.9 * S} ${ay + 0.15 * S} ${ax + 1.5 * S} ${ay - 0.7 * S} ${ax + 1.15 * S} ${ay - 1.5 * S}
                C ${ax + 2.1 * S} ${ay - 1.1 * S} ${ax + 1.9 * S} ${ay + 0.15 * S} ${ax + 0.6 * S} ${ay + 0.62 * S} Z`}
            fill={fill}
            stroke={stroke}
            strokeOpacity="0.5"
            strokeWidth="1.6"
          />
          {!flat && (
            <path
              d={`M ${ax + 1.15 * S} ${ay - 1.5 * S}
                  C ${ax + 1.8 * S} ${ay - 1.25 * S} ${ax + 1.85 * S} ${ay - 0.6 * S} ${ax + 1.6 * S} ${ay - 0.3 * S}
                  C ${ax + 1.72 * S} ${ay - 0.95 * S} ${ax + 1.55 * S} ${ay - 1.3 * S} ${ax + 1.15 * S} ${ay - 1.5 * S} Z`}
              fill="hsl(0 0% 100%)"
              fillOpacity="0.38"
            />
          )}
        </>
      );

    case "chat":
      // Queue fine dressée en point d'interrogation
      return (
        <path
          d={`M ${ax} ${ay + 0.15 * S}
              C ${ax + 0.85 * S} ${ay + 0.1 * S} ${ax + 1.3 * S} ${ay - 0.6 * S} ${ax + 1.05 * S} ${ay - 1.25 * S}
              C ${ax + 0.9 * S} ${ay - 1.75 * S} ${ax + 0.3 * S} ${ay - 1.75 * S} ${ax + 0.32 * S} ${ay - 1.25 * S}`}
          fill="none"
          stroke={flat ? "hsl(0 0% 100%)" : accent}
          strokeOpacity={flat ? 1 : 0.85}
          strokeWidth={S * 0.26}
          strokeLinecap="round"
        />
      );

    case "axolotl":
      // Queue plate de salamandre, palmée
      return (
        <path
          d={`M ${ax} ${ay - 0.2 * S}
              C ${ax + 0.9 * S} ${ay - 0.6 * S} ${ax + 1.6 * S} ${ay - 0.3 * S} ${ax + 1.7 * S} ${ay + 0.45 * S}
              C ${ax + 1.15 * S} ${ay + 0.75 * S} ${ax + 0.4 * S} ${ay + 0.6 * S} ${ax} ${ay + 0.35 * S} Z`}
          fill={fill}
          stroke={stroke}
          strokeOpacity="0.5"
          strokeWidth="1.6"
        />
      );

    case "hibou":
      // Deux ailes repliées, épousant les flancs
      return (
        <>
          {[-1, 1].map((side) => (
            <path
              key={side}
              d={`M ${100 + side * 40} ${spec.face.y + spec.face.r * 0.9}
                  C ${100 + side * 58} ${spec.belly.y - 16} ${100 + side * 54} ${spec.footY - 8} ${100 + side * 34} ${spec.footY}
                  C ${100 + side * 40} ${spec.belly.y} ${100 + side * 40} ${spec.face.y + spec.face.r} ${100 + side * 40} ${spec.face.y + spec.face.r * 0.9} Z`}
              fill={flat ? "hsl(0 0% 100%)" : accent}
              fillOpacity={flat ? 1 : 0.34}
              stroke={stroke}
              strokeOpacity="0.45"
              strokeWidth="1.4"
            />
          ))}
        </>
      );
  }
}

/* ════════════════════════════════════════════════════════════════
 * OREILLES (ou branchies) — sous la silhouette
 * ════════════════════════════════════════════════════════════════ */

function Ears({
  species,
  spec,
  uid,
  accent,
  flat = false,
}: {
  species: Species;
  spec: StageSpec;
  uid: string;
  accent: string;
  flat?: boolean;
}) {
  const fill = flat ? "hsl(0 0% 100%)" : `url(#skin-${uid})`;
  const stroke = flat ? "none" : accent;
  const { x, y, r } = spec.face;
  const e = spec.earScale;

  /**
   * Les oreilles s'ancrent sur le HAUT du crâne, pas sur le centre du visage.
   * Le sommet de la silhouette est à environ y - 1.12 r : une oreille dont la
   * pointe ne dépassait pas cette ligne restait prisonnière de la tête.
   */
  const ear = (side: number, tipUp: number, spread: number, lean: number) =>
    `M ${x + side * r * spread} ${y - r * 0.6}
     L ${x + side * r * lean} ${y - r * tipUp}
     L ${x + side * r * 0.12} ${y - r * 1.06} Z`;

  switch (species) {
    case "renard":
      // Très grandes oreilles pointues : LA signature du renard
      return (
        <>
          {[-1, 1].map((side) => (
            <g key={side}>
              <path
                d={ear(side, 1.5 + 0.55 * e, 0.74, 0.62)}
                fill={fill}
                stroke={stroke}
                strokeOpacity="0.5"
                strokeWidth="1.6"
              />
              {!flat && (
                <path
                  d={`M ${x + side * r * 0.6} ${y - r * 0.72}
                      L ${x + side * r * 0.56} ${y - r * (1.28 + 0.42 * e)}
                      L ${x + side * r * 0.26} ${y - r * 0.98} Z`}
                  fill={accent}
                  fillOpacity="0.6"
                />
              )}
            </g>
          ))}
        </>
      );

    case "chat":
      // Oreilles plus courtes et plus écartées
      return (
        <>
          {[-1, 1].map((side) => (
            <g key={side}>
              <path
                d={ear(side, 1.34 + 0.34 * e, 0.82, 0.72)}
                fill={fill}
                stroke={stroke}
                strokeOpacity="0.5"
                strokeWidth="1.6"
              />
              {!flat && (
                <path
                  d={`M ${x + side * r * 0.7} ${y - r * 0.72}
                      L ${x + side * r * 0.66} ${y - r * (1.18 + 0.26 * e)}
                      L ${x + side * r * 0.34} ${y - r * 0.95} Z`}
                  fill={accent}
                  fillOpacity="0.6"
                />
              )}
            </g>
          ))}
        </>
      );

    case "axolotl":
      // Pas d'oreilles : six branchies plumeuses, l'autre signature forte
      return (
        <>
          {[-1, 1].map((side) =>
            [
              { dy: -0.42, len: 0.72 },
              { dy: -0.05, len: 0.88 },
              { dy: 0.32, len: 0.68 },
            ].map((gill, i) => {
              const len = r * gill.len * e;
              const gy = y + r * gill.dy;
              // Sur le bord du crâne (demi-largeur ≈ 1.05 r), pas à l'intérieur
              const gx = x + side * r * 1.02;
              return (
                <g key={`${side}-${i}`}>
                  <path
                    d={`M ${gx} ${gy}
                        Q ${gx + side * len * 0.6} ${gy - len * 0.34} ${gx + side * len} ${gy - len * 0.12}`}
                    fill="none"
                    stroke={flat ? "hsl(0 0% 100%)" : accent}
                    strokeOpacity={flat ? 1 : 0.75}
                    strokeWidth={r * 0.13}
                    strokeLinecap="round"
                  />
                  <circle
                    cx={gx + side * len}
                    cy={gy - len * 0.12}
                    r={r * 0.14}
                    fill={flat ? "hsl(0 0% 100%)" : accent}
                    fillOpacity={flat ? 1 : 0.6}
                  />
                </g>
              );
            })
          )}
        </>
      );

    case "hibou":
      // Aigrettes fines et écartées
      return (
        <>
          {[-1, 1].map((side) => (
            <path
              key={side}
              d={`M ${x + side * r * 0.66} ${y - r * 0.52}
                  L ${x + side * r * 0.48} ${y - r * (0.52 + 0.7 * e)}
                  L ${x + side * r * 0.2} ${y - r * 0.8} Z`}
              fill={fill}
              stroke={stroke}
              strokeOpacity="0.5"
              strokeWidth="1.4"
            />
          ))}
        </>
      );
  }
}

/* ════════════════════════════════════════════════════════════════
 * LE VISAGE
 * ════════════════════════════════════════════════════════════════ */

function Face({
  species,
  spec,
  accent,
  eyesShut,
  px,
  py,
}: {
  species: Species;
  spec: StageSpec;
  accent: string;
  eyesShut: boolean;
  px: number;
  py: number;
}) {
  const { x, y, r } = spec.face;
  const owl = species === "hibou";

  // Yeux plus écartés et plus bas que dans la première version : centrés trop
  // haut et trop serrés, le visage ne se lisait pas comme un visage.
  // `eyeScale` les fait rétrécir en grandissant — c'est le signal « bébé »
  // le plus puissant après la taille générale.
  const k = spec.eyeScale;
  const dx = r * (owl ? 0.42 : 0.4);
  const ex = r * (owl ? 0.34 : 0.26) * k;
  const ey = r * (owl ? 0.34 : 0.3) * k;
  const pr = r * (owl ? 0.16 : 0.14) * k;
  const eyeY = y + r * 0.1;

  return (
    <>
      {/* Joues */}
      {!owl &&
        [-1, 1].map((side) => (
          <circle
            key={side}
            cx={x + side * r * 0.62}
            cy={y + r * 0.34}
            r={r * 0.16}
            fill={accent}
            fillOpacity="0.42"
          />
        ))}

      {/* Disques faciaux du hibou */}
      {owl &&
        [-1, 1].map((side) => (
          <circle
            key={side}
            cx={x + side * dx}
            cy={eyeY}
            r={r * 0.44}
            fill={accent}
            fillOpacity="0.24"
            stroke={accent}
            strokeOpacity="0.4"
            strokeWidth="1.2"
          />
        ))}

      {/* Yeux */}
      {eyesShut ? (
        [-1, 1].map((side) => (
          <path
            key={side}
            d={`M ${x + side * dx - ex} ${eyeY}
                Q ${x + side * dx} ${eyeY + ey * 0.75} ${x + side * dx + ex} ${eyeY}`}
            fill="none"
            stroke="hsl(210 20% 96%)"
            strokeOpacity="0.85"
            strokeWidth={r * 0.075}
            strokeLinecap="round"
          />
        ))
      ) : (
        [-1, 1].map((side) => (
          <g key={side}>
            <ellipse
              cx={x + side * dx}
              cy={eyeY}
              rx={ex}
              ry={ey}
              fill="hsl(210 20% 97%)"
            />
            <circle
              cx={x + side * dx + px}
              cy={eyeY + py}
              r={pr}
              fill="hsl(240 14% 8%)"
            />
            {/* Le reflet : c'est lui qui rend le regard vivant */}
            <circle
              cx={x + side * dx + px - pr * 0.38}
              cy={eyeY + py - pr * 0.48}
              r={pr * 0.34}
              fill="hsl(0 0% 100%)"
              fillOpacity="0.95"
            />
          </g>
        ))
      )}

      {/* Bouche, truffe, bec, moustaches */}
      <Mouth species={species} spec={spec} accent={accent} asleep={eyesShut} />
    </>
  );
}

function Mouth({
  species,
  spec,
  accent,
  asleep,
}: {
  species: Species;
  spec: StageSpec;
  accent: string;
  asleep: boolean;
}) {
  const { x, y, r } = spec.face;
  const my = y + r * 0.42;

  if (species === "hibou") {
    return (
      <path
        d={`M ${x - r * 0.15} ${my - r * 0.1}
            L ${x + r * 0.15} ${my - r * 0.1}
            L ${x} ${my + r * 0.3} Z`}
        fill={accent}
        fillOpacity="0.9"
      />
    );
  }

  if (species === "axolotl") {
    // Le sourire permanent, très large
    return (
      <path
        d={`M ${x - r * 0.4} ${my - r * 0.05}
            Q ${x} ${my + r * 0.34} ${x + r * 0.4} ${my - r * 0.05}`}
        fill="none"
        stroke="hsl(210 20% 96%)"
        strokeOpacity="0.85"
        strokeWidth={r * 0.07}
        strokeLinecap="round"
      />
    );
  }

  // Renard et chat : truffe + bouche en W + moustaches
  const whiskerLen = species === "chat" ? r * 0.95 : r * 0.7;
  return (
    <>
      <path
        d={`M ${x - r * 0.1} ${my - r * 0.12}
            L ${x + r * 0.1} ${my - r * 0.12}
            L ${x} ${my + r * 0.06} Z`}
        fill="hsl(210 20% 96%)"
        fillOpacity="0.9"
      />
      {asleep ? (
        <path
          d={`M ${x - r * 0.12} ${my + r * 0.18} Q ${x} ${my + r * 0.28} ${x + r * 0.12} ${my + r * 0.18}`}
          fill="none"
          stroke="hsl(210 20% 96%)"
          strokeOpacity="0.6"
          strokeWidth={r * 0.055}
          strokeLinecap="round"
        />
      ) : (
        <path
          d={`M ${x} ${my + r * 0.06} Q ${x - r * 0.14} ${my + r * 0.3} ${x - r * 0.27} ${my + r * 0.18}
              M ${x} ${my + r * 0.06} Q ${x + r * 0.14} ${my + r * 0.3} ${x + r * 0.27} ${my + r * 0.18}`}
          fill="none"
          stroke="hsl(210 20% 96%)"
          strokeOpacity="0.72"
          strokeWidth={r * 0.055}
          strokeLinecap="round"
        />
      )}
      {/* Moustaches : partent du museau, pas du milieu de la joue */}
      {[-1, 1].map((side) => (
        <g
          key={side}
          stroke={accent}
          strokeOpacity="0.6"
          strokeWidth={r * 0.045}
          strokeLinecap="round"
        >
          <line
            x1={x + side * r * 0.34}
            y1={my}
            x2={x + side * (r * 0.34 + whiskerLen)}
            y2={my - r * 0.16}
          />
          <line
            x1={x + side * r * 0.34}
            y1={my + r * 0.1}
            x2={x + side * (r * 0.34 + whiskerLen)}
            y2={my + r * 0.22}
          />
        </g>
      ))}
    </>
  );
}

/** Les Z qui montent quand elle dort. */
function SleepZs({ accent, spec }: { accent: string; spec: StageSpec }) {
  return (
    <g>
      {[
        { x: 142, delay: 0, size: 13 },
        { x: 154, delay: 0.6, size: 10 },
        { x: 163, delay: 1.2, size: 8 },
      ].map((z, i) => (
        <motion.text
          key={i}
          x={z.x}
          y={spec.face.y - spec.face.r * 0.7}
          fontSize={z.size}
          fontWeight="700"
          fill={accent}
          fontFamily="ui-monospace, monospace"
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: [0, 0.9, 0], y: [0, -26, -40] }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: z.delay,
            ease: "easeOut",
          }}
        >
          z
        </motion.text>
      ))}
    </g>
  );
}

/* ════════════════════════════════════════════════════════════════
 * ORNEMENTS DE NATURE
 * Ce qui distingue un Ardent d'un Onde à première vue, au-delà de la
 * couleur. Deux couches : `back` passe derrière la créature (halos, gros
 * éléments), `front` par-dessus (étincelles, gouttes qui tombent).
 * ════════════════════════════════════════════════════════════════ */

/**
 * Une flamme : goutte asymétrique dont la pointe part vers la droite,
 * base en (x, y), hauteur h. L'asymétrie est ce qui la distingue d'une feuille.
 */
function flamePath(x: number, y: number, h: number): string {
  return `M ${x} ${y}
    C ${x - h * 0.42} ${y - h * 0.28} ${x - h * 0.34} ${y - h * 0.66} ${x + h * 0.06} ${y - h}
    C ${x + h * 0.16} ${y - h * 0.6} ${x + h * 0.44} ${y - h * 0.5} ${x + h * 0.38} ${y - h * 0.22}
    C ${x + h * 0.34} ${y - h * 0.05} ${x + h * 0.18} ${y} ${x} ${y} Z`;
}

function Ornaments({
  kind,
  accent,
  spec,
  animate,
  layer,
}: {
  kind: Ornament;
  accent: string;
  spec: StageSpec;
  animate: boolean;
  layer: "back" | "front";
}) {
  const { face, footY } = spec;

  /** Répétition infinie, désactivée si les animations sont réduites. */
  const loop = (duration: number, delay = 0) =>
    animate
      ? { duration, delay, repeat: Infinity, ease: "easeInOut" as const }
      : { duration: 0 };

  switch (kind) {
    /* ── FEU : flammes qui léchent le corps + halo chaud ── */
    case "flames":
      if (layer === "back") {
        return (
          <motion.ellipse
            cx="100"
            cy={face.y + 30}
            rx="62"
            ry="72"
            fill={accent}
            opacity="0.1"
            animate={animate ? { opacity: [0.07, 0.17, 0.07] } : undefined}
            transition={loop(2.4)}
          />
        );
      }
      // Flammes posées sur la ligne du sol, DE PART ET D'AUTRE de la
      // silhouette (demi-largeur max ≈ 46) : dessinées sur le corps, elles
      // ressemblaient à des taches de peinture.
      return (
        <g>
          {[
            { x: 42, h: 30, d: 0 },
            { x: 158, h: 26, d: 0.45 },
            { x: 54, h: 18, d: 0.9 },
            { x: 148, h: 15, d: 1.35 },
          ].map((f, i) => (
            <motion.path
              key={i}
              d={flamePath(f.x, footY + 6, f.h)}
              fill={accent}
              animate={
                animate
                  ? {
                      opacity: [0.45, 0.95, 0.45],
                      scaleY: [0.85, 1.2, 0.85],
                      scaleX: [1.05, 0.9, 1.05],
                    }
                  : { opacity: 0.8 }
              }
              transition={loop(1.25, f.d)}
              style={{ transformOrigin: `${f.x}px ${footY + 6}px` }}
            />
          ))}
        </g>
      );

    /* ── EAU : bulles qui montent + reflet ondulant ── */
    case "drops":
      if (layer === "back") {
        return (
          <g>
            {[
              { x: 58, r: 4, d: 0 },
              { x: 142, r: 3, d: 0.9 },
              { x: 70, r: 2.5, d: 1.8 },
            ].map((b, i) => (
              <motion.circle
                key={i}
                cx={b.x}
                r={b.r}
                fill={accent}
                opacity="0.5"
                initial={{ cy: footY }}
                animate={
                  animate
                    ? { cy: [footY, face.y - 30], opacity: [0, 0.6, 0] }
                    : { cy: face.y + 20 }
                }
                transition={{
                  duration: 3.4,
                  delay: b.d,
                  repeat: Infinity,
                  ease: "easeOut",
                }}
              />
            ))}
          </g>
        );
      }
      return (
        <g>
          {[-1, 1].map((side) => (
            <motion.path
              key={side}
              d={`M ${100 + side * 46} ${footY - 6}
                  q ${side * 10} ${-5} ${side * 20} 0`}
              fill="none"
              stroke={accent}
              strokeWidth="2.5"
              strokeLinecap="round"
              opacity="0.55"
              animate={animate ? { opacity: [0.2, 0.7, 0.2] } : undefined}
              transition={loop(2, side === 1 ? 0.5 : 0)}
            />
          ))}
        </g>
      );

    /* ── FOUDRE : arcs électriques saccadés ── */
    case "sparks":
      if (layer === "back") {
        return (
          <motion.circle
            cx="100"
            cy={face.y + 20}
            r="70"
            fill="none"
            stroke={accent}
            strokeWidth="1.5"
            strokeDasharray="3 10"
            opacity="0.35"
            animate={animate ? { rotate: 360 } : undefined}
            transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
            style={{ transformOrigin: `100px ${face.y + 20}px` }}
          />
        );
      }
      return (
        <g>
          {[
            { x: 56, y: face.y - 6, d: 0 },
            { x: 146, y: face.y + 16, d: 0.55 },
            { x: 66, y: footY - 22, d: 1.1 },
          ].map((s, i) => (
            <motion.path
              key={i}
              d={`M ${s.x} ${s.y} l 7 6 l -4 2 l 8 8 l -10 -5 l 4 -2 Z`}
              fill={accent}
              animate={
                animate
                  ? { opacity: [0, 1, 0, 0, 0], scale: [0.7, 1.15, 0.9, 0.9, 0.9] }
                  : { opacity: 0.9 }
              }
              transition={{
                duration: 1.8,
                delay: s.d,
                repeat: Infinity,
                times: [0, 0.08, 0.18, 0.6, 1],
              }}
              style={{ transformOrigin: `${s.x}px ${s.y}px` }}
            />
          ))}
        </g>
      );

    /* ── PLANTE : pousse sur la tête + feuilles qui tombent ── */
    case "leaves":
      if (layer === "back") {
        return (
          <g>
            {[
              { x: 60, d: 0 },
              { x: 140, d: 1.4 },
            ].map((l, i) => (
              <motion.path
                key={i}
                d={`M ${l.x} ${face.y} q 6 -5 12 0 q -6 5 -12 0 Z`}
                fill={accent}
                opacity="0.5"
                initial={{ y: 0, rotate: 0 }}
                animate={
                  animate
                    ? { y: [0, footY - face.y], rotate: [0, 160], opacity: [0, 0.6, 0] }
                    : undefined
                }
                transition={{
                  duration: 4.2,
                  delay: l.d,
                  repeat: Infinity,
                  ease: "easeIn",
                }}
              />
            ))}
          </g>
        );
      }
      return (
        // La petite pousse sur le crâne : le détail qui la rend attachante
        <motion.g
          animate={animate ? { rotate: [-6, 6, -6] } : undefined}
          transition={loop(3)}
          // Grossie : coincée entre les oreilles, la pousse passait inaperçue
          style={{
            transformOrigin: `100px ${face.y - face.r * 1.1}px`,
            scale: 1.45,
          }}
        >
          <path
            d={`M 100 ${face.y - face.r * 1.08} l 0 ${-face.r * 0.3}`}
            stroke={accent}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d={`M 100 ${face.y - face.r * 1.3}
                q ${face.r * 0.26} ${-face.r * 0.14} ${face.r * 0.3} ${face.r * 0.1}
                q ${-face.r * 0.22} ${face.r * 0.1} ${-face.r * 0.3} ${-face.r * 0.1} Z`}
            fill={accent}
          />
          <path
            d={`M 100 ${face.y - face.r * 1.24}
                q ${-face.r * 0.24} ${-face.r * 0.12} ${-face.r * 0.28} ${face.r * 0.08}
                q ${face.r * 0.2} ${face.r * 0.09} ${face.r * 0.28} ${-face.r * 0.08} Z`}
            fill={accent}
            opacity="0.8"
          />
        </motion.g>
      );

    /* ── LUNAIRE : volutes fantomatiques ── */
    case "wisps":
      if (layer === "back") {
        return (
          <motion.ellipse
            cx="100"
            cy={face.y + 26}
            rx="66"
            ry="76"
            fill={accent}
            opacity="0.09"
            animate={animate ? { scale: [1, 1.07, 1], opacity: [0.06, 0.15, 0.06] } : undefined}
            transition={loop(4)}
            style={{ transformOrigin: `100px ${face.y + 26}px` }}
          />
        );
      }
      return (
        <g>
          {[
            { x: 54, y: face.y + 10, d: 0 },
            { x: 148, y: face.y + 34, d: 1.3 },
            { x: 64, y: footY - 30, d: 2.4 },
          ].map((w, i) => (
            <motion.path
              key={i}
              d={`M ${w.x} ${w.y} q 8 -8 16 0 q -8 8 -16 0 Z`}
              fill={accent}
              animate={
                animate
                  ? { y: [0, -22], opacity: [0, 0.65, 0], scale: [0.7, 1.2] }
                  : { opacity: 0.5 }
              }
              transition={{
                duration: 3.6,
                delay: w.d,
                repeat: Infinity,
                ease: "easeOut",
              }}
              style={{ transformOrigin: `${w.x}px ${w.y}px` }}
            />
          ))}
        </g>
      );

    /* ── ÉQUILIBRE : étoiles en orbite ── */
    case "stars":
      if (layer === "back") return null;
      return (
        <motion.g
          animate={animate ? { rotate: 360 } : undefined}
          transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: `100px ${face.y + 24}px` }}
        >
          {[0, 120, 240].map((angle, i) => {
            const rad = (angle * Math.PI) / 180;
            const cx = 100 + Math.cos(rad) * 68;
            const cy = face.y + 24 + Math.sin(rad) * 62;
            const s = 4 + i;
            return (
              <motion.path
                key={angle}
                d={`M ${cx} ${cy - s} L ${cx + s * 0.32} ${cy - s * 0.32}
                    L ${cx + s} ${cy} L ${cx + s * 0.32} ${cy + s * 0.32}
                    L ${cx} ${cy + s} L ${cx - s * 0.32} ${cy + s * 0.32}
                    L ${cx - s} ${cy} L ${cx - s * 0.32} ${cy - s * 0.32} Z`}
                fill={accent}
                animate={animate ? { opacity: [0.35, 1, 0.35] } : undefined}
                transition={loop(2.2, i * 0.5)}
              />
            );
          })}
        </motion.g>
      );
  }
}

/** Exporté pour l'animation d'évolution : le contour brut d'un stade. */
export function stageSilhouette(stage: Exclude<Stage, "egg">): string {
  return STAGE_SPEC[stage].silhouette;
}
