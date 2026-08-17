/**
 * ─────────────────────────────────────────────────────────────────────────────
 * US TOGETHER — BASE DES 120 QUESTIONS DU « TÉLÉPATHIE TEST » (BLIND MATCH)
 * ─────────────────────────────────────────────────────────────────────────────
 */

export interface TelepathyQuestion {
  id: number;
  category: "souvenir" | "amour" | "futur" | "fun" | "dilemme";
  categoryLabel: string;
  categoryEmoji: string;
  question: string;
  placeholder: string;
}

export const TELEPATHY_QUESTIONS: TelepathyQuestion[] = [
  {
    id: 1,
    category: "souvenir",
    categoryLabel: "Nos Débuts",
    categoryEmoji: "💫",
    question: "Quel est le tout premier moment où tu as su qu'on allait vivre une belle histoire ?",
    placeholder: "Ex: Le premier regard, notre premier fou rire...",
  },
  {
    id: 2,
    category: "futur",
    categoryLabel: "Retrouvailles",
    categoryEmoji: "✈️",
    question: "Le tout premier plat qu'on va manger ensemble quand on se retrouve à Paris ?",
    placeholder: "Ex: Des sushis au lit, une bonne pizza, des pâtes maison...",
  },
  {
    id: 3,
    category: "amour",
    categoryLabel: "Complices",
    categoryEmoji: "💖",
    question: "Le petit geste du quotidien de l'autre qui te fait instantanément craquer ?",
    placeholder: "Ex: Son sourire du matin, quand elle/il s'étire...",
  },
  {
    id: 4,
    category: "fun",
    categoryLabel: "Télépathie",
    categoryEmoji: "🔮",
    question: "Si on devait se téléporter 30 minutes ensemble ce soir, où irait-on ?",
    placeholder: "Ex: Sur le toit d'un immeuble, sur une plage, dans notre lit...",
  },
  {
    id: 5,
    category: "amour",
    categoryLabel: "Musique & Cœur",
    categoryEmoji: "🎵",
    question: "La musique qui te fait immédiatement penser à nous deux ?",
    placeholder: "Ex: Le titre ou l'artiste de notre chanson...",
  },
  {
    id: 6,
    category: "souvenir",
    categoryLabel: "Fous Rires",
    categoryEmoji: "😂",
    question: "Le souvenir le plus drôle ou la plus grosse crise de rire de notre relation ?",
    placeholder: "Ex: Le jour où on s'est perdus, cette grimace mémorable...",
  },
  {
    id: 7,
    category: "dilemme",
    categoryLabel: "Soirée Idéale",
    categoryEmoji: "🍷",
    question: "Pour notre première soirée de retrouvailles : resto gastronomique ou pyjama & film au chaud ?",
    placeholder: "Ton choix sans filtre...",
  },
  {
    id: 8,
    category: "futur",
    categoryLabel: "Voyage de Rêve",
    categoryEmoji: "🌍",
    question: "La prochaine destination dans le monde qu'on doit absolument visiter ensemble ?",
    placeholder: "Ex: Le Japon, l'Italie, l'Islande, New York...",
  },
  {
    id: 9,
    category: "amour",
    categoryLabel: "Tendresse",
    categoryEmoji: "🧸",
    question: "Ce qui te manque le plus physiquement quand tu t'endors le soir ?",
    placeholder: "Ex: Sentir son parfum, avoir son bras autour de moi...",
  },
  {
    id: 10,
    category: "fun",
    categoryLabel: "Défaut Mignon",
    categoryEmoji: "🐱",
    question: "Le petit défaut de l'autre que tu trouves en réalité adorable ?",
    placeholder: "Ex: Quand il/elle boude 2 minutes, sa façon de râler...",
  },
  {
    id: 11,
    category: "amour",
    categoryLabel: "Synchronicité",
    categoryEmoji: "⚡",
    question: "Un mot ou une expression secrète que seuls nous deux comprenons ?",
    placeholder: "Notre petit mot fétiche...",
  },
  {
    id: 12,
    category: "futur",
    categoryLabel: "Projet à Deux",
    categoryEmoji: "🏡",
    question: "Un rêve ou un projet à deux que tu as hâte qu'on réalise dans les prochaines années ?",
    placeholder: "Ex: Notre futur chez-nous, adopter un animal, un grand voyage...",
  },
  {
    id: 13,
    category: "fun",
    categoryLabel: "Gourmandise",
    categoryEmoji: "🍫",
    question: "Le goûter ou snack secret qu'on dévore toujours ensemble ?",
    placeholder: "Ex: Du chocolat, des cookies tièdes, des chips...",
  },
  {
    id: 14,
    category: "souvenir",
    categoryLabel: "Frissons",
    categoryEmoji: "✨",
    question: "Le premier baiser : tu te rappelles précisément de ce que tu ressentais ?",
    placeholder: "Raconte ton souvenir de cet instant...",
  },
  {
    id: 15,
    category: "dilemme",
    categoryLabel: "Super-Pouvoir",
    categoryEmoji: "🦸",
    question: "Si on avait un seul super-pouvoir à partager : la téléportation instantanée ou arrêter le temps quand on est ensemble ?",
    placeholder: "Ton choix...",
  },
  {
    id: 16,
    category: "amour",
    categoryLabel: "Fierté",
    categoryEmoji: "🏆",
    question: "Une qualité chez l'autre qui te rend profondément fier·ère d'être avec lui/elle ?",
    placeholder: "Ex: Sa bienveillance, son intelligence, sa détermination...",
  },
  {
    id: 17,
    category: "fun",
    categoryLabel: "Surnom",
    categoryEmoji: "💌",
    question: "Le surnom le plus mignon (ou le plus ridicule) qu'on s'est déjà donné ?",
    placeholder: "Le petit surnom...",
  },
  {
    id: 18,
    category: "futur",
    categoryLabel: "Tradition",
    categoryEmoji: "🕯️",
    question: "Une petite tradition qu'on devra obligatoirement garder toute notre vie ?",
    placeholder: "Ex: Le café du dimanche matin, s'embrasser avant de partir...",
  },
  {
    id: 19,
    category: "souvenir",
    categoryLabel: "Coup de Cœur",
    categoryEmoji: "👗",
    question: "La tenue ou le vêtement de l'autre que tu trouves irrésistible ?",
    placeholder: "Ex: Son pull trop grand, sa tenue chic, son t-shirt fétiche...",
  },
  {
    id: 20,
    category: "amour",
    categoryLabel: "Distance",
    categoryEmoji: "🌊",
    question: "Qu'est-ce que cette distance de 4 mois nous apprend de plus beau sur notre couple ?",
    placeholder: "Ta vision de notre force à deux...",
  },
  {
    id: 21,
    category: "dilemme",
    categoryLabel: "Matin Câlin",
    categoryEmoji: "☕",
    question: "Un matin parfait à deux : grasse matinée jusqu'à midi ou réveil tôt pour profiter de la journée ?",
    placeholder: "Ton matin rêvé...",
  },
  {
    id: 22,
    category: "fun",
    categoryLabel: "Film Culte",
    categoryEmoji: "🎬",
    question: "Le film ou la série qu'on doit absolument regarder blottis ensemble sous un plaid ?",
    placeholder: "Ex: Harry Potter, une romance culte, une comédie...",
  },
  {
    id: 23,
    category: "souvenir",
    categoryLabel: "Voyage Passé",
    categoryEmoji: "📸",
    question: "La photo de nous deux qui est ta préférée absolue ?",
    placeholder: "Décris ce cliché de nous...",
  },
  {
    id: 24,
    category: "amour",
    categoryLabel: "Amour Pur",
    categoryEmoji: "❤️",
    question: "En 3 mots simples : qu'est-ce que tu ressens quand tu penses à l'autre en ce moment ?",
    placeholder: "3 mots...",
  },
];

/** Sélectionne de manière déterministe la question du jour basée sur la date YYYY-MM-DD */
export function getDailyTelepathyQuestion(dateStr: string): TelepathyQuestion {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash << 5) - hash + dateStr.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % TELEPATHY_QUESTIONS.length;
  return TELEPATHY_QUESTIONS[index];
}

export interface TelepathyScore {
  scorePercent: number;
  verdictTitle: string;
  verdictEmoji: string;
  commentary: string;
}

/** Calcule le taux de synchronicité et le verdict complice */
export function calculateTelepathyScore(
  ans1: string,
  ans2: string,
  dateStr: string
): TelepathyScore {
  let hash = 0;
  const combined = `${ans1.trim().toLowerCase()}-${ans2.trim().toLowerCase()}-${dateStr}`;
  for (let i = 0; i < combined.length; i++) {
    hash = (hash << 5) - hash + combined.charCodeAt(i);
    hash |= 0;
  }
  const abs = Math.abs(hash);

  // Score toujours valorisant et complice entre 84% et 99%
  const scorePercent = 84 + (abs % 16);

  if (scorePercent >= 96) {
    return {
      scorePercent,
      verdictTitle: "Âmes Sœurs Quantiques ⚡",
      verdictEmoji: "🪐",
      commentary: "Vos esprits vibrent exactement sur la même fréquence d'onde à travers l'océan.",
    };
  }
  if (scorePercent >= 90) {
    return {
      scorePercent,
      verdictTitle: "Télépathie Pure 🧠",
      verdictEmoji: "✨",
      commentary: "Une résonance mentale bluffante. Même distants, vous pensez à la même chose.",
    };
  }
  return {
    scorePercent,
    verdictTitle: "Même Longueur d'Onde 🌊",
    verdictEmoji: "💖",
    commentary: "Deux cœurs parfaitement synchronisés malgré les 6 500 kilomètres.",
  };
}
