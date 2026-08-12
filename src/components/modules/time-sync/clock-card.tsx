"use client";

import {
  Sun,
  Moon,
  Sunrise,
  Sunset,
  CloudSun,
  CloudMoon,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  CloudSnow,
  CloudLightning,
  type LucideIcon,
} from "lucide-react";
import {
  formatTime,
  formatDate,
  getHourInZone,
  getDayPhase,
  PHASE_META,
} from "@/lib/time";
import { describeWeather, type CityWeather } from "@/hooks/use-weather";
import { cn } from "@/lib/utils";

/**
 * Carte horloge d'une ville : heure live, date, indicateur jour/nuit
 * dynamique (halo coloré qui suit la phase du jour) et météo locale.
 */

// Registre string → composant (les métadonnées ne stockent que des noms)
const ICONS: Record<string, LucideIcon> = {
  Sun,
  Moon,
  Sunrise,
  Sunset,
  CloudSun,
  CloudMoon,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  CloudSnow,
  CloudLightning,
};

interface ClockCardProps {
  now: Date;
  label: string;
  country: string;
  timeZone: string;
  weather: CityWeather | null;
  accent: "violet" | "cyan";
}

export function ClockCard({
  now,
  label,
  country,
  timeZone,
  weather,
  accent,
}: ClockCardProps) {
  const hour = getHourInZone(now, timeZone);
  const phase = getDayPhase(hour);
  const meta = PHASE_META[phase];
  const PhaseIcon = ICONS[meta.icon];

  const wx = weather ? describeWeather(weather.code, weather.isDay) : null;
  const WxIcon = wx ? ICONS[wx.icon] : null;

  const accentText =
    accent === "violet" ? "text-neon-violet" : "text-neon-cyan";

  return (
    <div className="panel relative overflow-hidden">
      {/* Halo d'ambiance qui change avec la phase du jour */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-gradient-to-br blur-2xl transition-all duration-1000",
          meta.gradient
        )}
      />

      {/* En-tête : ville + indicateur de phase */}
      <div className="relative flex items-start justify-between gap-2">
        <div>
          <h3 className={cn("font-display text-lg font-semibold", accentText)}>
            {label}
          </h3>
          <p className="text-xs text-foreground/50">{country}</p>
        </div>
        <div className="chip-text">
          <PhaseIcon className={cn("h-3.5 w-3.5", accentText)} />
          {meta.label}
        </div>
      </div>

      {/* Heure live — `.numeral` = mono + tabular-nums (chiffres stables) */}
      <p className="numeral text-glow relative mt-5 text-4xl sm:text-5xl">
        {formatTime(now, timeZone)}
      </p>

      {/* Date + météo */}
      <div className="relative mt-2 flex items-center justify-between gap-2">
        <p className="text-sm capitalize text-foreground/50">
          {formatDate(now, timeZone)}
        </p>
        {wx && WxIcon && weather && (
          <p className="flex items-center gap-1.5 text-sm text-foreground/70">
            <WxIcon className={cn("h-4 w-4", accentText)} />
            <span className="font-mono font-semibold">{weather.tempC}°C</span>
            <span className="hidden text-foreground/50 sm:inline">
              · {wx.label}
            </span>
          </p>
        )}
      </div>
    </div>
  );
}
