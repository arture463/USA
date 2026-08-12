"use client";

import { useEffect, useState } from "react";
import { LOCATIONS } from "@/lib/constants";

/**
 * Météo live des deux villes via Open-Meteo (gratuit, sans clé API).
 * UNE seule requête pour Paris + Raleigh (l'API accepte des coordonnées
 * multiples), rafraîchie toutes les 15 minutes.
 */

export interface CityWeather {
  /** Température en °C, arrondie */
  tempC: number;
  /** Code météo WMO (0 = ciel clair, 61 = pluie, etc.) */
  code: number;
  /** Vrai s'il fait jour sur place selon l'API */
  isDay: boolean;
}

export interface WeatherState {
  paris: CityWeather | null;
  raleigh: CityWeather | null;
}

/** Forme de la réponse Open-Meteo (sous-ensemble utilisé) */
interface OpenMeteoCurrent {
  current: {
    temperature_2m: number;
    weather_code: number;
    is_day: 0 | 1;
  };
}

const REFRESH_MS = 15 * 60 * 1000; // 15 minutes

const API_URL =
  "https://api.open-meteo.com/v1/forecast" +
  `?latitude=${LOCATIONS.paris.lat},${LOCATIONS.raleigh.lat}` +
  `&longitude=${LOCATIONS.paris.lng},${LOCATIONS.raleigh.lng}` +
  "&current=temperature_2m,weather_code,is_day";

export function useWeather(): WeatherState {
  const [weather, setWeather] = useState<WeatherState>({
    paris: null,
    raleigh: null,
  });

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch(API_URL);
        if (!res.ok) return; // échec silencieux : la météo est un bonus
        // Coordonnées multiples → l'API renvoie un tableau [paris, raleigh]
        const data = (await res.json()) as OpenMeteoCurrent[];
        if (cancelled || !Array.isArray(data) || data.length < 2) return;

        const toCity = (d: OpenMeteoCurrent): CityWeather => ({
          tempC: Math.round(d.current.temperature_2m),
          code: d.current.weather_code,
          isDay: d.current.is_day === 1,
        });

        setWeather({ paris: toCity(data[0]), raleigh: toCity(data[1]) });
      } catch {
        // Réseau indisponible → on garde l'état précédent, pas d'erreur UI
      }
    };

    load();
    const id = setInterval(load, REFRESH_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return weather;
}

/* ────────────────────────────────────────────────
 * Mapping code météo WMO → icône Lucide + libellé FR
 * ──────────────────────────────────────────────── */

export type WeatherIcon =
  | "Sun"
  | "Moon"
  | "CloudSun"
  | "CloudMoon"
  | "Cloud"
  | "CloudFog"
  | "CloudDrizzle"
  | "CloudRain"
  | "CloudSnow"
  | "CloudLightning";

export function describeWeather(
  code: number,
  isDay: boolean
): { icon: WeatherIcon; label: string } {
  if (code === 0) {
    return isDay
      ? { icon: "Sun", label: "Ciel dégagé" }
      : { icon: "Moon", label: "Nuit claire" };
  }
  if (code <= 2) {
    return isDay
      ? { icon: "CloudSun", label: "Éclaircies" }
      : { icon: "CloudMoon", label: "Peu nuageux" };
  }
  if (code === 3) return { icon: "Cloud", label: "Couvert" };
  if (code === 45 || code === 48) return { icon: "CloudFog", label: "Brouillard" };
  if (code >= 51 && code <= 57) return { icon: "CloudDrizzle", label: "Bruine" };
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82))
    return { icon: "CloudRain", label: "Pluie" };
  if ((code >= 71 && code <= 77) || code === 85 || code === 86)
    return { icon: "CloudSnow", label: "Neige" };
  if (code >= 95) return { icon: "CloudLightning", label: "Orage" };
  return { icon: "Cloud", label: "Nuageux" };
}
