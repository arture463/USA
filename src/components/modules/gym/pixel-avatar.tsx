"use client";

import { motion } from "framer-motion";
import type { MuscleStats } from "@/lib/gym-data";

interface PixelAvatarProps {
  arthurStats: MuscleStats;
  claraStats: MuscleStats;
}

/**
 * REPRODUCTION HAUTE DÉFINITION PIXEL ART DE L'IMAGE DE RÉFÉRENCE (PIXOSLY STYLE)
 *
 * Décor : Carrelage mural blanc à joints sombres, miroir cadre bois, ampoule suspendue.
 * Arthur : Cheveux noirs ébouriffés, débardeur noir, pose double biceps impressionnante.
 * Clara : Cheveux longs noirs avec frange droite, crop top blanc, short noir, smartphone bleu en main.
 */
export function PixelAvatar({ arthurStats, claraStats }: PixelAvatarProps) {
  // Facteurs d'échelle des muscles (1.0 à 1.45)
  const arthurBicepsScale = 1 + Math.min(0.45, (arthurStats.pushLevel + arthurStats.pullLevel) * 0.08);
  const arthurShoulderScale = 1 + Math.min(0.35, arthurStats.pushLevel * 0.07);
  const claraQuadScale = 1 + Math.min(0.35, claraStats.legsLevel * 0.07);
  const claraAbsActive = claraStats.cardioLevel >= 1 || claraStats.legsLevel >= 1;

  return (
    <div className="relative mx-auto w-full max-w-md overflow-hidden rounded-2xl border-4 border-amber-950/80 bg-[#0d0b12] shadow-[0_0_50px_rgba(0,0,0,0.9)]">
      {/* ── 1. FOND DE LA PIÈCE : CARRELAGE BLANC PIXEL ── */}
      <div className="relative h-[380px] w-full bg-[#e8eaed] p-3">
        {/* Joints de carrelage quadrillés */}
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: `
              linear-gradient(to right, #2c3038 2px, transparent 2px),
              linear-gradient(to bottom, #2c3038 2px, transparent 2px)
            `,
            backgroundSize: "32px 32px",
          }}
        />

        {/* Ampoule suspendue en haut */}
        <div className="absolute left-1/2 top-0 z-20 flex -translate-x-1/2 flex-col items-center">
          <div className="h-4 w-1 bg-gray-700" />
          <div className="h-4 w-6 rounded-t-sm bg-gray-400 border border-gray-600" />
          <div className="h-6 w-8 rounded-b-full bg-amber-100 shadow-[0_0_35px_#fef08a]" />
        </div>

        {/* ── 2. GRAND MIROIR CADRE BOIS PIXEL ── */}
        <div className="relative mx-auto mt-6 h-[330px] w-[92%] overflow-hidden rounded-lg border-[10px] border-[#3e2723] bg-[#222831] shadow-2xl">
          {/* Surface du miroir (fond de la pièce reflété) */}
          <div className="absolute inset-0 bg-[#252b36]" />

          {/* Reflet diagonal du verre */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-cyan-400/5 to-white/10" />

          {/* ── DESSIN PIXEL ART DES AVATARS (SVG HAUTE DÉFINITION) ── */}
          <svg
            viewBox="0 0 320 360"
            className="relative h-full w-full drop-shadow-[0_10px_20px_rgba(0,0,0,0.7)]"
            shapeRendering="crispEdges"
          >
            {/* ════════════════════════════════════════════════════════ */}
            {/*  ARTHUR (Derrière Clara — Pose Double Biceps Flex)        */}
            {/* ════════════════════════════════════════════════════════ */}
            <g id="arthur-avatar" className="transition-transform duration-500">
              {/* --- BRAS FLEX GAUCHE (VU EN MIROIR = À GAUCHE DE L'ÉCRAN) --- */}
              <g transform={`translate(70, 145) scale(${arthurBicepsScale}) translate(-70, -145)`}>
                {/* Épaule Gauche */}
                <path d="M 60 145 L 85 130 L 95 155 L 70 170 Z" fill="#d08b5c" />
                {/* Avant-bras levé vers le haut */}
                <path d="M 45 90 L 68 85 L 75 140 L 52 145 Z" fill="#d08b5c" stroke="#5c361e" strokeWidth="2" />
                {/* Biceps bombé */}
                <path
                  d="M 50 110 C 25 105, 25 140, 60 145 C 70 145, 75 125, 50 110 Z"
                  fill="#e59f6f"
                  stroke="#5c361e"
                  strokeWidth="2.5"
                />
                {/* Ombre & relief du muscle */}
                <path d="M 38 118 C 30 120, 35 138, 55 140 Z" fill="#c47a4b" />
                {/* Poing fermé */}
                <rect x="42" y="70" width="22" height="20" rx="3" fill="#d08b5c" stroke="#5c361e" strokeWidth="2" />
              </g>

              {/* --- BRAS FLEX DROIT (À DROITE DE L'ÉCRAN) --- */}
              <g transform={`translate(250, 145) scale(${arthurBicepsScale}) translate(-250, -145)`}>
                {/* Épaule Droite */}
                <path d="M 260 145 L 235 130 L 225 155 L 250 170 Z" fill="#d08b5c" />
                {/* Avant-bras levé vers le haut */}
                <path d="M 275 90 L 252 85 L 245 140 L 268 145 Z" fill="#d08b5c" stroke="#5c361e" strokeWidth="2" />
                {/* Biceps bombé */}
                <path
                  d="M 270 110 C 295 105, 295 140, 260 145 C 250 145, 245 125, 270 110 Z"
                  fill="#e59f6f"
                  stroke="#5c361e"
                  strokeWidth="2.5"
                />
                {/* Ombre & relief du muscle */}
                <path d="M 282 118 C 290 120, 285 138, 265 140 Z" fill="#c47a4b" />
                {/* Poing fermé */}
                <rect x="256" y="70" width="22" height="20" rx="3" fill="#d08b5c" stroke="#5c361e" strokeWidth="2" />
              </g>

              {/* --- TÊTE ARTHUR --- */}
              <g id="arthur-head">
                {/* Cheveux Noirs Ébouriffés (Style Anime/Pixel) */}
                <path
                  d="M 125 50 
                     L 135 38 L 145 48 L 160 32 L 175 48 L 185 36 L 195 50
                     L 205 65 L 202 85 L 118 85 L 115 65 Z"
                  fill="#1a181c"
                />
                {/* Mèches individuelles ébouriffées sur le dessus */}
                <polygon points="140,40 148,25 155,42" fill="#1a181c" />
                <polygon points="165,35 174,20 180,38" fill="#1a181c" />
                <polygon points="120,55 110,45 125,65" fill="#1a181c" />
                <polygon points="200,55 210,45 195,65" fill="#1a181c" />

                {/* Visage Arthur */}
                <rect x="125" y="75" width="70" height="55" rx="6" fill="#e59f6f" stroke="#5c361e" strokeWidth="2" />

                {/* Yeux Marron Expression Confiante */}
                <rect x="138" y="90" width="12" height="10" rx="2" fill="#fff" />
                <rect x="142" y="92" width="6" height="7" fill="#3d2314" />
                <rect x="170" y="90" width="12" height="10" rx="2" fill="#fff" />
                <rect x="172" y="92" width="6" height="7" fill="#3d2314" />
                {/* Sourcils noirs inclinés (pose virile/compétitive) */}
                <line x1="135" y1="84" x2="152" y2="88" stroke="#1a181c" strokeWidth="3.5" strokeLinecap="round" />
                <line x1="185" y1="84" x2="168" y2="88" stroke="#1a181c" strokeWidth="3.5" strokeLinecap="round" />

                {/* Nez & Sourire discret */}
                <rect x="158" y="102" width="4" height="6" fill="#c47a4b" />
                <path d="M 152 118 Q 160 123 168 118" fill="none" stroke="#5c361e" strokeWidth="2.5" strokeLinecap="round" />
              </g>

              {/* --- TORSE ARTHUR (DÉBARDEUR NOIR MUSCLÉ) --- */}
              <g id="arthur-torso">
                <path
                  d="M 100 130 L 220 130 L 210 240 L 110 240 Z"
                  fill="#141419"
                  stroke="#2d2d38"
                  strokeWidth="3"
                />
                {/* Lignes du débardeur & pectoraux dessinés sous le tissu */}
                <path d="M 125 130 L 140 170 L 180 170 L 195 130" fill="none" stroke="#e59f6f" strokeWidth="3" />
                {/* Encolure du débardeur */}
                <path d="M 140 130 C 140 155, 180 155, 180 130 Z" fill="#e59f6f" />
              </g>
            </g>

            {/* ════════════════════════════════════════════════════════ */}
            {/*  CLARA (Devant Arthur — Pose Selfie Miroir avec Phone)     */}
            {/* ════════════════════════════════════════════════════════ */}
            <g id="clara-avatar" transform="translate(0, 40)">
              {/* --- CHEVEUX LONGS NOIRS CLARA (ARRIÈRE) --- */}
              <path
                d="M 110 120 
                   C 100 80, 220 80, 210 120
                   L 225 250 L 95 250 Z"
                fill="#0d0c10"
              />

              {/* --- TÊTE & VISAGE CLARA --- */}
              <g id="clara-head">
                {/* Visage Teint Doux */}
                <rect x="130" y="110" width="60" height="50" rx="8" fill="#f5c2a3" stroke="#6b3e26" strokeWidth="2" />

                {/* Frange Droit Noire */}
                <path d="M 124 102 L 196 102 L 196 122 Q 160 126 124 122 Z" fill="#0d0c10" />

                {/* Yeux Noirs Mignons Pixel */}
                <rect x="142" y="126" width="10" height="12" rx="3" fill="#fff" />
                <rect x="144" y="128" width="6" height="8" fill="#1a181c" />
                <rect x="168" y="126" width="10" height="12" rx="3" fill="#fff" />
                <rect x="168" y="128" width="6" height="8" fill="#1a181c" />
                {/* Reflets blancs mignons dans les yeux */}
                <circle cx="145" cy="130" r="1.5" fill="#fff" />
                <circle cx="169" cy="130" r="1.5" fill="#fff" />

                {/* Joues Rosées Mignonnes */}
                <ellipse cx="138" cy="142" rx="5" ry="3" fill="#f48fb1" opacity="0.6" />
                <ellipse cx="182" cy="142" rx="5" ry="3" fill="#f48fb1" opacity="0.6" />

                {/* Petite bouche souriante */}
                <path d="M 156 148 Q 160 152 164 148" fill="none" stroke="#6b3e26" strokeWidth="2" strokeLinecap="round" />

                {/* Collier Pendentif Croissant de Lune */}
                <path d="M 148 160 Q 160 172 172 160" fill="none" stroke="#e0e0e0" strokeWidth="1.5" />
                <circle cx="160" cy="167" r="2.5" fill="#ffd54f" />
              </g>

              {/* --- CROP TOP BLANC CLARA --- */}
              <g id="clara-top">
                <path
                  d="M 132 165 L 188 165 L 194 210 L 126 210 Z"
                  fill="#ffffff"
                  stroke="#d1d5db"
                  strokeWidth="2"
                />
                {/* Décolleté rond du crop top */}
                <path d="M 145 165 C 145 178, 175 178, 175 165 Z" fill="#f5c2a3" />
              </g>

              {/* --- BRAS GAUCHE CLARA & SMARTPHONE BLEU (SELFIE MIRROR) --- */}
              <g id="clara-phone-arm">
                {/* Bras levé tenant le téléphone */}
                <path d="M 188 175 L 215 170 L 210 215 L 188 200 Z" fill="#f5c2a3" stroke="#6b3e26" strokeWidth="2" />

                {/* Coque Bleu Smartphone (Comme l'image de référence !) */}
                <rect x="202" y="160" width="22" height="38" rx="4" fill="#0284c7" stroke="#0f172a" strokeWidth="2.5" />
                {/* Écran / Caméras du Smartphone */}
                <circle cx="209" cy="168" r="3" fill="#1e293b" />
                <circle cx="217" cy="168" r="2" fill="#1e293b" />
                <rect x="206" y="176" width="14" height="18" rx="1" fill="#38bdf8" opacity="0.8" />
              </g>

              {/* --- TAILLE & ABDOS CLARA --- */}
              <g id="clara-abs">
                <rect x="135" y="210" width="50" height="22" fill="#f5c2a3" stroke="#6b3e26" strokeWidth="1.5" />
                {claraAbsActive && (
                  <path d="M 160 212 L 160 230 M 150 220 L 170 220" stroke="#d08b5c" strokeWidth="1.5" opacity="0.6" />
                )}
              </g>

              {/* --- SHORT NOIR CLARA (CUISSES GALBÉES) --- */}
              <g id="clara-shorts" transform={`scale(${claraQuadScale}, 1) translate(${(1 - claraQuadScale) * 160}, 0)`}>
                <path d="M 128 232 L 192 232 L 196 270 L 124 270 Z" fill="#18181b" stroke="#3f3f46" strokeWidth="2" />
                {/* Séparation des cuisses */}
                <line x1="160" y1="250" x2="160" y2="270" stroke="#09090b" strokeWidth="2" />
              </g>
            </g>
          </svg>
        </div>

        {/* Badges Titre de Niveau Pixel */}
        <div className="relative z-30 -mt-3 flex justify-between px-4 text-xs font-mono font-bold">
          <div className="flex items-center gap-1.5 rounded-lg bg-black/80 px-3 py-1.5 border border-neon-cyan/50 text-white shadow-lg backdrop-blur-sm">
            <span className="text-neon-cyan">ARTHUR</span>
            <span className="rounded bg-neon-cyan/20 px-1.5 py-0.5 text-[10px] text-neon-cyan">
              Lv.{arthurStats.totalSessions}
            </span>
          </div>

          <div className="flex items-center gap-1.5 rounded-lg bg-black/80 px-3 py-1.5 border border-neon-rose/50 text-white shadow-lg backdrop-blur-sm">
            <span className="text-neon-rose">CLARA</span>
            <span className="rounded bg-neon-rose/20 px-1.5 py-0.5 text-[10px] text-neon-rose">
              Lv.{claraStats.totalSessions}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
