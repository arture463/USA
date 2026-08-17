"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Lock,
  Send,
  CheckCircle2,
  BrainCircuit,
  Zap,
  BookOpen,
  Calendar,
  Heart,
  Quote,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { useIdentity } from "@/hooks/use-identity";
import { useTelepathy } from "@/hooks/use-telepathy";
import { revealOnScroll } from "@/lib/motion";
import { formatUsRealDate } from "@/hooks/use-us-real";

function FrenchFlagBadge() {
  return (
    <span className="inline-flex h-3.5 w-5 shrink-0 overflow-hidden rounded-[2px] border border-white/20 shadow-sm">
      <span className="w-1/3 bg-[#002654]" />
      <span className="w-1/3 bg-white" />
      <span className="w-1/3 bg-[#CE1126]" />
    </span>
  );
}

function UsFlagBadge() {
  return (
    <span className="relative inline-flex h-3.5 w-5 shrink-0 overflow-hidden rounded-[2px] border border-white/20 bg-[#B22234] shadow-sm">
      <span className="absolute inset-x-0 top-[25%] h-[25%] bg-white" />
      <span className="absolute inset-x-0 top-[75%] h-[25%] bg-white" />
      <span className="absolute top-0 left-0 flex h-[60%] w-[45%] items-center justify-center bg-[#3C3B6E] text-[5px] text-white">
        ★
      </span>
    </span>
  );
}

export function Telepathy() {
  const { identity } = useIdentity();
  const {
    todayQuestion,
    todayPair,
    myTodayAnswer,
    partnerTodayAnswer,
    hasAnsweredToday,
    partnerHasAnsweredToday,
    historyDays,
    loading,
    submitting,
    submitAnswer,
  } = useTelepathy(identity);

  const [inputAnswer, setInputAnswer] = useState("");
  const [historyOpen, setHistoryOpen] = useState(false);

  const isArthur = identity === "paris";
  const myName = isArthur ? "Arthur" : "Clara";
  const partnerName = isArthur ? "Clara" : "Arthur";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputAnswer.trim() || submitting) return;
    try {
      await submitAnswer(inputAnswer);
      setInputAnswer("");
    } catch {
      // Échec déjà géré dans le hook
    }
  };

  return (
    <motion.section {...revealOnScroll} className="w-full">
      {/* ── EN-TÊTE DU MODULE ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
        <SectionHeading
          eyebrow="Jeu Complice & Blind Match 🔮"
          icon={Sparkles}
          title="Télépathie :"
          titleAccent="Test Quantique"
          subtitle="Une question secrète par jour. Vos réponses restent cryptées jusqu'à ce que vous ayez tous les deux répondu !"
          accent="violet"
          className="mb-0"
        />

        {/* Badge Statut */}
        <div className="flex items-center gap-1.5 rounded-full border border-neon-violet/40 bg-neon-violet/15 px-3 py-1 text-xs font-bold text-neon-violet shadow-[0_0_15px_rgba(168,85,247,0.25)]">
          <BrainCircuit className="h-4 w-4 animate-pulse" />
          <span>
            {todayPair.bothAnswered
              ? "Synchronicité Révélée ✨"
              : hasAnsweredToday
                ? `En attente de ${partnerName} ⏳`
                : "Question du Jour Disponible ⚡"}
          </span>
        </div>
      </div>

      <div className="panel-roomy relative overflow-hidden space-y-6 border-neon-violet/30 bg-gradient-to-b from-neon-violet/10 via-background/95 to-background/95 shadow-[0_0_35px_rgba(168,85,247,0.15)]">
        {/* ── LA QUESTION DU JOUR ── */}
        <div className="relative rounded-2xl border border-neon-violet/30 bg-black/40 p-5 md:p-6 backdrop-blur-xl text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="text-xl">{todayQuestion.categoryEmoji}</span>
            <span className="rounded-full bg-neon-violet/20 border border-neon-violet/30 px-3 py-0.5 text-xs font-bold uppercase tracking-wider text-neon-violet font-space">
              {todayQuestion.categoryLabel}
            </span>
          </div>

          <h3 className="font-display text-lg md:text-xl font-bold text-foreground max-w-2xl mx-auto leading-relaxed drop-shadow-sm">
            &laquo; {todayQuestion.question} &raquo;
          </h3>

          <p className="text-[11px] font-mono text-foreground/50 mt-3 flex items-center justify-center gap-1.5">
            <Lock className="h-3 w-3 text-neon-violet" />
            Réponses verrouillées et invisibles tant que les deux n&apos;ont pas validé.
          </p>
        </div>

        {/* ── ZONE DE RÉPONSE / RÉVÉLATION ── */}
        {!hasAnsweredToday ? (
          /* 1. JE N'AI PAS ENCORE RÉPONDU -> FORMULAIRE SECRET */
          <motion.form
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit}
            className="rounded-2xl border border-white/15 bg-white/5 p-5 md:p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <label className="label-micro text-neon-violet flex items-center gap-1.5 font-bold">
                <BrainCircuit className="h-3.5 w-3.5" />
                Ta réponse secrète ({myName}) :
              </label>

              {partnerHasAnsweredToday && (
                <span className="text-[11px] font-semibold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                  {partnerName} a déjà scellé sa réponse !
                </span>
              )}
            </div>

            <textarea
              rows={3}
              value={inputAnswer}
              onChange={(e) => setInputAnswer(e.target.value)}
              placeholder={todayQuestion.placeholder}
              required
              className="textarea w-full text-xs md:text-sm p-3.5 rounded-xl border-white/15 bg-black/40 focus:border-neon-violet focus:outline-none placeholder:text-foreground/30 resize-none"
            />

            <div className="flex items-center justify-between pt-1">
              <p className="text-[11px] text-foreground/40 italic">
                {partnerHasAnsweredToday
                  ? "Dès que tu cliques, vos 2 réponses sont révélées en direct !"
                  : "Ta réponse restera cachée jusqu'à ce que l'autre réponde."}
              </p>

              <button
                type="submit"
                disabled={submitting || !inputAnswer.trim()}
                className="btn-neon btn-sm btn-pill gap-2 px-5 py-2 text-xs font-bold border-neon-violet/60 text-neon-violet hover:bg-neon-violet/20 shadow-[0_0_20px_rgba(168,85,247,0.3)] shrink-0"
              >
                <Send className="h-3.5 w-3.5" />
                {submitting ? "Scellement..." : "Sceller ma réponse 🔮"}
              </button>
            </div>
          </motion.form>
        ) : !todayPair.bothAnswered ? (
          /* 2. J'AI RÉPONDU MAIS LE PARTENAIRE N'A PAS ENCORE VALIDÉ -> ÉCRAN D'ATTENTE */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Ma réponse scellée */}
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-300">
                    <ShieldCheck className="h-4 w-4" />
                    Ta réponse est scellée ({myName})
                  </span>
                  <span className="text-[10px] font-mono text-emerald-300/60">Sécurisé</span>
                </div>
                <p className="text-xs md:text-sm text-foreground/90 italic bg-black/30 p-3 rounded-xl border border-white/5">
                  &laquo; {myTodayAnswer?.answer} &raquo;
                </p>
              </div>
              <p className="text-[10px] text-emerald-300/50 font-mono mt-3">
                Scellée aujourd&apos;hui · Invisible pour {partnerName} jusqu&apos;à sa réponse.
              </p>
            </div>

            {/* Slot du partenaire verrouillé */}
            <div className="rounded-2xl border border-neon-violet/30 bg-neon-violet/5 p-5 flex flex-col items-center justify-center text-center">
              <div className="h-12 w-12 rounded-full bg-neon-violet/20 border border-neon-violet/40 flex items-center justify-center text-neon-violet mb-3 shadow-[0_0_20px_rgba(168,85,247,0.3)]">
                <Lock className="h-6 w-6 animate-pulse" />
              </div>
              <h4 className="text-xs font-bold text-foreground mb-1">
                En attente de la réponse de {partnerName}...
              </h4>
              <p className="text-[11px] text-foreground/50 max-w-xs">
                Une alerte a été envoyée sur son écran. Dès qu&apos;il/elle scelle sa réponse, le Taux de Télépathie se calcule automatiquement !
              </p>
            </div>
          </div>
        ) : (
          /* 3. LES DEUX ONT RÉPONDU -> RÉVÉLATION DOUBLE & SCORE DE TÉLÉPATHIE (EFFET WOW) */
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4"
          >
            {/* BANDEAU DU SCORE DE TÉLÉPATHIE */}
            {todayPair.score && (
              <div className="relative overflow-hidden rounded-2xl border-2 border-neon-violet/60 bg-gradient-to-r from-neon-violet/20 via-background to-neon-cyan/20 p-5 text-center shadow-[0_0_35px_rgba(168,85,247,0.35)]">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-2">
                  <span className="text-3xl">{todayPair.score.verdictEmoji}</span>
                  <div>
                    <h4 className="text-lg md:text-xl font-black text-foreground font-space tracking-tight">
                      {todayPair.score.scorePercent}% de Synchronicité
                    </h4>
                    <p className="text-xs font-bold text-neon-violet uppercase tracking-wider">
                      {todayPair.score.verdictTitle}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-foreground/80 italic max-w-lg mx-auto">
                  &laquo; {todayPair.score.commentary} &raquo;
                </p>

                {/* Jauge d'énergie quantique */}
                <div className="w-full max-w-md mx-auto h-2 rounded-full bg-white/10 overflow-hidden mt-3 p-0.5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${todayPair.score.scorePercent}%` }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className="h-full rounded-full bg-gradient-to-r from-neon-violet via-neon-cyan to-neon-rose shadow-[0_0_12px_rgba(34,211,238,0.8)]"
                  />
                </div>
              </div>
            )}

            {/* LES DEUX RÉPONSES DÉVOILÉES CÔTE À CÔTE */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Carte Arthur */}
              <div className="rounded-2xl border border-neon-cyan/30 bg-black/40 p-4 relative overflow-hidden shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-neon-cyan">
                    <FrenchFlagBadge />
                    Arthur · Paris 🇫🇷
                  </span>
                  <span className="text-[10px] font-mono text-foreground/40">
                    {new Date(todayPair.paris?.created_at || "").toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="text-xs md:text-sm text-foreground/90 italic p-3 rounded-xl bg-white/5 border border-white/5 leading-relaxed">
                  &laquo; {todayPair.paris?.answer} &raquo;
                </p>
              </div>

              {/* Carte Clara */}
              <div className="rounded-2xl border border-neon-rose/30 bg-black/40 p-4 relative overflow-hidden shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-neon-rose">
                    <UsFlagBadge />
                    Clara · Raleigh 🇺🇸
                  </span>
                  <span className="text-[10px] font-mono text-foreground/40">
                    {new Date(todayPair.raleigh?.created_at || "").toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="text-xs md:text-sm text-foreground/90 italic p-3 rounded-xl bg-white/5 border border-white/5 leading-relaxed">
                  &laquo; {todayPair.raleigh?.answer} &raquo;
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── ARCHIVE & GRAND LIVRE DES RÉPONSES DES JOURS PASSÉS ── */}
        <div className="border-t border-white/10 pt-4">
          <button
            type="button"
            onClick={() => setHistoryOpen(!historyOpen)}
            className="w-full flex items-center justify-between py-2 text-xs font-bold text-foreground/80 hover:text-foreground transition-colors"
          >
            <span className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-neon-violet" />
              <span>Le Grand Livre des Réponses · ({historyDays.length} {historyDays.length > 1 ? "jours archivés" : "jour archivé"})</span>
            </span>
            {historyOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          <AnimatePresence>
            {historyOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3 pt-3 overflow-hidden"
              >
                {historyDays.length === 0 ? (
                  <p className="text-xs text-foreground/40 text-center py-4">
                    Vos questions et réponses des jours précédents apparaîtront ici pour composer votre livre souvenir ! 🔮💖
                  </p>
                ) : (
                  historyDays.map((day) => (
                    <div
                      key={day.date}
                      className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-amber-300 flex items-center gap-1.5 capitalize">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatUsRealDate(day.date)}
                        </span>
                        {day.score && (
                          <span className="font-mono text-[10px] bg-neon-violet/20 text-neon-violet border border-neon-violet/30 px-2 py-0.5 rounded-full">
                            {day.score.scorePercent}% Synchronicité
                          </span>
                        )}
                      </div>

                      <p className="text-xs font-medium text-foreground">
                        {day.question.categoryEmoji} &laquo; {day.question.question} &raquo;
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
                        <div className="p-2 rounded-lg bg-black/30 border border-white/5">
                          <span className="font-bold text-neon-cyan block mb-0.5">Arthur 🇫🇷 :</span>
                          <p className="text-foreground/80 italic">{day.paris?.answer || "Non répondu"}</p>
                        </div>
                        <div className="p-2 rounded-lg bg-black/30 border border-white/5">
                          <span className="font-bold text-neon-rose block mb-0.5">Clara 🇺🇸 :</span>
                          <p className="text-foreground/80 italic">{day.raleigh?.answer || "Non répondu"}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.section>
  );
}
