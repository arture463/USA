"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Heart } from "lucide-react";
import confetti from "canvas-confetti";
import { useIdentity } from "@/hooks/use-identity";
import type { Identity } from "@/types";

function FrenchFlag() {
  return (
    <span className="inline-flex h-8 w-12 overflow-hidden rounded-md border border-white/20 shadow-md">
      <span className="w-1/3 bg-[#002654]" />
      <span className="w-1/3 bg-white" />
      <span className="w-1/3 bg-[#CE1126]" />
    </span>
  );
}

function UsFlag() {
  return (
    <span className="relative inline-flex h-8 w-12 overflow-hidden rounded-md border border-white/20 bg-[#B22234] shadow-md">
      <span className="absolute inset-x-0 top-[25%] h-[25%] bg-white" />
      <span className="absolute inset-x-0 top-[75%] h-[25%] bg-white" />
      <span className="absolute top-0 left-0 flex h-[60%] w-[45%] items-center justify-center bg-[#3C3B6E] text-[9px] text-white">
        ★
      </span>
    </span>
  );
}

export function IdentityWelcomeModal() {
  const { ready, hasChosen, setIdentity } = useIdentity();

  if (!ready || hasChosen) return null;

  const handlePick = (id: Identity) => {
    setIdentity(id);
    void confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl"
      >
        <motion.div
          initial={{ scale: 0.85, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.85, opacity: 0, y: 20 }}
          className="panel-roomy relative max-w-md w-full overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-b from-slate-900 via-[#0d1326] to-slate-950 p-6 sm:p-8 text-center shadow-[0_0_50px_rgba(168,85,247,0.3)] space-y-6"
        >
          {/* Entête Cœur Néon */}
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 text-white shadow-[0_0_25px_rgba(236,72,153,0.5)]">
            <Heart className="h-8 w-8 text-white animate-pulse" />
          </div>

          <div className="space-y-2">
            <h2 className="font-display font-bold text-2xl text-foreground flex items-center justify-center gap-2">
              Bienvenue sur US Together <Sparkles className="h-5 w-5 text-amber-400" />
            </h2>
            <p className="text-sm text-foreground/70">
              Qui est devant l&apos;écran ? Choisissez votre profil pour démarrer l&apos;aventure :
            </p>
          </div>

          {/* Grille de sélection 2 Profils */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <motion.button
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => handlePick("paris")}
              className="flex flex-col items-center gap-3 rounded-2xl border border-purple-500/40 bg-purple-500/10 p-5 transition-all hover:border-purple-400 hover:bg-purple-500/20 shadow-[0_0_20px_rgba(168,85,247,0.2)] text-purple-200"
            >
              <FrenchFlag />
              <div>
                <h4 className="font-bold text-base text-purple-300">Arthur</h4>
                <p className="text-[11px] text-purple-300/70 font-mono">Paris, France</p>
              </div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => handlePick("raleigh")}
              className="flex flex-col items-center gap-3 rounded-2xl border border-cyan-500/40 bg-cyan-500/10 p-5 transition-all hover:border-cyan-400 hover:bg-cyan-500/20 shadow-[0_0_20px_rgba(56,189,248,0.2)] text-cyan-200"
            >
              <UsFlag />
              <div>
                <h4 className="font-bold text-base text-cyan-300">Clara</h4>
                <p className="text-[11px] text-cyan-300/70 font-mono">Raleigh, NC</p>
              </div>
            </motion.button>
          </div>

          <p className="text-[11px] text-foreground/40 font-mono">
            Mémorisé sur cet appareil · Modifiable à tout moment dans la barre de navigation.
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
