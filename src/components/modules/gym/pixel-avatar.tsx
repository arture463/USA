"use client";

import { motion } from "framer-motion";
import { Trophy, Dumbbell, Zap, Flame, Sparkles } from "lucide-react";
import type { MuscleStats } from "@/lib/gym-data";

interface PixelAvatarProps {
  arthurStats: MuscleStats;
  claraStats: MuscleStats;
}

/**
 * GYM AVATARS — VECTOR ANIME CHIBI (HIGH-END SMOOTH GRAPHICS)
 * Avec dégradés de peau, ombrages anatomiques, cheveux à reflets, et miroirs Néon.
 */
export function PixelAvatar({ arthurStats, claraStats }: PixelAvatarProps) {
  const arthurPushLevel = Math.min(5, Math.floor(arthurStats.pushLevel) + 1);
  const arthurPullLevel = Math.min(5, Math.floor(arthurStats.pullLevel) + 1);
  const arthurTotalLevel = arthurStats.totalSessions;

  const claraLegsLevel = Math.min(5, Math.floor(claraStats.legsLevel) + 1);
  const claraCardioLevel = Math.min(5, Math.floor(claraStats.cardioLevel) + 1);
  const claraTotalLevel = claraStats.totalSessions;

  return (
    <div className="relative w-full space-y-6">
      {/* ── ARÈNE DUAL GYM : ARTHUR 🇫🇷 (GAUCHE) VS CLARA 🇺🇸 (DROITE) ── */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* ════════════════════════════════════════════════════════ */}
        {/*  CARTE GAUCHE : ARTHUR (PARIS 🇫🇷)                        */}
        {/* ════════════════════════════════════════════════════════ */}
        <div className="group relative overflow-hidden rounded-2xl border border-neon-cyan/40 bg-[#0c0d14] p-4 shadow-[0_0_35px_rgba(56,189,248,0.2)] transition-all hover:border-neon-cyan/70">
          {/* Header Identité */}
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-neon-cyan/20 text-lg border border-neon-cyan/40 shadow-[0_0_10px_rgba(56,189,248,0.3)]">
                🇫🇷
              </div>
              <div>
                <h4 className="font-display font-bold text-base text-neon-cyan flex items-center gap-1.5">
                  Arthur <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
                </h4>
                <p className="text-[11px] text-foreground/50 font-mono">Paris · Salle de Sport</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 rounded-full bg-neon-cyan/20 px-3 py-1 font-mono text-xs font-bold text-neon-cyan border border-neon-cyan/40 shadow-sm">
              <Trophy className="h-3.5 w-3.5" /> Niv. {arthurTotalLevel}
            </div>
          </div>

          {/* Miroir Néon Cyan Arthur */}
          <div className="relative h-80 w-full overflow-hidden rounded-xl border-4 border-[#2c1d18] bg-[#141824] shadow-2xl">
            {/* Ligne LED Néon Cyan */}
            <div className="absolute inset-0 border border-cyan-400/50 rounded-lg pointer-events-none shadow-[inset_0_0_20px_rgba(56,189,248,0.3)]" />

            {/* Fond Carrelage & Lumière */}
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `
                  linear-gradient(to right, #38bdf8 1px, transparent 1px),
                  linear-gradient(to bottom, #38bdf8 1px, transparent 1px)
                `,
                backgroundSize: "22px 22px",
              }}
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-cyan-400/10 to-white/10" />

            {/* VECTOR ANIME ARTWORK ARTHUR */}
            <svg viewBox="0 0 200 270" className="relative h-full w-full drop-shadow-xl">
              <defs>
                {/* Dégradés Peau Arthur */}
                <linearGradient id="arthurSkin" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f3be9b" />
                  <stop offset="100%" stopColor="#d99166" />
                </linearGradient>
                <linearGradient id="arthurHair" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#312d42" />
                  <stop offset="100%" stopColor="#171521" />
                </linearGradient>
                <linearGradient id="arthurTank" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#22212e" />
                  <stop offset="100%" stopColor="#0f0e17" stopOpacity="0.95" />
                </linearGradient>
              </defs>

              {/* Ombre au sol */}
              <ellipse cx="100" cy="255" rx="50" ry="8" fill="#000" opacity="0.45" />

              {/* BRAS FLEX GAUCHE ARTHUR */}
              <g id="arthur-arm-left">
                {/* Épaule arrondie */}
                <path d="M 64 94 Q 42 80, 26 108 C 22 125, 40 134, 54 130 Z" fill="url(#arthurSkin)" stroke="#4a2715" strokeWidth="1.5" />
                {/* Biceps bombé avec animation */}
                <motion.path
                  d="M 36 94 C 12 85, 10 130, 48 128 Z"
                  fill="url(#arthurSkin)"
                  stroke="#4a2715"
                  strokeWidth="1.5"
                  animate={{ scale: [1, 1.04, 1] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                />
                {/* Poing fermé */}
                <circle cx="28" cy="74" r="11" fill="url(#arthurSkin)" stroke="#4a2715" strokeWidth="1.5" />
              </g>

              {/* BRAS FLEX DROIT ARTHUR */}
              <g id="arthur-arm-right">
                {/* Épaule arrondie */}
                <path d="M 136 94 Q 158 80, 174 108 C 178 125, 160 134, 146 130 Z" fill="url(#arthurSkin)" stroke="#4a2715" strokeWidth="1.5" />
                {/* Biceps bombé avec animation */}
                <motion.path
                  d="M 164 94 C 188 85, 190 130, 152 128 Z"
                  fill="url(#arthurSkin)"
                  stroke="#4a2715"
                  strokeWidth="1.5"
                  animate={{ scale: [1, 1.04, 1] }}
                  transition={{ duration: 2.5, repeat: Infinity, delay: 0.2 }}
                />
                {/* Poing fermé */}
                <circle cx="172" cy="74" r="11" fill="url(#arthurSkin)" stroke="#4a2715" strokeWidth="1.5" />
              </g>

              {/* CHEVEUX ANIME NOIRS SCULPTÉS & VISAGE ARTHUR */}
              <g id="arthur-head">
                {/* Mèches de cheveux arrière fluides */}
                <path d="M 68 40 Q 82 12, 100 8 Q 118 12, 132 40 C 145 28, 155 52, 144 72 Q 100 80, 56 72 C 45 52, 55 28, 68 40 Z" fill="url(#arthurHair)" />
                {/* Mèches pointues anime sur le haut */}
                <path d="M 78 28 Q 88 4, 98 22 Q 112 2, 124 24 Q 138 12, 142 34 Z" fill="url(#arthurHair)" />

                {/* Visage Oval Chaleureux */}
                <path d="M 72 56 Q 100 52, 128 56 C 132 82, 118 100, 100 102 C 82 100, 68 82, 72 56 Z" fill="url(#arthurSkin)" stroke="#4a2715" strokeWidth="1.5" />

                {/* Yeux Anime Expressifs */}
                <ellipse cx="86" cy="72" rx="6" ry="7" fill="#ffffff" />
                <ellipse cx="87" cy="73" rx="4" ry="5" fill="#2d1a0e" />
                <circle cx="88" cy="71" r="1.5" fill="#ffffff" />

                <ellipse cx="114" cy="72" rx="6" ry="7" fill="#ffffff" />
                <ellipse cx="113" cy="73" rx="4" ry="5" fill="#2d1a0e" />
                <circle cx="114" cy="71" r="1.5" fill="#ffffff" />

                {/* Sourcils & Sourire */}
                <path d="M 78 63 Q 86 61, 93 65" fill="none" stroke="#1d1526" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M 122 63 Q 114 61, 107 65" fill="none" stroke="#1d1526" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M 94 88 Q 100 93 106 88" fill="none" stroke="#4a2715" strokeWidth="2" strokeLinecap="round" />
              </g>

              {/* DÉBARDEUR ATHLÉTIQUE COMPRESSION NOIR */}
              <g id="arthur-torso">
                <path d="M 64 96 C 80 94, 120 94, 136 96 L 130 172 C 100 176, 100 176, 70 172 Z" fill="url(#arthurTank)" stroke="#353347" strokeWidth="2" />
                <path d="M 82 96 Q 100 114, 118 96 Z" fill="url(#arthurSkin)" />
                <text x="100" y="142" textAnchor="middle" fill="#38bdf8" fontSize="10" fontFamily="sans-serif" fontWeight="bold" letterSpacing="1">
                  PARIS 🇫🇷
                </text>
              </g>

              {/* SHORT DE FIT NOIR */}
              <g id="arthur-shorts">
                <path d="M 68 172 Q 100 176, 132 172 L 136 210 Q 100 215, 64 210 Z" fill="#1b1a26" stroke="#38bdf8" strokeWidth="1.5" />
                <line x1="100" y1="188" x2="100" y2="212" stroke="#0e0d14" strokeWidth="2" />
              </g>

              {/* CUISSES ET MOLLETS ANATOMIQUES */}
              <g id="arthur-legs">
                <path d="M 70 210 Q 82 210, 92 210 L 90 244 L 72 244 Z" fill="url(#arthurSkin)" stroke="#4a2715" strokeWidth="1.5" />
                <path d="M 108 210 Q 118 210, 130 210 L 128 244 L 110 244 Z" fill="url(#arthurSkin)" stroke="#4a2715" strokeWidth="1.5" />
              </g>

              {/* BASKETS NEON CYAN */}
              <g id="arthur-sneakers">
                <path d="M 64 242 C 64 238, 96 238, 96 242 L 98 256 L 58 256 Z" fill="#0284c7" stroke="#38bdf8" strokeWidth="1.5" />
                <path d="M 104 242 C 104 238, 136 238, 136 242 L 142 256 L 102 256 Z" fill="#0284c7" stroke="#38bdf8" strokeWidth="1.5" />
                <rect x="58" y="250" width="40" height="6" fill="#ffffff" rx="2" />
                <rect x="102" y="250" width="40" height="6" fill="#ffffff" rx="2" />
              </g>
            </svg>
          </div>

          {/* Barres de Niveaux */}
          <div className="mt-3.5 space-y-2 text-[11px]">
            <div className="space-y-1">
              <div className="flex justify-between text-foreground/70">
                <span className="flex items-center gap-1"><Dumbbell className="h-3 w-3 text-cyan-400" /> Push (Pecs / Épaules)</span>
                <span className="font-mono font-bold text-neon-cyan">Niv. {arthurPushLevel}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden p-0.5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-sky-300 shadow-[0_0_8px_#38bdf8] transition-all duration-500"
                  style={{ width: `${Math.min(100, (arthurStats.pushLevel / 5) * 100)}%` }}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-foreground/70">
                <span className="flex items-center gap-1"><Zap className="h-3 w-3 text-cyan-400" /> Pull (Dos / Biceps)</span>
                <span className="font-mono font-bold text-cyan-300">Niv. {arthurPullLevel}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden p-0.5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-400 shadow-[0_0_8px_#38bdf8] transition-all duration-500"
                  style={{ width: `${Math.min(100, (arthurStats.pullLevel / 5) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════ */}
        {/*  CARTE DROITE : CLARA (RALEIGH 🇺🇸)                      */}
        {/* ════════════════════════════════════════════════════════ */}
        <div className="group relative overflow-hidden rounded-2xl border border-neon-rose/40 bg-[#0c0d14] p-4 shadow-[0_0_35px_rgba(244,63,94,0.2)] transition-all hover:border-neon-rose/70">
          {/* Header Identité */}
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-neon-rose/20 text-lg border border-neon-rose/40 shadow-[0_0_10px_rgba(244,63,94,0.3)]">
                🇺🇸
              </div>
              <div>
                <h4 className="font-display font-bold text-base text-neon-rose flex items-center gap-1.5">
                  Clara <Sparkles className="h-3.5 w-3.5 text-rose-300" />
                </h4>
                <p className="text-[11px] text-foreground/50 font-mono">Raleigh · Planet Fitness</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 rounded-full bg-neon-rose/20 px-3 py-1 font-mono text-xs font-bold text-neon-rose border border-neon-rose/40 shadow-sm">
              <Trophy className="h-3.5 w-3.5" /> Niv. {claraTotalLevel}
            </div>
          </div>

          {/* Miroir Néon Rose Clara */}
          <div className="relative h-80 w-full overflow-hidden rounded-xl border-4 border-[#2c1d18] bg-[#141824] shadow-2xl">
            {/* Ligne LED Néon Rose */}
            <div className="absolute inset-0 border border-rose-400/50 rounded-lg pointer-events-none shadow-[inset_0_0_20px_rgba(244,63,94,0.3)]" />

            {/* Fond Carrelage & Lumière */}
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `
                  linear-gradient(to right, #f43f5e 1px, transparent 1px),
                  linear-gradient(to bottom, #f43f5e 1px, transparent 1px)
                `,
                backgroundSize: "22px 22px",
              }}
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-rose-400/10 to-white/10" />

            {/* VECTOR ANIME ARTWORK CLARA */}
            <svg viewBox="0 0 200 270" className="relative h-full w-full drop-shadow-xl">
              <defs>
                {/* Dégradés Peau Clara */}
                <linearGradient id="claraSkin" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fcd3c1" />
                  <stop offset="100%" stopColor="#e5a78c" />
                </linearGradient>
                <linearGradient id="claraHair" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#242133" />
                  <stop offset="100%" stopColor="#0e0d14" />
                </linearGradient>
              </defs>

              {/* Ombre au sol */}
              <ellipse cx="100" cy="255" rx="45" ry="8" fill="#000" opacity="0.45" />

              {/* CHEVEUX LONGS NOIRS CLARA (ARRIÈRE) */}
              <path d="M 60 44 C 48 10, 152 10, 140 44 L 152 195 L 48 195 Z" fill="url(#claraHair)" />

              {/* BRAS DROIT CLARA (CÔTÉ GAUCHE SUR L'ÉCRAN - HANCHE) */}
              <g id="clara-arm-right">
                <path d="M 72 96 Q 52 110, 56 142 L 68 142 L 62 118 L 76 102 Z" fill="url(#claraSkin)" stroke="#5c2e17" strokeWidth="1.5" />
                <ellipse cx="62" cy="142" rx="6" ry="4.5" fill="url(#claraSkin)" stroke="#5c2e17" strokeWidth="1.5" />
              </g>

              {/* BRAS GAUCHE CLARA (CÔTÉ DROIT - TENANT LE SMARTPHONE) */}
              <g id="clara-arm-left">
                <path d="M 128 96 L 150 100 L 144 132 L 128 122 Z" fill="url(#claraSkin)" stroke="#5c2e17" strokeWidth="1.5" />
              </g>

              {/* VISAGE ANIME CLARA */}
              <g id="clara-head">
                <path d="M 72 50 Q 100 46, 128 50 C 132 76, 118 94, 100 96 C 82 94, 68 76, 72 50 Z" fill="url(#claraSkin)" stroke="#5c2e17" strokeWidth="1.5" />
                {/* Frange Droit Lisse */}
                <path d="M 66 42 Q 100 38, 134 42 L 134 62 Q 100 66, 66 62 Z" fill="url(#claraHair)" />

                {/* Yeux Mignons Expressifs */}
                <ellipse cx="85" cy="68" rx="6" ry="7" fill="#ffffff" />
                <ellipse cx="86" cy="69" rx="4" ry="5" fill="#181524" />
                <circle cx="87" cy="67" r="1.5" fill="#ffffff" />

                <ellipse cx="115" cy="68" rx="6" ry="7" fill="#ffffff" />
                <ellipse cx="114" cy="69" rx="4" ry="5" fill="#181524" />
                <circle cx="115" cy="67" r="1.5" fill="#ffffff" />

                {/* Joues Rosées & Sourire */}
                <ellipse cx="78" cy="76" rx="5" ry="3.5" fill="#f48fb1" opacity="0.65" />
                <ellipse cx="122" cy="76" rx="5" ry="3.5" fill="#f48fb1" opacity="0.65" />
                <path d="M 95 82 Q 100 86 105 82" fill="none" stroke="#5c2e17" strokeWidth="2" strokeLinecap="round" />

                {/* Pendentif Croissant de Lune */}
                <path d="M 90 92 Q 100 100 110 92" fill="none" stroke="#e2e8f0" strokeWidth="1.5" />
                <circle cx="100" cy="97" r="2.5" fill="#fbbf24" />
              </g>

              {/* CROP TOP BLANC CLARA */}
              <g id="clara-top">
                <path d="M 68 96 C 80 94, 120 94, 132 96 L 136 136 C 100 140, 100 140, 64 136 Z" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2" />
                <path d="M 84 96 Q 100 108, 116 96 Z" fill="url(#claraSkin)" />
                <text x="100" y="124" textAnchor="middle" fill="#f43f5e" fontSize="9" fontFamily="sans-serif" fontWeight="bold">
                  RALEIGH 🇺🇸
                </text>
              </g>

              {/* SMARTPHONE BLEU MIRROR SELFIE */}
              <g id="clara-phone">
                <rect x="142" y="90" width="19" height="34" rx="3.5" fill="#0284c7" stroke="#0f172a" strokeWidth="2" />
                <circle cx="147" cy="97" r="2.5" fill="#1e293b" />
                <rect x="145" y="104" width="13" height="16" rx="1" fill="#38bdf8" opacity="0.85" />
                <rect x="135" y="100" width="11" height="15" rx="3" fill="url(#claraSkin)" stroke="#5c2e17" strokeWidth="1.5" />
              </g>

              {/* TAILLE & ABDOS EXPOSÉS */}
              <rect x="74" y="136" width="52" height="20" fill="url(#claraSkin)" stroke="#5c2e17" strokeWidth="1.5" />

              {/* SHORT NOIR HIGH-WAIST FITNESS */}
              <g id="clara-shorts">
                <path d="M 68 156 Q 100 160, 132 156 L 136 192 Q 100 196, 64 192 Z" fill="#181722" stroke="#f43f5e" strokeWidth="1.5" />
                <line x1="100" y1="170" x2="100" y2="192" stroke="#0a0910" strokeWidth="2" />
              </g>

              {/* JAMBES ET CUISSES GALBÉES */}
              <g id="clara-legs">
                <path d="M 72 192 Q 82 192, 92 192 L 90 244 L 72 244 Z" fill="url(#claraSkin)" stroke="#5c2e17" strokeWidth="1.5" />
                <path d="M 108 192 Q 118 192, 128 192 L 126 244 L 108 244 Z" fill="url(#claraSkin)" stroke="#5c2e17" strokeWidth="1.5" />
              </g>

              {/* BASKETS NEON ROSE & BLANCHE */}
              <g id="clara-sneakers">
                <path d="M 65 242 C 65 238, 96 238, 96 242 L 98 256 L 59 256 Z" fill="#e11d48" stroke="#f43f5e" strokeWidth="1.5" />
                <path d="M 104 242 C 104 238, 135 238, 135 242 L 141 256 L 102 256 Z" fill="#e11d48" stroke="#f43f5e" strokeWidth="1.5" />
                <rect x="61" y="250" width="37" height="6" fill="#ffffff" rx="2" />
                <rect x="102" y="250" width="37" height="6" fill="#ffffff" rx="2" />
              </g>
            </svg>
          </div>

          {/* Barres de Niveaux */}
          <div className="mt-3.5 space-y-2 text-[11px]">
            <div className="space-y-1">
              <div className="flex justify-between text-foreground/70">
                <span className="flex items-center gap-1"><Flame className="h-3 w-3 text-rose-400" /> Legs (Cuisses / Fessiers)</span>
                <span className="font-mono font-bold text-neon-rose">Niv. {claraLegsLevel}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden p-0.5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-rose-500 to-pink-300 shadow-[0_0_8px_#f43f5e] transition-all duration-500"
                  style={{ width: `${Math.min(100, (claraStats.legsLevel / 5) * 100)}%` }}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-foreground/70">
                <span className="flex items-center gap-1"><Zap className="h-3 w-3 text-rose-400" /> Cardio & Abdos</span>
                <span className="font-mono font-bold text-rose-300">Niv. {claraCardioLevel}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden p-0.5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-pink-600 to-rose-400 shadow-[0_0_8px_#f43f5e] transition-all duration-500"
                  style={{ width: `${Math.min(100, (claraStats.cardioLevel / 5) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
