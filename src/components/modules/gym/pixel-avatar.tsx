"use client";

import { motion } from "framer-motion";
import type { MuscleStats } from "@/lib/gym-data";

interface PixelAvatarProps {
  arthurStats: MuscleStats;
  claraStats: MuscleStats;
}

export function PixelAvatar({ arthurStats, claraStats }: PixelAvatarProps) {
  // Calcul du niveau de musculation (1 à 5)
  const arthurArmsLevel = Math.min(5, Math.floor(arthurStats.pushLevel + arthurStats.pullLevel) + 1);
  const arthurChestLevel = Math.min(5, Math.floor(arthurStats.pushLevel) + 1);
  
  const claraAbsLevel = Math.min(5, Math.floor(claraStats.cardioLevel) + 1);
  const claraLegsLevel = Math.min(5, Math.floor(claraStats.legsLevel) + 1);

  return (
    <div className="relative mx-auto w-full max-w-md overflow-hidden rounded-2xl border-4 border-amber-900/60 bg-[#16141d] shadow-[0_0_50px_rgba(0,0,0,0.8)]">
      {/* Texture Carrelage Salle de Sport Pixel */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, #ffffff 1px, transparent 1px),
            linear-gradient(to bottom, #ffffff 1px, transparent 1px)
          `,
          backgroundSize: "24px 24px",
        }}
      />

      {/* Lampe Néon du Plafond */}
      <div className="relative mx-auto mt-2 h-3 w-28 rounded-full bg-cyan-200 shadow-[0_0_20px_#38bdf8]" />

      {/* Cadre Miroir Bois Pixel */}
      <div className="relative mx-auto my-3 flex h-80 w-[90%] flex-col items-center justify-end rounded-xl border-8 border-[#5c3a21] bg-[#1a202c] p-2 shadow-inner">
        {/* Reflet Miroir */}
        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 via-transparent to-white/5 pointer-events-none" />

        {/* ── ARTHUR (Derrière, flex les bras) ── */}
        <motion.div
          className="relative z-10 flex flex-col items-center"
          animate={{ y: [0, -2, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Bras Flex Arthur (s'élargissent avec le niveau Push/Pull) */}
          <div className="relative flex items-center justify-center gap-12">
            {/* Biceps Gauche Arthur */}
            <motion.div
              className="h-14 bg-[#d49b78] border-2 border-[#5c3317] rounded-t-full origin-bottom-right"
              style={{
                width: `${24 + arthurArmsLevel * 6}px`,
                transform: `rotate(-35deg) scaleY(${1 + arthurArmsLevel * 0.15})`,
              }}
            >
              <div className="h-4 w-full bg-[#f0bd9e]/40 rounded-t-full" />
            </motion.div>

            {/* Biceps Droit Arthur */}
            <motion.div
              className="h-14 bg-[#d49b78] border-2 border-[#5c3317] rounded-t-full origin-bottom-left"
              style={{
                width: `${24 + arthurArmsLevel * 6}px`,
                transform: `rotate(35deg) scaleY(${1 + arthurArmsLevel * 0.15})`,
              }}
            >
              <div className="h-4 w-full bg-[#f0bd9e]/40 rounded-t-full" />
            </motion.div>
          </div>

          {/* Tête Arthur */}
          <div className="relative -mt-10 flex flex-col items-center z-10">
            {/* Cheveux Noirs Ébouriffés Pixel */}
            <div className="h-9 w-14 rounded-t-xl bg-[#1e1b18] relative">
              <div className="absolute -top-1 left-2 h-4 w-4 bg-[#1e1b18] rotate-45" />
              <div className="absolute -top-1 right-2 h-4 w-4 bg-[#1e1b18] rotate-45" />
            </div>
            {/* Visage Arthur */}
            <div className="h-10 w-11 bg-[#f0bd9e] border-2 border-[#5c3317] flex flex-col items-center justify-center">
              {/* Yeux Pixel */}
              <div className="flex gap-3">
                <div className="h-2 w-2 bg-[#2d1a0e] rounded-sm" />
                <div className="h-2 w-2 bg-[#2d1a0e] rounded-sm" />
              </div>
              {/* Sourire */}
              <div className="mt-1 h-1 w-4 bg-[#a35e38] rounded-full" />
            </div>
          </div>

          {/* Torse & Pectoraux Arthur (Débardeur Noir) */}
          <div
            className="bg-[#111115] border-x-2 border-t-2 border-[#33333d] flex justify-center items-center"
            style={{
              width: `${56 + arthurChestLevel * 8}px`,
              height: "50px",
            }}
          >
            <div className="text-[9px] font-mono text-neon-cyan font-bold tracking-wider opacity-80">
              PARIS
            </div>
          </div>
        </motion.div>

        {/* ── CLARA (Devant, photo miroir) ── */}
        <motion.div
          className="relative z-20 -mt-8 flex flex-col items-center"
          animate={{ y: [0, 1, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Tête Clara */}
          <div className="relative flex flex-col items-center">
            {/* Cheveux Longs Noirs Clara */}
            <div className="h-14 w-16 rounded-t-2xl bg-[#121115] relative">
              {/* Mèches longues tombantes */}
              <div className="absolute top-4 -left-2 h-16 w-4 bg-[#121115] rounded-b-lg" />
              <div className="absolute top-4 -right-2 h-16 w-4 bg-[#121115] rounded-b-lg" />
            </div>
            {/* Visage Clara */}
            <div className="absolute top-3 h-9 w-10 bg-[#f7cfb7] border-2 border-[#6e3c23] flex flex-col items-center justify-center">
              {/* Yeux Mignons */}
              <div className="flex gap-2">
                <div className="h-2 w-2 bg-[#1e1b18] rounded-full" />
                <div className="h-2 w-2 bg-[#1e1b18] rounded-full" />
              </div>
              {/* Sourire */}
              <div className="mt-1 h-1 w-3 bg-[#c46d4c] rounded-full" />
            </div>
          </div>

          {/* Crop Top Blanc Clara */}
          <div className="mt-2 h-10 w-12 bg-white border-2 border-gray-300 rounded-t-md flex items-center justify-center shadow-sm">
            {/* Téléphone Selfie dans la main */}
            <div className="absolute right-[-14px] top-1 h-10 w-5 bg-sky-500 border-2 border-gray-800 rounded-sm flex items-center justify-center">
              <div className="h-2 w-2 bg-black rounded-full" />
            </div>
          </div>

          {/* Taille / Abdos Clara */}
          <div className="h-4 w-10 bg-[#f7cfb7] border-x-2 border-[#6e3c23] flex justify-center items-center">
            {claraAbsLevel >= 3 && (
              <div className="h-2 w-6 border-b border-[#d48e6c]" />
            )}
          </div>

          {/* Short Noir Clara (Cuisses galbées avec niveau Legs) */}
          <div
            className="bg-[#18181f] border-2 border-gray-800 rounded-b-md"
            style={{
              width: `${36 + claraLegsLevel * 4}px`,
              height: "22px",
            }}
          />
        </motion.div>

        {/* Badges Titre de Niveau */}
        <div className="absolute bottom-2 left-3 right-3 flex justify-between text-[10px] font-mono font-bold text-white">
          <div className="flex items-center gap-1 rounded bg-black/60 px-2 py-0.5 border border-neon-cyan/40">
            <span className="text-neon-cyan">ARTHUR</span> Lv.{arthurStats.totalSessions}
          </div>
          <div className="flex items-center gap-1 rounded bg-black/60 px-2 py-0.5 border border-neon-rose/40">
            <span className="text-neon-rose">CLARA</span> Lv.{claraStats.totalSessions}
          </div>
        </div>
      </div>
    </div>
  );
}
