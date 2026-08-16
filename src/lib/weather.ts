/**
 * ─────────────────────────────────────────────────────────────────────────────
 * US TOGETHER — GESTIONNAIRE MÉTÉO & ASTRONOMIE (OPEN-METEO API & MOON SYNC)
 * ─────────────────────────────────────────────────────────────────────────────
 */

export interface CityWeatherData {
  city: "Paris" | "Raleigh";
  country: string;
  flag: string;
  temp: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  weatherLabel: string;
  weatherEmoji: string;
  isDay: boolean;
  sunrise: string;
  sunset: string;
  goldenHour: string;
  skyTheme: "night" | "dawn" | "day" | "sunset";
  coupleTip: string;
}

export interface MoonPhaseData {
  phaseName: string;
  phaseEmoji: string;
  illumination: number; // 0 à 100%
  phaseIndex: number; // 0 à 7
  daysUntilFullMoon: number;
  quote: string;
}

export interface SkySyncState {
  paris: CityWeatherData;
  raleigh: CityWeatherData;
  moon: MoonPhaseData;
  tempDiff: number;
}

/** Interprétation des codes WMO Open-Meteo en français */
export function interpretWmoCode(code: number, isDay: boolean): { label: string; emoji: string } {
  switch (code) {
    case 0:
      return isDay ? { label: "Ciel parfaitement dégagé", emoji: "☀️" } : { label: "Nuit étoilée claire", emoji: "✨" };
    case 1:
    case 2:
      return isDay ? { label: "Quelques nuages légers", emoji: "🌤️" } : { label: "Nuit légèrement voilée", emoji: "🌙" };
    case 3:
      return { label: "Ciel couvert", emoji: "☁️" };
    case 45:
    case 48:
      return { label: "Brumes & Brouillard", emoji: "🌫️" };
    case 51:
    case 53:
    case 55:
      return { label: "Bruine légère", emoji: "🌦️" };
    case 61:
    case 63:
      return { label: "Pluie modérée", emoji: "🌧️" };
    case 65:
      return { label: "Forte pluie", emoji: "🌧️" };
    case 71:
    case 73:
    case 75:
      return { label: "Chutes de neige", emoji: "❄️" };
    case 80:
    case 81:
    case 82:
      return { label: "Averses passagères", emoji: "🌦️" };
    case 95:
    case 96:
    case 99:
      return { label: "Orage électrique", emoji: "⚡" };
    default:
      return { label: "Temps variable", emoji: "⛅" };
  }
}

/** Calcule l'ambiance visuelle du ciel selon l'heure et le soleil */
function getSkyTheme(isDay: boolean, currentHour: number, sunsetHour: number): "night" | "dawn" | "day" | "sunset" {
  if (!isDay) return "night";
  if (currentHour >= sunsetHour - 1.5 && currentHour <= sunsetHour + 0.5) return "sunset";
  if (currentHour >= 5 && currentHour <= 8) return "dawn";
  return "day";
}

/** Calcule la phase astronomique de la lune */
export function calculateMoonPhase(date: Date = new Date()): MoonPhaseData {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  // Algorithme astronomique de Conway
  let r = year % 100;
  r %= 19;
  if (r > 9) r -= 19;
  r = (r * 11) % 30 + month + day;
  if (month < 3) r += 2;
  const phaseValue = (r - (year < 2000 ? 4 : 8.3)) % 30;
  const normalizedPhase = (phaseValue + 30) % 30; // 0 à 29.53

  // Illumination de 0% à 100%
  const illumination = Math.round(
    ((1 - Math.cos((normalizedPhase / 29.53) * 2 * Math.PI)) / 2) * 100
  );

  let phaseName = "Pleine Lune";
  let phaseEmoji = "🌕";
  let phaseIndex = 4;

  if (normalizedPhase < 1.84) {
    phaseName = "Nouvelle Lune";
    phaseEmoji = "🌑";
    phaseIndex = 0;
  } else if (normalizedPhase < 7.38) {
    phaseName = "Premier Croissant";
    phaseEmoji = "🌒";
    phaseIndex = 1;
  } else if (normalizedPhase < 11.07) {
    phaseName = "Premier Quartier";
    phaseEmoji = "🌓";
    phaseIndex = 2;
  } else if (normalizedPhase < 14.76) {
    phaseName = "Gibbeuse Croissante";
    phaseEmoji = "🌔";
    phaseIndex = 3;
  } else if (normalizedPhase < 18.45) {
    phaseName = "Pleine Lune";
    phaseEmoji = "🌕";
    phaseIndex = 4;
  } else if (normalizedPhase < 22.14) {
    phaseName = "Gibbeuse Décroissante";
    phaseEmoji = "🌖";
    phaseIndex = 5;
  } else if (normalizedPhase < 25.84) {
    phaseName = "Dernier Quartier";
    phaseEmoji = "🌗";
    phaseIndex = 6;
  } else {
    phaseName = "Dernier Croissant";
    phaseEmoji = "🌘";
    phaseIndex = 7;
  }

  // Jours jusqu'à la prochaine pleine lune (~jour 15 du cycle)
  let daysUntilFullMoon = Math.round(14.76 - normalizedPhase);
  if (daysUntilFullMoon < 0) daysUntilFullMoon += 30;

  return {
    phaseName,
    phaseEmoji,
    illumination,
    phaseIndex,
    daysUntilFullMoon,
    quote:
      "Même si 6 fuseaux horaires et 6 500 km nous séparent, nous regardons exactement la même lune ce soir.",
  };
}

/** Conseils romantiques selon la météo et le jour/nuit */
function getCoupleTip(temp: number, code: number, city: "Paris" | "Raleigh", isDay: boolean, hour: number): string {
  if (!isDay) {
    if (city === "Paris") {
      return hour >= 23 || hour < 6
        ? "Douce nuit étoilée à Paris ✨ Repose-toi bien Arthur !"
        : "Soirée paisible sur Paris 🌙 Pense bien à Clara !";
    } else {
      return hour >= 23 || hour < 6
        ? "Douce nuit étoilée à Raleigh ✨ Fais de beaux rêves Clara !"
        : "Soirée paisible sur Raleigh 🌙 Pense bien à Arthur !";
    }
  }

  if (code >= 95) return `Orages sur ${city} ⚡ Restez bien au chaud et appelez-vous !`;
  if (code >= 51 && code <= 65) return `Temps pluvieux sur ${city} 🌧️ Idéal pour écouter votre playlist partagée.`;
  if (temp >= 28) return `Belle chaleur à ${city} ☀️ N'oublie pas de bien t'hydrater !`;
  if (temp <= 14) return `Fraîcheur à ${city} 🧣 Enfile un pull tout doux.`;
  return `Ciel agréable sur ${city} ✨ Profite bien de ta journée !`;
}

/** Données météo de secours en cas de perte de réseau */
const FALLBACK_PARIS: CityWeatherData = {
  city: "Paris",
  country: "France",
  flag: "🇫🇷",
  temp: 21,
  feelsLike: 21,
  humidity: 55,
  windSpeed: 12,
  weatherCode: 1,
  weatherLabel: "Ciel clair & nuages doux",
  weatherEmoji: "🌤️",
  isDay: true,
  sunrise: "06:45",
  sunset: "21:15",
  goldenHour: "20:30",
  skyTheme: "day",
  coupleTip: "Ciel agréable sur Paris ✨ Idéal pour une promenade !",
};

const FALLBACK_RALEIGH: CityWeatherData = {
  city: "Raleigh",
  country: "USA (Caroline du Nord)",
  flag: "🇺🇸",
  temp: 28,
  feelsLike: 30,
  humidity: 68,
  windSpeed: 8,
  weatherCode: 0,
  weatherLabel: "Grand soleil de Caroline",
  weatherEmoji: "☀️",
  isDay: true,
  sunrise: "06:35",
  sunset: "20:10",
  goldenHour: "19:25",
  skyTheme: "day",
  coupleTip: "Belle chaleur à Raleigh ☀️ N'oublie pas de t'hydrater Clara !",
};

/** Récupère la météo en direct pour Paris et Raleigh via Open-Meteo API */
export async function fetchLiveSkyData(): Promise<SkySyncState> {
  const moon = calculateMoonPhase();

  try {
    const [parisRes, raleighRes] = await Promise.all([
      fetch(
        "https://api.open-meteo.com/v1/forecast?latitude=48.8566&longitude=2.3522&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m&daily=sunrise,sunset&timezone=Europe%2FParis"
      ),
      fetch(
        "https://api.open-meteo.com/v1/forecast?latitude=35.7796&longitude=-78.6382&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m&daily=sunrise,sunset&timezone=America%2FNew_York"
      ),
    ]);

    if (!parisRes.ok || !raleighRes.ok) {
      return {
        paris: FALLBACK_PARIS,
        raleigh: FALLBACK_RALEIGH,
        moon,
        tempDiff: Math.abs(FALLBACK_PARIS.temp - FALLBACK_RALEIGH.temp),
      };
    }

    const parisData = await parisRes.json();
    const raleighData = await raleighRes.json();

    const parseCityData = (
      raw: {
        current?: {
          temperature_2m?: number;
          apparent_temperature?: number;
          relative_humidity_2m?: number;
          wind_speed_10m?: number;
          weather_code?: number;
          is_day?: number;
        };
        daily?: {
          sunrise?: string[];
          sunset?: string[];
        };
      },
      cityName: "Paris" | "Raleigh",
      flag: string,
      country: string
    ): CityWeatherData => {
      const temp = Math.round(raw.current?.temperature_2m ?? 20);
      const feelsLike = Math.round(raw.current?.apparent_temperature ?? temp);
      const humidity = Math.round(raw.current?.relative_humidity_2m ?? 50);
      const windSpeed = Math.round(raw.current?.wind_speed_10m ?? 10);
      const code = raw.current?.weather_code ?? 0;
      const isDay = raw.current?.is_day === 1;

      const { label, emoji } = interpretWmoCode(code, isDay);

      const rawSunrise = raw.daily?.sunrise?.[0] || "";
      const rawSunset = raw.daily?.sunset?.[0] || "";
      const sunrise = rawSunrise.slice(-5) || "06:30";
      const sunset = rawSunset.slice(-5) || "20:30";

      const [sunsetH, sunsetM] = sunset.split(":").map(Number);
      const goldenHourH = sunsetM >= 45 ? sunsetH : sunsetH - 1;
      const goldenHourM = (sunsetM + 15) % 60;
      const goldenHour = `${String(goldenHourH).padStart(2, "0")}:${String(goldenHourM).padStart(2, "0")}`;

      const tz = cityName === "Paris" ? "Europe/Paris" : "America/New_York";
      const cityHour = Number(
        new Date().toLocaleTimeString("en-GB", { timeZone: tz, hour: "numeric", hour12: false })
      );
      const skyTheme = getSkyTheme(isDay, cityHour, sunsetH);
      const coupleTip = getCoupleTip(temp, code, cityName, isDay, cityHour);

      return {
        city: cityName,
        country,
        flag,
        temp,
        feelsLike,
        humidity,
        windSpeed,
        weatherCode: code,
        weatherLabel: label,
        weatherEmoji: emoji,
        isDay,
        sunrise,
        sunset,
        goldenHour,
        skyTheme,
        coupleTip,
      };
    };

    const paris = parseCityData(parisData, "Paris", "🇫🇷", "France");
    const raleigh = parseCityData(raleighData, "Raleigh", "🇺🇸", "USA (Caroline du Nord)");
    const tempDiff = Math.abs(paris.temp - raleigh.temp);

    return { paris, raleigh, moon, tempDiff };
  } catch (err) {
    console.warn("Erreur fetchLiveSkyData, utilisation des données locales :", err);
    return {
      paris: FALLBACK_PARIS,
      raleigh: FALLBACK_RALEIGH,
      moon,
      tempDiff: Math.abs(FALLBACK_PARIS.temp - FALLBACK_RALEIGH.temp),
    };
  }
}
