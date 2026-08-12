"use client";

import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import type { MuscleStats } from "@/lib/gym-data";

interface PixelAvatarProps {
  arthurStats: MuscleStats;
  claraStats: MuscleStats;
}

export function PixelAvatar({ arthurStats, claraStats }: PixelAvatarProps) {
  // Niveaux de muscles (1 à 5)
  const arthurArms = Math.min(5, Math.floor(arthurStats.pushLevel + arthurStats.pullLevel) + 1);
  const claraLegs = Math.min(5, Math.floor(claraStats.legsLevel) + 1);
  const claraAbs = Math.min(5, Math.floor(claraStats.cardioLevel) + 1);

  return (
    <div className="relative w-full space-y-6">
      {/* ── ARÈNE DUAL GYM : ARTHUR 🇫🇷 (GAUCHE) VS CLARA 🇺🇸 (DROITE) ── */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* ════════════════════════════════════════════════════════ */}
        {/*  GAUCHE : ARTHUR (PARIS)                                 */}
        {/* ════════════════════════════════════════════════════════ */}
        <div className="group relative overflow-hidden rounded-2xl border border-neon-cyan/30 bg-[#12111a] p-4 shadow-[0_0_30px_rgba(56,189,248,0.15)] transition-all hover:border-neon-cyan/50">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-neon-cyan/10 text-lg">
                🇫🇷
              </span>
              <div>
                <h4 className="font-display font-semibold text-base text-neon-cyan">
                  Arthur
                </h4>
                <p className="text-[11px] text-foreground/50">Paris · Salle de Sport</p>
              </div>
            </div>

            <div className="flex items-center gap-1 rounded-full bg-neon-cyan/20 px-2.5 py-1 font-mono text-xs font-bold text-neon-cyan border border-neon-cyan/30">
              <Trophy className="h-3.5 w-3.5" /> Niv. {arthurStats.totalSessions}
            </div>
          </div>

          {/* Miroir de Muscu Arthur */}
          <div className="relative h-72 w-full overflow-hidden rounded-xl border-4 border-[#3e2723] bg-[#1e232a] shadow-inner">
            <div
              className="absolute inset-0 opacity-25"
              style={{
                backgroundImage: `
                  linear-gradient(to right, #38bdf8 1px, transparent 1px),
                  linear-gradient(to bottom, #38bdf8 1px, transparent 1px)
                `,
                backgroundSize: "24px 24px",
              }}
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-cyan-400/10 to-white/10" />

            {/* Avatar Plein Corps Arthur (avec Jambes & Baskets) */}
            <svg viewBox="0 0 200 260" className="relative h-full w-full">
              {/* Ombre au sol */}
              <ellipse cx="100" cy="245" rx="55" ry="10" fill="#000" opacity="0.45" />

              {/* BICEPS FLEX GAUCHE ARTHUR */}
              <g id="arthur-biceps-left">
                {/* Epaule & Bras connecté au torse */}
                <path d="M 60 92 L 35 85 L 28 120 L 52 125 Z" fill="#d08b5c" stroke="#5c361e" strokeWidth="2" />
                {/* Biceps bombé */}
                <motion.path
                  d="M 32 95 C 12 85, 15 125, 42 125 Z"
                  fill="#e59f6f"
                  stroke="#5c361e"
                  strokeWidth="2"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                />
                {/* Poing fermé levé */}
                <rect x="24" y="60" width="16" height="26" rx="4" fill="#e59f6f" stroke="#5c361e" strokeWidth="2" />
              </g>

              {/* BICEPS FLEX DROIT ARTHUR */}
              <g id="arthur-biceps-right">
                {/* Epaule & Bras connecté au torse */}
                <path d="M 140 92 L 165 85 L 172 120 L 148 125 Z" fill="#d08b5c" stroke="#5c361e" strokeWidth="2" />
                {/* Biceps bombé */}
                <motion.path
                  d="M 168 95 C 188 85, 185 125, 158 125 Z"
                  fill="#e59f6f"
                  stroke="#5c361e"
                  strokeWidth="2"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2.5, repeat: Infinity, delay: 0.2 }}
                />
                {/* Poing fermé levé */}
                <rect x="160" y="60" width="16" height="26" rx="4" fill="#e59f6f" stroke="#5c361e" strokeWidth="2" />
              </g>

              {/* CHEVEUX & VISAGE ARTHUR */}
              <path d="M 75 35 L 85 20 L 95 30 L 110 12 L 125 30 L 135 18 L 145 35 L 140 65 L 70 65 Z" fill="#18171a" />
              <polygon points="90,22 98,8 105,24" fill="#18171a" />
              <polygon points="115,16 124,2 130,18" fill="#18171a" />

              <rect x="75" y="55" width="50" height="38" rx="6" fill="#e59f6f" stroke="#5c361e" strokeWidth="2" />
              <rect x="85" y="64" width="9" height="8" rx="2" fill="#fff" />
              <rect x="88" y="66" width="5" height="5" fill="#2d1a0e" />
              <rect x="106" y="64" width="9" height="8" rx="2" fill="#fff" />
              <rect x="107" y="66" width="5" height="5" fill="#2d1a0e" />
              <line x1="82" y1="59" x2="96" y2="62" stroke="#18171a" strokeWidth="3" strokeLinecap="round" />
              <line x1="118" y1="59" x2="104" y2="62" stroke="#18171a" strokeWidth="3" strokeLinecap="round" />
              <path d="M 94 82 Q 100 87 106 82" fill="none" stroke="#5c361e" strokeWidth="2" strokeLinecap="round" />

              {/* TORSE & DÉBARDEUR NOIR */}
              <path d="M 60 92 L 140 92 L 132 165 L 68 165 Z" fill="#121216" stroke="#2d2d38" strokeWidth="2.5" />
              <path d="M 85 92 C 85 110, 115 110, 115 92 Z" fill="#e59f6f" />
              <text x="100" y="135" textAnchor="middle" fill="#38bdf8" fontSize="10" fontFamily="monospace" fontWeight="bold" opacity="0.9">
                PARIS 🇫🇷
              </text>

              {/* SHORT DE SPORT NOIR */}
              <path d="M 66 165 L 134 165 L 138 200 L 62 200 Z" fill="#1e1e24" stroke="#38bdf8" strokeWidth="1.5" />
              <line x1="100" y1="180" x2="100" y2="200" stroke="#0f0f12" strokeWidth="2" />

              {/* 🦵 JAMBES ET CUISSES ARTHUR */}
              <rect x="70" y="200" width="24" height="32" rx="3" fill="#e59f6f" stroke="#5c361e" strokeWidth="1.5" />
              <rect x="106" y="200" width="24" height="32" rx="3" fill="#e59f6f" stroke="#5c361e" strokeWidth="1.5" />

              {/* 👟 BASKETS DE SPORT NEON CYAN */}
              <path d="M 64 230 L 96 230 L 98 245 L 60 245 Z" fill="#0284c7" stroke="#38bdf8" strokeWidth="1.5" />
              <path d="M 104 230 L 136 230 L 140 245 L 102 245 Z" fill="#0284c7" stroke="#38bdf8" strokeWidth="1.5" />
              <rect x="62" y="240" width="36" height="5" fill="#ffffff" />
              <rect x="102" y="240" width="36" height="5" fill="#ffffff" />
            </svg>
          </div>

          {/* Stats Barres Arthur */}
          <div className="mt-3 space-y-1 text-[11px]">
            <div className="flex justify-between text-foreground/70">
              <span>Push (Pec / Epaule)</span>
              <span className="font-mono font-bold text-neon-cyan">Niv. {arthurArms}</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-neon-cyan transition-all duration-500"
                style={{ width: `${Math.min(100, (arthurStats.pushLevel / 5) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════ */}
        {/*  DROITE : CLARA (RALEIGH)                                */}
        {/* ════════════════════════════════════════════════════════ */}
        <div className="group relative overflow-hidden rounded-2xl border border-neon-rose/30 bg-[#12111a] p-4 shadow-[0_0_30px_rgba(244,63,94,0.15)] transition-all hover:border-neon-rose/50">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-neon-rose/10 text-lg">
                🇺🇸
              </span>
              <div>
                <h4 className="font-display font-semibold text-base text-neon-rose">
                  Clara
                </h4>
                <p className="text-[11px] text-foreground/50">Raleigh · Planet Fitness</p>
              </div>
            </div>

            <div className="flex items-center gap-1 rounded-full bg-neon-rose/20 px-2.5 py-1 font-mono text-xs font-bold text-neon-rose border border-neon-rose/30">
              <Trophy className="h-3.5 w-3.5" /> Niv. {claraStats.totalSessions}
            </div>
          </div>

          {/* Miroir de Muscu Clara */}
          <div className="relative h-72 w-full overflow-hidden rounded-xl border-4 border-[#3e2723] bg-[#1e232a] shadow-inner">
            <div
              className="absolute inset-0 opacity-25"
              style={{
                backgroundImage: `
                  linear-gradient(to right, #f43f5e 1px, transparent 1px),
                  linear-gradient(to bottom, #f43f5e 1px, transparent 1px)
                `,
                backgroundSize: "24px 24px",
              }}
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-rose-400/10 to-white/10" />

            {/* Avatar Plein Corps Clara (avec Bras Gauche/Droit & Smartphone) */}
            <svg viewBox="0 0 200 260" className="relative h-full w-full">
              {/* Ombre au sol */}
              <ellipse cx="100" cy="245" rx="50" ry="10" fill="#000" opacity="0.45" />

              {/* CHEVEUX LONGS NOIRS CLARA (ARRIÈRE) */}
              <path d="M 65 40 C 55 10, 145 10, 135 40 L 145 180 L 55 180 Z" fill="#0d0c10" />

              {/* 🦾 BRAS DROIT CLARA (CÔTÉ GAUCHE SUR L'ÉCRAN - POSÉ SUR LA HANCHE) */}
              <g id="clara-arm-right">
                <path d="M 72 90 L 52 110 L 58 140 L 68 140 L 62 115 L 75 98 Z" fill="#f5c2a3" stroke="#6b3e26" strokeWidth="1.5" />
                {/* Main posée sur la hanche */}
                <ellipse cx="64" cy="140" rx="6" ry="4" fill="#f5c2a3" stroke="#6b3e26" strokeWidth="1.5" />
              </g>

              {/* 🦾 BRAS GAUCHE CLARA (CÔTÉ DROIT SUR L'ÉCRAN - TENANT LE TELEPHONE) */}
              <g id="clara-arm-left">
                <path d="M 128 90 L 148 95 L 142 125 L 128 115 Z" fill="#f5c2a3" stroke="#6b3e26" strokeWidth="1.5" />
              </g>

              {/* VISAGE & CHEVEUX CLARA */}
              <rect x="75" y="45" width="50" height="38" rx="8" fill="#f5c2a3" stroke="#6b3e26" strokeWidth="2" />
              <path d="M 70 38 L 130 38 L 130 58 Q 100 62 70 58 Z" fill="#0d0c10" />

              {/* Yeux Noirs Mignons */}
              <rect x="83" y="58" width="9" height="10" rx="2" fill="#fff" />
              <rect x="85" y="60" width="5" height="6" fill="#121115" />
              <circle cx="86" cy="61" r="1" fill="#fff" />

              <rect x="108" y="58" width="9" height="10" rx="2" fill="#fff" />
              <rect x="109" y="60" width="5" height="6" fill="#121115" />
              <circle cx="110" cy="61" r="1" fill="#fff" />

              <ellipse cx="80" cy="70" rx="4" ry="2.5" fill="#f48fb1" opacity="0.6" />
              <ellipse cx="120" cy="70" rx="4" ry="2.5" fill="#f48fb1" opacity="0.6" />
              <path d="M 96 74 Q 100 78 104 74" fill="none" stroke="#6b3e26" strokeWidth="2" strokeLinecap="round" />

              {/* CROP TOP BLANC CLARA */}
              <path d="M 72 88 L 128 88 L 133 130 L 67 130 Z" fill="#ffffff" stroke="#d1d5db" strokeWidth="2" />
              <path d="M 85 88 C 85 100, 115 100, 115 88 Z" fill="#f5c2a3" />
              <text x="100" y="118" textAnchor="middle" fill="#f43f5e" fontSize="9" fontFamily="monospace" fontWeight="bold">
                RALEIGH 🇺🇸
              </text>

              {/* SMARTPHONE BLEU SELFIE */}
              <g id="clara-phone">
                <rect x="142" y="85" width="18" height="32" rx="3" fill="#0284c7" stroke="#0f172a" strokeWidth="2" />
                <circle cx="147" cy="92" r="2.5" fill="#1e293b" />
                <rect x="145" y="98" width="12" height="15" rx="1" fill="#38bdf8" opacity="0.8" />
                {/* Main tenant le téléphone */}
                <rect x="136" y="94" width="10" height="14" rx="3" fill="#f5c2a3" stroke="#6b3e26" strokeWidth="1.5" />
              </g>

              {/* TAILLE & ABDOS EXPOSÉS */}
              <rect x="75" y="130" width="50" height="20" fill="#f5c2a3" stroke="#6b3e26" strokeWidth="1.5" />

              {/* SHORT NOIR HIGH-WAIST FITNESS */}
              <path d="M 70 150 L 130 150 L 134 185 L 66 185 Z" fill="#18181b" stroke="#f43f5e" strokeWidth="1.5" />
              <line x1="100" y1="165" x2="100" y2="185" stroke="#09090b" strokeWidth="2" />

              {/* 🦵 JAMBES ET CUISSES GALBÉES CLARA */}
              <rect x="72" y="185" width="22" height="48" rx="4" fill="#f5c2a3" stroke="#6b3e26" strokeWidth="1.5" />
              <rect x="106" y="185" width="22" height="48" rx="4" fill="#f5c2a3" stroke="#6b3e26" strokeWidth="1.5" />

              {/* 👟 BASKETS DE SPORT NEON ROSE & BLANCHE */}
              <path d="M 66 230 L 96 230 L 98 245 L 62 245 Z" fill="#e11d48" stroke="#f43f5e" strokeWidth="1.5" />
              <path d="M 104 230 L 134 230 L 138 245 L 102 245 Z" fill="#e11d48" stroke="#f43f5e" strokeWidth="1.5" />
              <rect x="64" y="240" width="34" height="5" fill="#ffffff" />
              <rect x="102" y="240" width="34" height="5" fill="#ffffff" />
            </svg>
          </div>

          {/* Stats Barres Clara */}
          <div className="mt-3 space-y-1 text-[11px]">
            <div className="flex justify-between text-foreground/70">
              <span>Legs & Cuisses</span>
              <span className="font-mono font-bold text-neon-rose">Niv. {claraLegs}</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-neon-rose transition-all duration-500"
                style={{ width: `${Math.min(100, (claraStats.legsLevel / 5) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
