"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Dumbbell, Plus, Trophy, Flame, Zap } from "lucide-react";
import { useGym } from "@/hooks/use-gym";
import { useIdentity } from "@/hooks/use-identity";
import { revealOnScroll } from "@/lib/motion";
import { SectionHeading } from "@/components/ui/section-heading";
import { WORKOUT_INFO } from "@/lib/gym-data";
import { PixelAvatar } from "./pixel-avatar";
import { GymLoggerModal } from "./gym-logger-modal";

/**
 * MODULE 8 — La Salle de Sport RPG (Arthur 🏋️‍♂️ & Clara 🏋️‍♀️)
 * Suivi de musculation ludique avec avatars Pixel Art évolutifs !
 */
export function Gym() {
  const { identity } = useIdentity();
  const { sessions, loading, logWorkout, arthurStats, claraStats } = useGym();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <motion.section {...revealOnScroll} className="w-full">
      <div className="flex items-center justify-between gap-4">
        <SectionHeading
          eyebrow="Le Gym Challenge"
          icon={Dumbbell}
          title="Salle de"
          titleAccent="Sport RPG"
          subtitle="Notons nos séances Push / Pull / Legs & voyons nos avatars prendre des muscles !"
          accent="cyan"
        />

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="btn-neon btn-sm btn-pill shrink-0 gap-1.5 text-xs border-amber-400/60 text-amber-300 hover:border-amber-400"
        >
          <Plus className="h-3.5 w-3.5" />
          Valider une séance
        </button>
      </div>

      <div className="panel-roomy relative overflow-hidden space-y-6">
        {/* Scène Miroir Pixel Art */}
        <PixelAvatar arthurStats={arthurStats} claraStats={claraStats} />

        {/* Tableau de Compétition Arthur vs Clara */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Stats Arthur */}
          <div className="rounded-xl border border-neon-cyan/20 bg-neon-cyan/5 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">🏋️‍♂️</span>
                <div>
                  <h4 className="font-semibold text-sm text-neon-cyan">
                    Arthur (Paris 🇫🇷)
                  </h4>
                  <p className="text-[11px] text-foreground/50">
                    {arthurStats.totalSessions} séance{arthurStats.totalSessions > 1 ? "s" : ""} validée{arthurStats.totalSessions > 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 rounded bg-neon-cyan/20 px-2 py-1 font-mono text-xs text-neon-cyan font-bold">
                <Trophy className="h-3.5 w-3.5" /> Niv. {arthurStats.totalSessions}
              </div>
            </div>

            {/* Barres de muscles */}
            <div className="space-y-1.5 text-[11px]">
              <MuscleBar label="Push (Pecs / Épaules)" val={arthurStats.pushLevel} color="hsl(18 95% 62%)" />
              <MuscleBar label="Pull (Dos / Biceps)" val={arthurStats.pullLevel} color="hsl(265 90% 65%)" />
              <MuscleBar label="Legs (Cuisses)" val={arthurStats.legsLevel} color="hsl(152 76% 60%)" />
            </div>
          </div>

          {/* Stats Clara */}
          <div className="rounded-xl border border-neon-rose/20 bg-neon-rose/5 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">🏋️‍♀️</span>
                <div>
                  <h4 className="font-semibold text-sm text-neon-rose">
                    Clara (Raleigh 🇺🇸)
                  </h4>
                  <p className="text-[11px] text-foreground/50">
                    {claraStats.totalSessions} séance{claraStats.totalSessions > 1 ? "s" : ""} validée{claraStats.totalSessions > 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 rounded bg-neon-rose/20 px-2 py-1 font-mono text-xs text-neon-rose font-bold">
                <Trophy className="h-3.5 w-3.5" /> Niv. {claraStats.totalSessions}
              </div>
            </div>

            {/* Barres de muscles */}
            <div className="space-y-1.5 text-[11px]">
              <MuscleBar label="Push (Pecs / Épaules)" val={claraStats.pushLevel} color="hsl(18 95% 62%)" />
              <MuscleBar label="Pull (Dos / Biceps)" val={claraStats.pullLevel} color="hsl(265 90% 65%)" />
              <MuscleBar label="Legs (Cuisses)" val={claraStats.legsLevel} color="hsl(152 76% 60%)" />
            </div>
          </div>
        </div>

        {/* Historique des Dernières Séances */}
        <div className="border-t border-white/10 pt-4">
          <p className="label-micro mb-3">Dernières séances enregistrées</p>

          {sessions.length === 0 ? (
            <p className="text-center text-xs text-foreground/40 py-4">
              Aucune séance enregistrée pour l&apos;instant. Cliquez sur &quot;Valider une séance&quot; pour commencer ! 💪
            </p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {sessions.slice(0, 5).map((s) => {
                const info = WORKOUT_INFO[s.type];
                const isArthur = s.who === "paris";
                return (
                  <div
                    key={s.id}
                    className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 px-3 py-2 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span>{info.emoji}</span>
                      <div>
                        <p className="font-semibold">
                          <span className={isArthur ? "text-neon-cyan" : "text-neon-rose"}>
                            {isArthur ? "Arthur" : "Clara"}
                          </span>{" "}
                          · {info.label}
                        </p>
                        {s.notes && (
                          <p className="text-[11px] text-foreground/60 italic">
                            &quot;{s.notes}&quot;
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="font-mono text-[10px] text-foreground/40">
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

      {/* Modale de Saisie */}
      <GymLoggerModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onLog={logWorkout}
        currentIdentity={identity}
      />
    </motion.section>
  );
}

function MuscleBar({ label, val, color }: { label: string; val: number; color: string }) {
  const percent = Math.min(100, (val / 5) * 100);
  return (
    <div>
      <div className="flex justify-between text-foreground/70 mb-0.5">
        <span>{label}</span>
        <span className="font-mono font-bold" style={{ color }}>
          +{val.toFixed(1)}
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
