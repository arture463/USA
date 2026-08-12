"use client";

import { motion } from "framer-motion";
import { Trophy, Flame, Dumbbell, Zap } from "lucide-react";
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
        {/*  GAUCHE : CARTE ARTHUR (PARIS)                           */}
        {/* ════════════════════════════════════════════════════════ */}
        <div className="group relative overflow-hidden rounded-2xl border border-neon-cyan/30 bg-[#12111a] p-4 shadow-[0_0_30px_rgba(56,189,248,0.15)] transition-all hover:border-neon-cyan/50">
          {/* Tag Identité */}
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
          <div className="relative h-64 w-full overflow-hidden rounded-xl border-4 border-[#3e2723] bg-[#1e232a] shadow-inner">
            {/* Texture Carrelage Blanc Salle de Sport */}
            <div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage: `
                  linear-gradient(to right, #38bdf8 1px, transparent 1px),
                  linear-gradient(to bottom, #38bdf8 1px, transparent 1px)
                `,
                backgroundSize: "24px 24px",
              }}
            />

            {/* Reflet de lumière sur le miroir */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-cyan-400/10 to-white/10" />

            {/* Avatar Vectoriel Arthur (Flex Biceps & Débardeur) */}
            <svg viewBox="0 0 200 240" className="relative h-full w-full">
              {/* Ombre au sol */}
              <ellipse cx="100" cy="225" rx="45" ry="8" fill="#000" opacity="0.4" />

              {/* Bras Biceps Flex (Taille selon niveau) */}
              <g id="arthur-left-biceps">
                <motion.path
                  d="M 45 130 C 25 110, 20 150, 55 155 C 65 155, 70 135, 45 130 Z"
                  fill="#e59f6f"
                  stroke="#5c361e"
                  strokeWidth="2.5"
                  animate={{ scale: [1, 1.04, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
                <rect x="35" y="95" width="18" height="35" rx="3" fill="#d08b5c" stroke="#5c361e" strokeWidth="2" />
              </g>

              <g id="arthur-right-biceps">
                <motion.path
                  d="M 155 130 C 175 110, 180 150, 145 155 C 135 155, 130 135, 155 130 Z"
                  fill="#e59f6f"
                  stroke="#5c361e"
                  strokeWidth="2.5"
                  animate={{ scale: [1, 1.04, 1] }}
                  transition={{ duration: 3, repeat: Infinity, delay: 0.2 }}
                />
                <rect x="147" y="95" width="18" height="35" rx="3" fill="#d08b5c" stroke="#5c361e" strokeWidth="2" />
              </g>

              {/* Cheveux Noirs Ébouriffés Arthur */}
              <path
                d="M 75 55 L 85 40 L 95 50 L 110 32 L 125 50 L 135 38 L 145 55 L 140 85 L 70 85 Z"
                fill="#18171a"
              />
              <polygon points="90,42 98,28 105,44" fill="#18171a" />
              <polygon points="115,36 124,22 130,38" fill="#18171a" />

              {/* Visage Arthur */}
              <rect x="75" y="75" width="50" height="42" rx="6" fill="#e59f6f" stroke="#5c361e" strokeWidth="2" />
              {/* Yeux & Expression Confiante */}
              <rect x="85" y="86" width="9" height="8" rx="2" fill="#fff" />
              <rect x="88" y="88" width="5" height="5" fill="#2d1a0e" />
              <rect x="106" y="86" width="9" height="8" rx="2" fill="#fff" />
              <rect x="107" y="88" width="5" height="5" fill="#2d1a0e" />
              <line x1="82" y1="81" x2="96" y2="84" stroke="#18171a" strokeWidth="3" strokeLinecap="round" />
              <line x1="118" y1="81" x2="104" y2="84" stroke="#18171a" strokeWidth="3" strokeLinecap="round" />
              <path d="M 94 105 Q 100 110 106 105" fill="none" stroke="#5c361e" strokeWidth="2" strokeLinecap="round" />

              {/* Débardeur Noir Musclé */}
              <path d="M 60 117 L 140 117 L 132 215 L 68 215 Z" fill="#121216" stroke="#2d2d38" strokeWidth="2.5" />
              <path d="M 85 117 C 85 138, 115 138, 115 117 Z" fill="#e59f6f" />
              <text x="100" y="165" textAnchor="middle" fill="#38bdf8" fontSize="10" fontFamily="monospace" fontWeight="bold" opacity="0.8">
                PARIS 🇫🇷
              </text>
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
        {/*  DROITE : CARTE CLARA (RALEIGH)                          */}
        {/* ════════════════════════════════════════════════════════ */}
        <div className="group relative overflow-hidden rounded-2xl border border-neon-rose/30 bg-[#12111a] p-4 shadow-[0_0_30px_rgba(244,63,94,0.15)] transition-all hover:border-neon-rose/50">
          {/* Tag Identité */}
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
          <div className="relative h-64 w-full overflow-hidden rounded-xl border-4 border-[#3e2723] bg-[#1e232a] shadow-inner">
            {/* Texture Carrelage Rose/Blanc Salle de Sport */}
            <div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage: `
                  linear-gradient(to right, #f43f5e 1px, transparent 1px),
                  linear-gradient(to bottom, #f43f5e 1px, transparent 1px)
                `,
                backgroundSize: "24px 24px",
              }}
            />

            {/* Reflet de lumière sur le miroir */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-rose-400/10 to-white/10" />

            {/* Avatar Vectoriel Clara (Cheveux Longs, Crop Top & Smartphone) */}
            <svg viewBox="0 0 200 240" className="relative h-full w-full">
              {/* Ombre au sol */}
              <ellipse cx="100" cy="225" rx="40" ry="8" fill="#000" opacity="0.4" />

              {/* Cheveux Longs Noirs Clara (Arrière) */}
              <path d="M 65 60 C 55 20, 145 20, 135 60 L 145 180 L 55 180 Z" fill="#0d0c10" />

              {/* Visage Clara */}
              <rect x="75" y="60" width="50" height="42" rx="8" fill="#f5c2a3" stroke="#6b3e26" strokeWidth="2" />
              {/* Frange Droit Noire */}
              <path d="M 70 52 L 130 52 L 130 72 Q 100 76 70 72 Z" fill="#0d0c10" />

              {/* Yeux Noirs Mignons Pixel */}
              <rect x="83" y="74" width="9" height="10" rx="2" fill="#fff" />
              <rect x="85" y="76" width="5" height="6" fill="#121115" />
              <circle cx="86" cy="77" r="1" fill="#fff" />

              <rect x="108" y="74" width="9" height="10" rx="2" fill="#fff" />
              <rect x="109" y="76" width="5" height="6" fill="#121115" />
              <circle cx="110" cy="77" r="1" fill="#fff" />

              {/* Joues Rosées */}
              <ellipse cx="80" cy="88" rx="4" ry="2.5" fill="#f48fb1" opacity="0.6" />
              <ellipse cx="120" cy="88" rx="4" ry="2.5" fill="#f48fb1" opacity="0.6" />
              <path d="M 96 93 Q 100 97 104 93" fill="none" stroke="#6b3e26" strokeWidth="2" strokeLinecap="round" />

              {/* Crop Top Blanc Clara */}
              <path d="M 72 108 L 128 108 L 133 150 L 67 150 Z" fill="#ffffff" stroke="#d1d5db" strokeWidth="2" />
              <path d="M 85 108 C 85 120, 115 120, 115 108 Z" fill="#f5c2a3" />
              <text x="100" y="138" textAnchor="middle" fill="#f43f5e" fontSize="9" fontFamily="monospace" fontWeight="bold">
                RALEIGH 🇺🇸
              </text>

              {/* Smartphone Bleu Selfie en Main */}
              <g id="clara-phone">
                <path d="M 125 118 L 150 115 L 145 155 L 125 142 Z" fill="#f5c2a3" stroke="#6b3e26" strokeWidth="2" />
                <rect x="140" y="105" width="18" height="32" rx="3" fill="#0284c7" stroke="#0f172a" strokeWidth="2" />
                <circle cx="145" cy="112" r="2.5" fill="#1e293b" />
                <rect x="143" y="118" width="12" height="15" rx="1" fill="#38bdf8" opacity="0.8" />
              </g>

              {/* Short Noir & Cuisses */}
              <rect x="75" y="150" width="50" height="20" fill="#f5c2a3" stroke="#6b3e26" strokeWidth="1.5" />
              <path d="M 70 170 L 130 170 L 134 205 L 66 205 Z" fill="#18181b" stroke="#3f3f46" strokeWidth="2" />
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
