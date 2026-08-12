"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { BackgroundFX } from "@/components/layout/background-fx";
import { CursorGlow } from "@/components/fx/cursor-glow";
import { IntroLoader } from "@/components/layout/intro-loader";
import { Hero } from "@/components/layout/hero";
import { NavDock } from "@/components/layout/nav-dock";
import { Globe } from "@/components/modules/globe/globe";
import { TimeSync } from "@/components/modules/time-sync/time-sync";
import { OpenWhen } from "@/components/modules/open-when/open-when";
import { MusicPlayer } from "@/components/modules/music/music-player";
import { ThinkingOfYou } from "@/components/modules/thinking-of-you/thinking-of-you";
import { Journal } from "@/components/modules/journal/journal";
import { Pet } from "@/components/modules/pet/pet";

/**
 * Page d'accueil — assemblage de tous les modules.
 * Chaque <section id> est une cible de la navigation (NavDock).
 * `scroll-mt-24` laisse de l'air sous le haut d'écran au défilement.
 */
export default function Home() {
  return (
    <>
      {/* Intro cinématique (1re visite de la session) */}
      <IntroLoader />

      {/* Couche d'ambiance : étoiles + aurora + grille sci-fi */}
      <BackgroundFX />

      {/* Spotlight qui suit le curseur (desktop) */}
      <CursorGlow />

      {/* Navigation flottante */}
      <NavDock />

      {/* pb-28 : de l'espace pour ne pas passer sous le dock */}
      <main className="mx-auto flex min-h-dvh w-full max-w-4xl flex-col items-center gap-20 px-4 py-16 pb-28">
        {/* ── HERO ── */}
        <Hero />

        {/* ── MODULE 1 : TIME SYNC ── */}
        <section id="time" className="w-full scroll-mt-24">
          <TimeSync />
        </section>

        {/* ── MODULE 2 : GLOBE 3D ── */}
        <section id="globe" className="w-full scroll-mt-24">
          <Globe />
        </section>

        {/* ── MODULE 3 : THINKING OF YOU ── */}
        <section id="signal" className="w-full scroll-mt-24">
          <ThinkingOfYou />
        </section>

        {/* ── MODULE 4 : OPEN WHEN... ── */}
        <section id="letters" className="w-full scroll-mt-24">
          <OpenWhen />
        </section>

        {/* ── MODULE 7 : LA CRÉATURE PARTAGÉE ── */}
        <section id="pet" className="w-full scroll-mt-24">
          <Pet />
        </section>

        {/* ── MODULE 5 : JOURNAL ── */}
        <section id="journal" className="w-full scroll-mt-24">
          <Journal />
        </section>

        {/* ── MODULE 6 : MUSIC PLAYER ── */}
        <section id="music" className="w-full scroll-mt-24">
          <MusicPlayer />
        </section>

        {/* ── Signature ── */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="label-micro flex items-center gap-2"
        >
          <Sparkles className="h-3 w-3" />
          4 mois · 1 fuseau de retard · 0 doute
        </motion.p>
      </main>
    </>
  );
}
