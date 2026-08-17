"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Heart,
  Sparkles,
  Fingerprint,
  Radio,
  Timer,
  Stars,
  ShieldCheck,
} from "lucide-react";
import { useTouchSync } from "@/hooks/use-touch-sync";
import type { Identity } from "@/types";

interface TouchSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  identity: Identity | null;
}

export function TouchSyncModal({ isOpen, onClose, identity }: TouchSyncModalProps) {
  const {
    myTouching,
    partnerTouching,
    isHugActive,
    hugSeconds,
    lastCompletedHug,
    partnerName,
    totalHugs,
    totalSecondsHugs,
    startTouch,
    stopTouch,
  } = useTouchSync(identity);

  if (!isOpen) return null;

  const isArthur = identity === "paris";
  const myColorClass = isArthur ? "text-neon-cyan" : "text-neon-rose";
  const myBgAura = isArthur
    ? "bg-cyan-500/20 border-neon-cyan shadow-[0_0_50px_rgba(34,211,238,0.4)]"
    : "bg-rose-500/20 border-neon-rose shadow-[0_0_50px_rgba(244,114,182,0.4)]";

  const partnerColorClass = isArthur ? "text-neon-rose" : "text-neon-cyan";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-between p-4 md:p-8 bg-black/95 backdrop-blur-3xl select-none"
      >
        {/* Halo de pulsation cardiaque quand le câlin est actif */}
        {isHugActive && (
          <motion.div
            animate={{ scale: [1, 1.12, 1], opacity: [0.15, 0.45, 0.15] }}
            transition={{ repeat: Infinity, duration: 0.8, ease: "easeInOut" }}
            className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-400/30 via-rose-500/20 to-transparent pointer-events-none"
          />
        )}

        {/* ── EN-TÊTE MODALE ── */}
        <div className="w-full max-w-lg flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-rose opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-neon-rose" />
            </span>
            <h2 className="text-sm md:text-base font-bold font-space text-foreground tracking-wide flex items-center gap-1.5">
              <span>Touch Sync</span>
              <span className="text-xs font-mono text-neon-rose border border-neon-rose/30 px-2 py-0.5 rounded-full bg-neon-rose/10">
                Haptique 75 BPM
              </span>
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-foreground/50 hover:text-foreground hover:bg-white/10 transition-colors"
            title="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ── CENTRE : LE PAD TACTILE & LA FUSION MAGNÉTIQUE ── */}
        <div className="flex flex-col items-center justify-center text-center my-auto z-10 max-w-md w-full">
          {/* Statut de connexion des deux partenaires */}
          <div className="flex items-center gap-3 mb-6">
            <span
              className={`text-xs font-mono px-3 py-1 rounded-full border transition-all ${
                myTouching
                  ? "border-emerald-400 bg-emerald-500/20 text-emerald-300 shadow-[0_0_15px_rgba(52,211,153,0.3)]"
                  : "border-white/15 bg-white/5 text-foreground/60"
              }`}
            >
              {isArthur ? "Arthur 🇫🇷" : "Clara 🇺🇸"} : {myTouching ? "Doigt posé 🟢" : "En attente"}
            </span>

            <span className="text-xs font-bold text-foreground/30">↔</span>

            <span
              className={`text-xs font-mono px-3 py-1 rounded-full border transition-all ${
                partnerTouching
                  ? "border-emerald-400 bg-emerald-500/20 text-emerald-300 shadow-[0_0_15px_rgba(52,211,153,0.3)]"
                  : "border-white/15 bg-white/5 text-foreground/60"
              }`}
            >
              {partnerName} : {partnerTouching ? "Doigt posé 🟢" : "En attente"}
            </span>
          </div>

          {/* Chronomètre / Message d'état */}
          <div className="min-h-[60px] flex flex-col items-center justify-center mb-6">
            {isHugActive ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="space-y-1"
              >
                <div className="flex items-center justify-center gap-2 text-amber-300 font-space font-black text-2xl md:text-3xl tracking-tight filter drop-shadow-[0_0_15px_rgba(251,191,36,0.6)]">
                  <Heart className="h-7 w-7 fill-amber-400 text-amber-400 animate-pulse" />
                  <span>CÂLIN EN COURS : {hugSeconds}s</span>
                </div>
                <p className="text-xs text-foreground/80 italic font-mono">
                  Vos téléphones vibrent au même battement de cœur synchronisé ❤️
                </p>
              </motion.div>
            ) : lastCompletedHug ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="space-y-1 text-emerald-300"
              >
                <p className="font-bold text-sm flex items-center justify-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-amber-300" />
                  Étreinte scellée de {lastCompletedHug} secondes !
                </p>
                <p className="text-[11px] text-foreground/60">
                  Enregistrée dans votre Galaxie des Câlins ✨
                </p>
              </motion.div>
            ) : myTouching ? (
              <p className="text-xs text-foreground/70 animate-pulse">
                Maintiens ton doigt posé... Dès que {partnerName} pose le sien, la fusion s&apos;active !
              </p>
            ) : (
              <p className="text-xs text-foreground/70">
                Pose et maintiens ton doigt ou pouce sur le capteur ci-dessous 👇
              </p>
            )}
          </div>

          {/* LE PAD TACTILE GÉANT */}
          <div className="relative flex items-center justify-center">
            {/* Onde d'énergie concentrique */}
            <motion.div
              animate={{
                scale: isHugActive ? [1, 1.4, 1] : myTouching ? [1, 1.15, 1] : 1,
                opacity: isHugActive ? [0.4, 0.8, 0.4] : myTouching ? [0.3, 0.6, 0.3] : 0.1,
              }}
              transition={{ repeat: Infinity, duration: isHugActive ? 0.8 : 2 }}
              className={`absolute h-64 w-64 md:h-72 md:w-72 rounded-full border-2 border-dashed ${
                isHugActive
                  ? "border-amber-400 bg-amber-400/10 shadow-[0_0_70px_rgba(251,191,36,0.4)]"
                  : myTouching
                    ? isArthur
                      ? "border-cyan-400 bg-cyan-400/10"
                      : "border-rose-400 bg-rose-400/10"
                    : "border-white/10 bg-white/5"
              }`}
            />

            {/* Le bouton / capteur physique */}
            <button
              type="button"
              onPointerDown={startTouch}
              onPointerUp={stopTouch}
              onPointerCancel={stopTouch}
              onPointerLeave={stopTouch}
              className={`relative h-44 w-44 md:h-48 md:w-48 rounded-full border-2 flex flex-col items-center justify-center transition-all duration-500 cursor-pointer ${
                isHugActive
                  ? "bg-gradient-to-tr from-amber-500 via-rose-500 to-amber-300 border-amber-200 shadow-[0_0_80px_rgba(251,191,36,0.7)] scale-105"
                  : myTouching
                    ? myBgAura
                    : "bg-black/60 border-white/20 hover:border-white/40 shadow-[0_0_30px_rgba(255,255,255,0.05)] active:scale-95"
              }`}
            >
              {isHugActive ? (
                <Heart className="h-16 w-16 text-white fill-white animate-bounce drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]" />
              ) : (
                <Fingerprint
                  className={`h-16 w-16 transition-colors duration-300 ${
                    myTouching ? myColorClass : "text-foreground/40"
                  }`}
                />
              )}

              <span className="text-[11px] font-mono font-bold mt-2 text-foreground/80 tracking-wider uppercase">
                {isHugActive ? "Fusion Active" : myTouching ? "Doigt Scellé" : "Poser le doigt"}
              </span>
            </button>
          </div>
        </div>

        {/* ── BAS : LA GALAXIE DES CÂLINS ── */}
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-4 text-center z-10 backdrop-blur-xl">
          <div className="flex items-center justify-between text-xs font-mono text-foreground/70">
            <span className="flex items-center gap-1.5">
              <Stars className="h-4 w-4 text-amber-300" />
              Galaxie des Câlins : <strong>{totalHugs.length} étoiles</strong>
            </span>
            <span>
              Total partagé : <strong>{Math.round(totalSecondsHugs / 60)} min {totalSecondsHugs % 60}s</strong>
            </span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
