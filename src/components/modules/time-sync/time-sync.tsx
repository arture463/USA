"use client";

import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import { useClock } from "@/hooks/use-clock";
import { useWeather } from "@/hooks/use-weather";
import { LOCATIONS } from "@/lib/constants";
import { revealOnMount } from "@/lib/motion";
import { getTimeDifference } from "@/lib/time";
import { SectionHeading } from "@/components/ui/section-heading";
import { ClockCard } from "./clock-card";
import { Countdown } from "./countdown";

/**
 * MODULE 1 — TimeSync
 * Assemble : horloges Paris/Raleigh (avec météo live et phase du jour),
 * écart horaire, et compte à rebours des retrouvailles.
 */
export function TimeSync() {
  const now = useClock();
  const weather = useWeather();

  // Pendant l'hydratation : skeletons à la bonne taille (zéro layout shift)
  if (!now) {
    return (
      <section className="w-full space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="skeleton h-44" />
          <div className="skeleton h-44" />
        </div>
        <div className="skeleton h-48" />
      </section>
    );
  }

  const diff = getTimeDifference(now);
  const diffLabel = `${diff > 0 ? "+" : ""}${diff}h`;

  return (
    <motion.section {...revealOnMount} className="w-full space-y-4">
      {/* En-tête de section — même bloc que les 5 autres modules */}
      <SectionHeading
        eyebrow="Deux fuseaux"
        icon={Clock}
        title="Le même"
        titleAccent="instant"
        subtitle="Vos deux heures locales, en direct, avec la météo du moment."
        accent="violet"
      />

      {/* Les deux horloges */}
      <div className="grid gap-4 md:grid-cols-2">
        <ClockCard
          now={now}
          label={LOCATIONS.paris.label}
          country={LOCATIONS.paris.country}
          timeZone={LOCATIONS.paris.timeZone}
          weather={weather.paris}
          accent="violet"
        />
        <ClockCard
          now={now}
          label={LOCATIONS.raleigh.label}
          country={LOCATIONS.raleigh.country}
          timeZone={LOCATIONS.raleigh.timeZone}
          weather={weather.raleigh}
          accent="cyan"
        />
      </div>

      {/* Écart horaire */}
      <p className="label-micro text-center">
        Raleigh vit à{" "}
        <span className="font-semibold text-neon-cyan">{diffLabel}</span> de
        Paris
      </p>

      <Countdown now={now} />
    </motion.section>
  );
}
