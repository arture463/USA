"use client";

import { motion } from "framer-motion";
import {
  MoonStar,
  Sunrise,
  Sunset,
  Sparkles,
  RefreshCw,
  Wind,
  Droplets,
  Thermometer,
  Heart,
  PhoneCall,
} from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { useSkySync } from "@/hooks/use-sky-sync";
import { revealOnScroll } from "@/lib/motion";
import type { CityWeatherData } from "@/lib/weather";

function FlagIcon({ city }: { city: "Paris" | "Raleigh" }) {
  if (city === "Paris") {
    // Drapeau France
    return (
      <span
        aria-label="Drapeau Français"
        className="inline-flex h-4 w-6 shrink-0 overflow-hidden rounded-[3px] border border-white/20 shadow-sm"
      >
        <span className="w-1/3 bg-[#002654]" />
        <span className="w-1/3 bg-white" />
        <span className="w-1/3 bg-[#CE1126]" />
      </span>
    );
  }

  // Drapeau USA
  return (
    <span
      aria-label="Drapeau Américain"
      className="relative inline-flex h-4 w-6 shrink-0 overflow-hidden rounded-[3px] border border-white/20 bg-[#B22234] shadow-sm"
    >
      <span className="absolute inset-x-0 top-[25%] h-[25%] bg-white" />
      <span className="absolute inset-x-0 top-[75%] h-[25%] bg-white" />
      <span className="absolute top-0 left-0 flex h-[60%] w-[45%] items-center justify-center bg-[#3C3B6E] text-[6px] text-white">
        ★
      </span>
    </span>
  );
}

function CitySkyCard({
  weather,
  whoLabel,
  colorAccent,
}: {
  weather: CityWeatherData;
  whoLabel: string;
  colorAccent: "cyan" | "rose";
}) {
  const isCyan = colorAccent === "cyan";
  const borderClass = isCyan
    ? "border-neon-cyan/30 shadow-[0_0_25px_rgba(34,211,238,0.15)]"
    : "border-neon-rose/30 shadow-[0_0_25px_rgba(244,114,182,0.15)]";
  const badgeClass = isCyan
    ? "bg-neon-cyan/15 text-neon-cyan border-neon-cyan/30"
    : "bg-neon-rose/15 text-neon-rose border-neon-rose/30";

  return (
    <div className={`relative overflow-hidden rounded-2xl border bg-black/40 p-5 backdrop-blur-xl transition-all ${borderClass}`}>
      {/* Halo d'ambiance selon le ciel */}
      <div
        className={`absolute -top-16 -right-16 h-44 w-44 rounded-full blur-3xl opacity-20 pointer-events-none ${
          weather.skyTheme === "sunset"
            ? "bg-amber-500"
            : weather.isDay
              ? isCyan
                ? "bg-cyan-400"
                : "bg-rose-400"
              : "bg-indigo-600"
        }`}
      />

      {/* En-tête Ville */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <FlagIcon city={weather.city} />
          <div>
            <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <span>{weather.city}</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${badgeClass}`}>
                {whoLabel}
              </span>
            </h4>
            <p className="text-[11px] text-foreground/50">{weather.country}</p>
          </div>
        </div>

        <span className="text-3xl filter drop-shadow">{weather.weatherEmoji}</span>
      </div>

      {/* Température & Ressenti */}
      <div className="flex items-baseline gap-3 mb-2">
        <span className="text-4xl font-black font-space tracking-tight text-foreground">
          {weather.temp}°C
        </span>
        <span className="text-xs text-foreground/60 font-mono">
          Ressenti {weather.feelsLike}°C
        </span>
      </div>

      <p className="text-xs font-semibold text-foreground/90 mb-4 flex items-center gap-1.5">
        <span>{weather.weatherLabel}</span>
      </p>

      {/* Métriques Célestes (Lever, Coucher, Golden Hour) */}
      <div className="grid grid-cols-3 gap-2 py-3 px-2.5 rounded-xl bg-white/5 border border-white/10 text-center mb-4">
        <div>
          <div className="flex items-center justify-center gap-1 text-[10px] text-foreground/50 mb-0.5">
            <Sunrise className="h-3 w-3 text-amber-400" />
            <span>Lever</span>
          </div>
          <p className="text-xs font-mono font-bold text-foreground">{weather.sunrise}</p>
        </div>

        <div>
          <div className="flex items-center justify-center gap-1 text-[10px] text-amber-300 font-semibold mb-0.5">
            <Sparkles className="h-3 w-3 text-amber-300 animate-pulse" />
            <span>Golden</span>
          </div>
          <p className="text-xs font-mono font-bold text-amber-300">{weather.goldenHour}</p>
        </div>

        <div>
          <div className="flex items-center justify-center gap-1 text-[10px] text-neon-rose mb-0.5">
            <Sunset className="h-3 w-3 text-neon-rose" />
            <span>Coucher</span>
          </div>
          <p className="text-xs font-mono font-bold text-foreground">{weather.sunset}</p>
        </div>
      </div>

      {/* Vent & Humidité */}
      <div className="flex items-center justify-between text-[11px] font-mono text-foreground/60 px-1 mb-3">
        <span className="flex items-center gap-1">
          <Droplets className="h-3 w-3 text-neon-cyan" />
          Humidité : {weather.humidity}%
        </span>
        <span className="flex items-center gap-1">
          <Wind className="h-3 w-3 text-foreground/50" />
          Vent : {weather.windSpeed} km/h
        </span>
      </div>

      {/* Conseil d'Amour Personnalisé */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-xs text-foreground/80 flex items-start gap-2">
        <Heart className="h-3.5 w-3.5 shrink-0 mt-0.5 text-neon-rose fill-neon-rose/20" />
        <p className="text-[11px] leading-relaxed italic">{weather.coupleTip}</p>
      </div>
    </div>
  );
}

export function SkySync() {
  const { data, loading, refreshing, refresh } = useSkySync();

  return (
    <motion.section {...revealOnScroll} className="w-full">
      {/* ── EN-TÊTE DU MODULE ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
        <SectionHeading
          eyebrow="Atmosphère & Ciel Partagé 🌙"
          icon={MoonStar}
          title="Météo du Cœur :"
          titleAccent="Sous la Même Lune"
          subtitle="Température en direct, heure dorée pour vos appels et phase de la lune partagée au-dessus de l'Atlantique."
          accent="violet"
          className="mb-0"
        />

        <button
          type="button"
          onClick={refresh}
          disabled={refreshing}
          className="btn-ghost btn-xs gap-1.5 self-start sm:self-center border-white/10 text-foreground/70 hover:text-foreground"
          title="Actualiser la météo en direct"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin text-neon-cyan" : ""}`} />
          <span>{refreshing ? "Actualisation..." : "En direct 📡"}</span>
        </button>
      </div>

      <div className="panel-roomy relative overflow-hidden space-y-6">
        {/* ── CARTE CENTRALE HOLOGRAPHIQUE DE LA LUNE ── */}
        {data?.moon && (
          <div className="relative overflow-hidden rounded-2xl border border-neon-violet/40 bg-gradient-to-b from-neon-violet/15 via-background/90 to-background/95 p-6 text-center shadow-[0_0_35px_rgba(168,85,247,0.2)] backdrop-blur-2xl">
            {/* Étoiles d'arrière-plan */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/30 via-transparent to-transparent pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center max-w-xl mx-auto">
              {/* Lueur de la lune */}
              <div className="relative mb-3">
                <div className="absolute inset-0 rounded-full bg-neon-violet/30 blur-2xl animate-pulse" />
                <span className="relative text-6xl filter drop-shadow-[0_0_20px_rgba(234,179,8,0.5)]">
                  {data.moon.phaseEmoji}
                </span>
              </div>

              <div className="flex items-center gap-2 mb-2">
                <span className="rounded-full bg-neon-violet/20 border border-neon-violet/30 px-3 py-0.5 text-xs font-bold text-neon-violet font-space">
                  {data.moon.phaseName}
                </span>
                <span className="text-xs font-mono text-foreground/60">
                  {data.moon.illumination}% éclairée
                </span>
              </div>

              {/* La Citation Poétique Cœur */}
              <blockquote className="my-3 text-sm md:text-base font-medium text-foreground italic drop-shadow-sm max-w-lg leading-relaxed">
                « {data.moon.quote} »
              </blockquote>

              <div className="flex items-center gap-4 text-[11px] font-mono text-foreground/50 mt-1">
                <span>
                  Prochaine Pleine Lune dans{" "}
                  <strong className="text-neon-cyan">{data.moon.daysUntilFullMoon} {data.moon.daysUntilFullMoon > 1 ? "jours" : "jour"}</strong>
                </span>
                <span>·</span>
                <span>Distance Paris ↔ Raleigh : <strong className="text-neon-rose">6 580 km</strong></span>
              </div>
            </div>
          </div>
        )}

        {/* ── DOUBLE VUE MÉTÉOROLOGIQUE (PARIS 🇫🇷 VS RALEIGH 🇺🇸) ── */}
        {data ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CitySkyCard
              weather={data.paris}
              whoLabel="Arthur"
              colorAccent="cyan"
            />
            <CitySkyCard
              weather={data.raleigh}
              whoLabel="Clara"
              colorAccent="rose"
            />
          </div>
        ) : (
          <div className="py-12 text-center text-xs text-foreground/50">
            Connexion aux stations météorologiques de Paris et Raleigh en cours...
          </div>
        )}

        {/* ── BANDEAU COMPARATIF THERMIQUE & CRÉNEAU FACETIME ── */}
        {data && (
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 p-3.5 text-xs">
              <div className="flex items-center gap-2 text-foreground/80">
                <Thermometer className="h-4 w-4 text-amber-400" />
                <span>
                  Écart thermique actuel :{" "}
                  <strong className="text-amber-300 font-mono">{data.tempDiff}°C</strong> entre vos deux ciels.
                </span>
              </div>

              <div className="flex items-center gap-2 text-[11px] font-mono text-foreground/70">
                <Sparkles className="h-3.5 w-3.5 text-amber-300 animate-pulse" />
                <span>
                  Heures Dorées : <strong className="text-amber-200">Paris {data.paris.goldenHour}</strong> · <strong className="text-amber-200">Raleigh {data.raleigh.goldenHour}</strong>
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-neon-cyan/25 bg-neon-cyan/5 px-3.5 py-2.5 text-xs text-neon-cyan/95">
              <span className="flex items-center gap-2">
                <PhoneCall className="h-3.5 w-3.5 text-neon-cyan" />
                <span><strong>Créneau d&apos;éveil commun (Appels FaceTime)</strong> : 14h00 – 23h30 (Paris) · 08h00 – 17h30 (Raleigh)</span>
              </span>
              <span className="text-[11px] font-mono text-foreground/50">6h de décalage</span>
            </div>
          </div>
        )}
      </div>
    </motion.section>
  );
}
