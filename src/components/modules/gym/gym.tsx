"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dumbbell, Plus, Trophy, Flame, Zap, Award, Sparkles, Send, Heart } from "lucide-react";
import { useGym } from "@/hooks/use-gym";
import { useIdentity } from "@/hooks/use-identity";
import { revealOnScroll } from "@/lib/motion";
import { SectionHeading } from "@/components/ui/section-heading";
import { WORKOUT_INFO } from "@/lib/gym-data";
import { PixelAvatar } from "./pixel-avatar";
import { GymLoggerModal } from "./gym-logger-modal";

/**
 * MODULE 8 — La Salle de Sport RPG Next-Gen (Arthur 🏋️‍♂️ & Clara 🏋️‍♀️)
 * Gamification complète : XP, Niveaux, Badges, Série Duo 🔥 et Encouragements !
 */
export function Gym() {
  const { identity } = useIdentity();
  const {
    sessions,
    logWorkout,
    sendHighFive,
    highFiveToast,
    arthurStats,
    claraStats,
    badges,
    streak,
  } = useGym();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <motion.section {...revealOnScroll} className="w-full">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SectionHeading
          eyebrow="Le Gym Challenge Next-Gen"
          icon={Dumbbell}
          title="Salle de"
          titleAccent="Sport RPG"
          subtitle="Gagnez de l'XP, débloquez des badges & faites briller votre Série Duo à travers l'Atlantique !"
          accent="cyan"
        />

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="btn-neon btn-sm btn-pill shrink-0 gap-1.5 text-xs border-amber-400/60 text-amber-300 hover:border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.3)]"
          >
            <Plus className="h-3.5 w-3.5" />
            + Valider une séance
          </button>
        </div>
      </div>

      <div className="panel-roomy relative overflow-hidden space-y-6">
        {/* Toast High-Five / Encouragement */}
        <AnimatePresence>
          {highFiveToast && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="rounded-xl border border-amber-400/50 bg-amber-500/15 p-3 text-center text-xs font-semibold text-amber-300 shadow-lg backdrop-blur-md flex items-center justify-center gap-2"
            >
              <Sparkles className="h-4 w-4 text-amber-400 animate-spin" />
              {highFiveToast}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── BANNIÈRE SÉRIE EN DUO (STREAK FLAME 🔥) ── */}
        <div className="relative overflow-hidden rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-950/40 via-orange-950/20 to-amber-950/40 p-4 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
              <Flame className="h-6 w-6 text-amber-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-display font-bold text-sm text-amber-300">
                  Série Duo Gym : {streak} Séance{streak > 1 ? "s" : ""} Active{streak > 1 ? "s" : ""} !
                </h4>
                <span className="rounded bg-amber-500/20 px-2 py-0.5 font-mono text-[10px] font-bold text-amber-400 border border-amber-500/30">
                  🔥 STREAK
                </span>
              </div>
              <p className="text-[11px] text-foreground/60">
                Chaque séance validée entre Paris et Raleigh entretient la flamme du couple !
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => sendHighFive(identity ?? "paris")}
            className="btn-ghost text-xs gap-1.5 border-amber-500/40 text-amber-300 hover:bg-amber-500/10 shrink-0"
          >
            <Send className="h-3.5 w-3.5" />
            Envoyer une Gourde / High-Five 🥤
          </button>
        </div>

        {/* ── 1. AVATARS ANIME 16-BIT DUEL ARENA ── */}
        <PixelAvatar arthurStats={arthurStats} claraStats={claraStats} />

        {/* ── 2. GRILLE DES BADGES & TROPHÉES DÉBLOCABLES ── */}
        <div className="border-t border-white/10 pt-5 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-display font-semibold text-sm flex items-center gap-2 text-foreground/90">
              <Award className="h-4 w-4 text-amber-400" />
              Badges & Accomplissements en Duo
            </h4>
            <span className="font-mono text-xs text-foreground/50">
              {badges.filter((b) => b.unlocked).length} / {badges.length} Débloqués
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {badges.map((b) => (
              <div
                key={b.id}
                className={`flex items-start gap-3 rounded-xl border p-3 transition-all ${
                  b.unlocked
                    ? "border-amber-500/40 bg-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.15)]"
                    : "border-white/5 bg-white/5 opacity-50 grayscale"
                }`}
              >
                <span className="text-2xl">{b.emoji}</span>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <h5 className={`font-semibold text-xs ${b.unlocked ? "text-amber-300" : "text-foreground/70"}`}>
                      {b.title}
                    </h5>
                    {b.unlocked && <Sparkles className="h-3 w-3 text-amber-400" />}
                  </div>
                  <p className="text-[11px] text-foreground/50">
                    {b.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── 3. HISTORIQUE DES SÉANCES ENREGISTRÉES ── */}
        <div className="border-t border-white/10 pt-4">
          <p className="label-micro mb-3">Historique des séances enregistrées</p>

          {sessions.length === 0 ? (
            <p className="text-center text-xs text-foreground/40 py-4">
              Aucune séance enregistrée pour l&apos;instant. Cliquez sur &quot;Valider une séance&quot; pour commencer à gagner de l&apos;XP ! 💪
            </p>
          ) : (
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {sessions.slice(0, 6).map((s) => {
                const info = WORKOUT_INFO[s.type];
                const isArthur = s.who === "paris";
                return (
                  <div
                    key={s.id}
                    className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 px-3 py-2 text-xs hover:border-white/15 transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">{info.emoji}</span>
                      <div>
                        <p className="font-semibold flex items-center gap-1.5">
                          <span className={isArthur ? "text-neon-cyan" : "text-neon-rose"}>
                            {isArthur ? "Arthur 🇫🇷" : "Clara 🇺🇸"}
                          </span>
                          <span>· {info.label}</span>
                          <span className="rounded bg-amber-500/20 px-1.5 py-0.5 font-mono text-[10px] text-amber-300 font-bold">
                            +{info.xp} XP
                          </span>
                        </p>
                        {s.notes && (
                          <p className="text-[11px] text-foreground/60 italic">
                            &quot;{s.notes}&quot;
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="font-mono text-[10px] text-foreground/40 shrink-0">
                      {new Date(s.created_at).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modale de Saisie avec Confettis & XP */}
      <GymLoggerModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onLog={logWorkout}
        currentIdentity={identity}
      />
    </motion.section>
  );
}
