"use client";

import { motion } from "framer-motion";
import { Trophy, Dumbbell, Zap, Flame, Sparkles } from "lucide-react";
import type { MuscleStats } from "@/lib/gym-data";

interface PixelAvatarProps {
  arthurStats: MuscleStats;
  claraStats: MuscleStats;
}

export function PixelAvatar({ arthurStats, claraStats }: PixelAvatarProps) {
  // Calcul des niveaux musculaires
  const arthurPushLevel = Math.min(5, Math.floor(arthurStats.pushLevel) + 1);
  const arthurPullLevel = Math.min(5, Math.floor(arthurStats.pullLevel) + 1);
  const arthurTotalLevel = arthurStats.totalSessions;

  const claraLegsLevel = Math.min(5, Math.floor(claraStats.legsLevel) + 1);
  const claraCardioLevel = Math.min(5, Math.floor(claraStats.cardioLevel) + 1);
  const claraTotalLevel = claraStats.totalSessions;

  return (
    <div className="relative w-full space-y-6">
      {/* ── DUEL DE MIROIRS DUAL GYM (ARTHUR 🇫🇷 vs CLARA 🇺🇸) ── */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* ════════════════════════════════════════════════════════ */}
        {/*  CARTE GAUCHE : ARTHUR (PARIS 🇫🇷)                        */}
        {/* ════════════════════════════════════════════════════════ */}
        <div className="group relative overflow-hidden rounded-2xl border border-neon-cyan/40 bg-[#0d0c14] p-4 shadow-[0_0_35px_rgba(56,189,248,0.2)] transition-all hover:border-neon-cyan/70">
          {/* Header Identité & Rank */}
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

          {/* Miroir de Musculation NÉON Arthur */}
          <div className="relative h-80 w-full overflow-hidden rounded-xl border-4 border-[#2a1d17] bg-[#161b22] shadow-2xl">
            {/* Ligne de LED Néon Cyan le long du miroir */}
            <div className="absolute inset-0 border border-cyan-400/40 rounded-lg pointer-events-none shadow-[inset_0_0_15px_rgba(56,189,248,0.25)]" />

            {/* Texture Carrelage & Arrière-plan reflété avec Haltères */}
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `
                  linear-gradient(to right, #38bdf8 1px, transparent 1px),
                  linear-gradient(to bottom, #38bdf8 1px, transparent 1px)
                `,
                backgroundSize: "20px 20px",
              }}
            />
            {/* Silhouette d'un banc de muscu / rack d'haltères au fond */}
            <div className="absolute bottom-6 left-4 right-4 h-12 opacity-15 border-b-2 border-cyan-400 flex justify-between items-end">
              <div className="h-8 w-4 bg-cyan-300 rounded-t-sm" />
              <div className="h-6 w-16 bg-cyan-300 rounded-t-sm" />
              <div className="h-8 w-4 bg-cyan-300 rounded-t-sm" />
            </div>

            {/* Reflet de verre diaphane */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-cyan-400/10 to-white/10" />

            {/* 🎨 ILLUSTRATION PIXEL ART ANIME ARTHUR (FULL BODY) */}
            <svg viewBox="0 0 200 270" className="relative h-full w-full drop-shadow-md">
              {/* Ombre portée au sol */}
              <ellipse cx="100" cy="255" rx="55" ry="8" fill="#000" opacity="0.5" />

              {/* 🦾 BICEPS FLEX GAUCHE ARTHUR */}
              <g id="arthur-arm-left">
                {/* Épaule courte & Deltoïde */}
                <path d="M 62 95 Q 40 85, 30 115 L 48 135 L 64 125 Z" fill="#d48c5c" stroke="#4a2511" strokeWidth="2" />
                {/* Biceps bombé avec animation de flex */}
                <motion.path
                  d="M 32 98 C 12 85, 10 130, 48 130 Z"
                  fill="#f0b088"
                  stroke="#4a2511"
                  strokeWidth="2"
                  animate={{ scale: [1, 1.04, 1] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                />
                {/* Poing fermé levé */}
                <path d="M 22 65 L 40 62 C 44 75, 42 88, 26 90 Z" fill="#f0b088" stroke="#4a2511" strokeWidth="2" />
              </g>

              {/* 🦾 BICEPS FLEX DROIT ARTHUR */}
              <g id="arthur-arm-right">
                {/* Épaule courte & Deltoïde */}
                <path d="M 138 95 Q 160 85, 170 115 L 152 135 L 136 125 Z" fill="#d48c5c" stroke="#4a2511" strokeWidth="2" />
                {/* Biceps bombé avec animation de flex */}
                <motion.path
                  d="M 168 98 C 188 85, 190 130, 152 130 Z"
                  fill="#f0b088"
                  stroke="#4a2511"
                  strokeWidth="2"
                  animate={{ scale: [1, 1.04, 1] }}
                  transition={{ duration: 2.5, repeat: Infinity, delay: 0.2 }}
                />
                {/* Poing fermé levé */}
                <path d="M 178 65 L 160 62 C 156 75, 158 88, 174 90 Z" fill="#f0b088" stroke="#4a2511" strokeWidth="2" />
              </g>

              {/* 💇‍♂️ CHEVEUX ANIME NOIRS ÉBOURIFFÉS & VISAGE ARTHUR */}
              <g id="arthur-head">
                {/* Cheveux arrière & mèches ébouriffées */}
                <path d="M 70 38 L 82 20 L 94 32 L 108 10 L 124 30 L 136 16 L 148 38 L 142 70 L 68 70 Z" fill="#181620" />
                <polygon points="86,24 96,8 102,26" fill="#181620" />
                <polygon points="112,18 122,2 128,20" fill="#181620" />
                <polygon points="68,48 56,36 72,56" fill="#181620" />
                <polygon points="144,48 156,36 140,56" fill="#181620" />

                {/* Visage Teint Chaleureux */}
                <rect x="74" y="56" width="52" height="40" rx="7" fill="#f0b088" stroke="#4a2511" strokeWidth="2" />

                {/* Yeux Anime Expressifs avec Reflets */}
                <rect x="83" y="66" width="10" height="9" rx="2" fill="#ffffff" />
                <rect x="86" y="68" width="6" height="6" fill="#2e1a0e" />
                <circle cx="87" cy="69" r="1" fill="#ffffff" />

                <rect x="107" y="66" width="10" height="9" rx="2" fill="#ffffff" />
                <rect x="108" y="68" width="6" height="6" fill="#2e1a0e" />
                <circle cx="109" cy="69" r="1" fill="#ffffff" />

                {/* Sourcils Inclinés & Sourire Confiant */}
                <line x1="80" y1="61" x2="95" y2="64" stroke="#181620" strokeWidth="3" strokeLinecap="round" />
                <line x1="120" y1="61" x2="105" y2="64" stroke="#181620" strokeWidth="3" strokeLinecap="round" />
                <path d="M 94 85 Q 100 90 106 85" fill="none" stroke="#4a2511" strokeWidth="2.5" strokeLinecap="round" />
              </g>

              {/* 👕 DÉBARDEUR DE SPORT NOIR COMPRESSION */}
              <g id="arthur-torso">
                <path d="M 60 96 L 140 96 L 132 170 L 68 170 Z" fill="#121118" stroke="#2c2a3b" strokeWidth="2.5" />
                <path d="M 84 96 C 84 114, 116 114, 116 96 Z" fill="#f0b088" />
                {/* Logo Neon Paris */}
                <text x="100" y="140" textAnchor="middle" fill="#38bdf8" fontSize="10" fontFamily="monospace" fontWeight="bold" letterSpacing="1">
                  PARIS 🇫🇷
                </text>
              </g>

              {/* 🩳 SHORT DE SPORT NOIR ATHLÉTIQUE */}
              <g id="arthur-shorts">
                <path d="M 66 170 L 134 170 L 138 208 L 62 208 Z" fill="#1b1a26" stroke="#38bdf8" strokeWidth="1.5" />
                <line x1="100" y1="185" x2="100" y2="208" stroke="#0e0d14" strokeWidth="2" />
              </g>

              {/* 🦵 CUISSES & MOLLETS MUSCLÉS */}
              <g id="arthur-legs">
                <rect x="70" y="208" width="24" height="34" rx="3" fill="#f0b088" stroke="#4a2511" strokeWidth="1.5" />
                <rect x="106" y="208" width="24" height="34" rx="3" fill="#f0b088" stroke="#4a2511" strokeWidth="1.5" />
              </g>

              {/* 👟 BASKETS DE SPORT NEON CYAN */}
              <g id="arthur-sneakers">
                <path d="M 64 240 L 96 240 L 98 256 L 58 256 Z" fill="#0284c7" stroke="#38bdf8" strokeWidth="1.5" />
                <path d="M 104 240 L 136 240 L 142 256 L 102 256 Z" fill="#0284c7" stroke="#38bdf8" strokeWidth="1.5" />
                <rect x="60" y="250" width="38" height="6" fill="#ffffff" rx="1" />
                <rect x="102" y="250" width="38" height="6" fill="#ffffff" rx="1" />
              </g>
            </svg>
          </div>

          {/* Barres de Niveaux & Muscles */}
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
        <div className="group relative overflow-hidden rounded-2xl border border-neon-rose/40 bg-[#0d0c14] p-4 shadow-[0_0_35px_rgba(244,63,94,0.2)] transition-all hover:border-neon-rose/70">
          {/* Header Identité & Rank */}
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

          {/* Miroir de Musculation NÉON Clara */}
          <div className="relative h-80 w-full overflow-hidden rounded-xl border-4 border-[#2a1d17] bg-[#161b22] shadow-2xl">
            {/* Ligne de LED Néon Rose le long du miroir */}
            <div className="absolute inset-0 border border-rose-400/40 rounded-lg pointer-events-none shadow-[inset_0_0_15px_rgba(244,63,94,0.25)]" />

            {/* Texture Carrelage & Arrière-plan reflété */}
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `
                  linear-gradient(to right, #f43f5e 1px, transparent 1px),
                  linear-gradient(to bottom, #f43f5e 1px, transparent 1px)
                `,
                backgroundSize: "20px 20px",
              }}
            />
            {/* Silhouette banc / miroir au fond */}
            <div className="absolute bottom-6 left-4 right-4 h-12 opacity-15 border-b-2 border-rose-400 flex justify-between items-end">
              <div className="h-6 w-16 bg-rose-300 rounded-t-sm" />
              <div className="h-8 w-4 bg-rose-300 rounded-t-sm" />
              <div className="h-6 w-16 bg-rose-300 rounded-t-sm" />
            </div>

            {/* Reflet de verre diaphane */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-rose-400/10 to-white/10" />

            {/* 🎨 ILLUSTRATION PIXEL ART ANIME CLARA (FULL BODY) */}
            <svg viewBox="0 0 200 270" className="relative h-full w-full drop-shadow-md">
              {/* Ombre portée au sol */}
              <ellipse cx="100" cy="255" rx="50" ry="8" fill="#000" opacity="0.5" />

              {/* 💇‍♀️ CHEVEUX LONGS NOIRS CLARA (ARRIÈRE) */}
              <path d="M 62 42 C 50 10, 150 10, 138 42 L 148 190 L 52 190 Z" fill="#0d0c14" />

              {/* 🦾 BRAS DROIT CLARA (CÔTÉ GAUCHE SUR L'ÉCRAN - POSÉ SUR LA HANCHE) */}
              <g id="clara-arm-right">
                <path d="M 72 94 L 50 114 L 56 145 L 68 145 L 60 120 L 76 102 Z" fill="#f7c5a8" stroke="#5c2e17" strokeWidth="1.5" />
                <ellipse cx="62" cy="145" rx="6" ry="4.5" fill="#f7c5a8" stroke="#5c2e17" strokeWidth="1.5" />
              </g>

              {/* 🦾 BRAS GAUCHE CLARA (CÔTÉ DROIT - TENANT LE SMARTPHONE) */}
              <g id="clara-arm-left">
                <path d="M 128 94 L 150 98 L 144 130 L 128 120 Z" fill="#f7c5a8" stroke="#5c2e17" strokeWidth="1.5" />
              </g>

              {/* 👩 VISAGE ANIME ULTRA MIGNON & CHEVEUX CLARA */}
              <g id="clara-head">
                <rect x="74" y="48" width="52" height="40" rx="8" fill="#f7c5a8" stroke="#5c2e17" strokeWidth="2" />
                {/* Frange Droit Noire Lisse */}
                <path d="M 68 40 L 132 40 L 132 62 Q 100 66 68 62 Z" fill="#0d0c14" />

                {/* Yeux Mignons Expressifs */}
                <rect x="82" y="62" width="10" height="11" rx="3" fill="#ffffff" />
                <rect x="84" y="64" width="6" height="7" fill="#161420" />
                <circle cx="85" cy="65" r="1.5" fill="#ffffff" />

                <rect x="108" y="62" width="10" height="11" rx="3" fill="#ffffff" />
                <rect x="109" y="64" width="6" height="7" fill="#161420" />
                <circle cx="110" cy="65" r="1.5" fill="#ffffff" />

                {/* Joues Rosées & Sourire Mignon */}
                <ellipse cx="79" cy="74" rx="4.5" ry="3" fill="#f48fb1" opacity="0.6" />
                <ellipse cx="121" cy="74" rx="4.5" ry="3" fill="#f48fb1" opacity="0.6" />
                <path d="M 95 78 Q 100 82 105 78" fill="none" stroke="#5c2e17" strokeWidth="2" strokeLinecap="round" />

                {/* Pendentif Croissant de Lune */}
                <path d="M 90 90 Q 100 98 110 90" fill="none" stroke="#e2e8f0" strokeWidth="1.5" />
                <circle cx="100" cy="95" r="2.5" fill="#fbbf24" />
              </g>

              {/* 👚 CROP TOP BLANC CLARA */}
              <g id="clara-top">
                <path d="M 70 94 L 130 94 L 135 134 L 65 134 Z" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2" />
                <path d="M 84 94 C 84 106, 116 106, 116 94 Z" fill="#f7c5a8" />
                <text x="100" y="122" textAnchor="middle" fill="#f43f5e" fontSize="9" fontFamily="monospace" fontWeight="bold">
                  RALEIGH 🇺🇸
                </text>
              </g>

              {/* 📱 SMARTPHONE BLEU MIRROR SELFIE */}
              <g id="clara-phone">
                <rect x="142" y="88" width="19" height="34" rx="3.5" fill="#0284c7" stroke="#0f172a" strokeWidth="2" />
                <circle cx="147" cy="95" r="2.5" fill="#1e293b" />
                <rect x="145" y="102" width="13" height="16" rx="1" fill="#38bdf8" opacity="0.85" />
                <rect x="135" y="98" width="11" height="15" rx="3" fill="#f7c5a8" stroke="#5c2e17" strokeWidth="1.5" />
              </g>

              {/* 👙 TAILLE & ABDOS EXPOSÉS */}
              <rect x="74" y="134" width="52" height="20" fill="#f7c5a8" stroke="#5c2e17" strokeWidth="1.5" />

              {/* 🩳 SHORT NOIR HIGH-WAIST FITNESS */}
              <g id="clara-shorts">
                <path d="M 68 154 L 132 154 L 136 190 L 64 190 Z" fill="#181722" stroke="#f43f5e" strokeWidth="1.5" />
                <line x1="100" y1="168" x2="100" y2="190" stroke="#0a0910" strokeWidth="2" />
              </g>

              {/* 🦵 JAMBES ET CUISSES GALBÉES */}
              <g id="clara-legs">
                <rect x="71" y="190" width="23" height="50" rx="4" fill="#f7c5a8" stroke="#5c2e17" strokeWidth="1.5" />
                <rect x="106" y="190" width="23" height="50" rx="4" fill="#f7c5a8" stroke="#5c2e17" strokeWidth="1.5" />
              </g>

              {/* 👟 BASKETS DE SPORT NEON ROSE & BLANCHE */}
              <g id="clara-sneakers">
                <path d="M 65 240 L 96 240 L 98 256 L 59 256 Z" fill="#e11d48" stroke="#f43f5e" strokeWidth="1.5" />
                <path d="M 104 240 L 135 240 L 141 256 L 102 256 Z" fill="#e11d48" stroke="#f43f5e" strokeWidth="1.5" />
                <rect x="61" y="250" width="36" height="6" fill="#ffffff" rx="1" />
                <rect x="102" y="250" width="36" height="6" fill="#ffffff" rx="1" />
              </g>
            </svg>
          </div>

          {/* Barres de Niveaux & Muscles */}
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
