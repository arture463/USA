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
import { BucketList } from "@/components/modules/bucket-list/bucket-list";
import { MusicPlayer } from "@/components/modules/music/music-player";
import { ThinkingOfYou } from "@/components/modules/thinking-of-you/thinking-of-you";
import { Journal } from "@/components/modules/journal/journal";
import { Pet } from "@/components/modules/pet/pet";
import { Gym } from "@/components/modules/gym/gym";
import { InstallPwa } from "@/components/ui/install-pwa";
import { ModuleErrorBoundary } from "@/components/ui/error-boundary";

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

      {/* Bannière PWA mobile */}
      <InstallPwa />

      {/* pb-28 : de l'espace pour ne pas passer sous le dock */}
      <main className="mx-auto flex min-h-dvh w-full max-w-4xl flex-col items-center gap-20 px-4 py-16 pb-28">
        {/* ── HERO ── */}
        <ModuleErrorBoundary fallbackTitle="En-tête indisponible">
          <Hero />
        </ModuleErrorBoundary>

        {/* ── MODULE 1 : TIME SYNC ── */}
        <section id="time" className="w-full scroll-mt-24">
          <ModuleErrorBoundary fallbackTitle="Module Heure indisponible">
            <TimeSync />
          </ModuleErrorBoundary>
        </section>

        {/* ── MODULE 2 : GLOBE 3D ── */}
        <section id="globe" className="w-full scroll-mt-24">
          <ModuleErrorBoundary fallbackTitle="Module Globe 3D indisponible">
            <Globe />
          </ModuleErrorBoundary>
        </section>

        {/* ── MODULE 3 : THINKING OF YOU ── */}
        <section id="signal" className="w-full scroll-mt-24">
          <ModuleErrorBoundary fallbackTitle="Module Signal indisponible">
            <ThinkingOfYou />
          </ModuleErrorBoundary>
        </section>

        {/* ── MODULE 4 : OPEN WHEN... ── */}
        <section id="letters" className="w-full scroll-mt-24">
          <ModuleErrorBoundary fallbackTitle="Module Lettres indisponible">
            <OpenWhen />
          </ModuleErrorBoundary>
        </section>

        {/* ── MODULE 9 : BUCKET LIST ── */}
        <section id="bucket" className="w-full scroll-mt-24">
          <ModuleErrorBoundary fallbackTitle="Module Envies indisponible">
            <BucketList />
          </ModuleErrorBoundary>
        </section>

        {/* ── MODULE 7 : LA CRÉATURE PARTAGÉE ── */}
        <section id="pet" className="w-full scroll-mt-24">
          <ModuleErrorBoundary fallbackTitle="Module Créature indisponible">
            <Pet />
          </ModuleErrorBoundary>
        </section>

        {/* ── MODULE 5 : JOURNAL ── */}
        <section id="journal" className="w-full scroll-mt-24">
          <ModuleErrorBoundary fallbackTitle="Module Journal indisponible">
            <Journal />
          </ModuleErrorBoundary>
        </section>

        {/* ── MODULE 8 : GYM RPG ── */}
        <section id="gym" className="w-full scroll-mt-24">
          <ModuleErrorBoundary fallbackTitle="Module Gym RPG indisponible">
            <Gym />
          </ModuleErrorBoundary>
        </section>

        {/* ── MODULE 6 : MUSIC PLAYER ── */}
        <section id="music" className="w-full scroll-mt-24">
          <ModuleErrorBoundary fallbackTitle="Module Musique indisponible">
            <MusicPlayer />
          </ModuleErrorBoundary>
        </section>

        {/* ── Signature ── */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
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
