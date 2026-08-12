import type { Config } from "tailwindcss";

/**
 * ────────────────────────────────────────────────────────────────
 * DESIGN SYSTEM — "Us, across the ocean"
 * Ambiance : Sci-Fi / Futuriste, Dark mode, Glassmorphism, néons.
 *
 * Compatible :
 *  - shadcn/ui (variables CSS hsl(var(--x)) définies dans globals.css)
 *  - Aceternity UI / Magic UI (Tailwind v3 + tailwindcss-animate)
 * ────────────────────────────────────────────────────────────────
 */
const config: Config = {
  // Dark mode piloté par la classe .dark (on force le dark sur <html>)
  darkMode: "class",

  // Chemins scannés par Tailwind (projet en src/)
  content: [
    "./src/pages/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],

  theme: {
    // Container centré (utile pour les sections)
    container: {
      center: true,
      padding: "1.5rem",
      screens: { "2xl": "1400px" },
    },

    extend: {
      // ── Polices (branchées sur next/font via variables CSS) ──
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-space-grotesk)", "var(--font-inter)", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "ui-monospace", "monospace"],
      },

      // ── Couleurs shadcn (variables) + palette néon dédiée ──
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // ── Néons de la DA (utilisables : text-neon-violet, bg-neon-cyan…) ──
        neon: {
          violet: "hsl(var(--neon-violet))",
          cyan: "hsl(var(--neon-cyan))",
          rose: "hsl(var(--neon-rose))",
          // Vert "présence live" (avant : emerald-400 en dur)
          mint: "hsl(var(--neon-mint))",
        },
      },

      // ── Échelle de rayons (3 crans + les alias shadcn) ──
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        /** Cartes et panneaux (1.5rem) */
        card: "var(--radius-card)",
        /** Éléments imbriqués : champs, vignettes (0.75rem) */
        inner: "var(--radius-inner)",
      },

      // ── Traque : 2 rôles canoniques (surtitre / légende HUD) ──
      letterSpacing: {
        eyebrow: "var(--tracking-eyebrow)",
        micro: "var(--tracking-micro)",
      },

      // ── Courbe d'accélération unique de la DA ──
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.22, 1, 0.36, 1)",
      },

      // ── Lueurs néon réutilisables (fin des shadow-[...] en dur) ──
      boxShadow: {
        "glow-violet": "0 0 36px -6px hsl(var(--neon-violet) / 0.45)",
        "glow-cyan": "0 0 36px -6px hsl(var(--neon-cyan) / 0.45)",
        "glow-rose": "0 0 50px -6px hsl(var(--neon-rose) / 0.8)",
      },

      // ── Keyframes pour les FX néon / HUD ──
      keyframes: {
        // Utilisé par tailwindcss-animate & shadcn (accordion, etc.)
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        // Halo néon qui "respire"
        "pulse-glow": {
          "0%, 100%": { opacity: "0.6", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.05)" },
        },
        // Déplacement lent d'un dégradé (aurora de fond)
        "aurora-shift": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        // Onde de choc (Module 3 "Thinking of You")
        shockwave: {
          "0%": { transform: "scale(0)", opacity: "0.8" },
          "100%": { transform: "scale(4)", opacity: "0" },
        },
        // Léger flottement (cartes, éléments 3D UI)
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        // Dérive lente des nappes aurora (rotation + translation)
        "aurora-drift": {
          "0%, 100%": { transform: "translate(0, 0) rotate(0deg) scale(1)" },
          "33%": { transform: "translate(6%, 8%) rotate(40deg) scale(1.15)" },
          "66%": { transform: "translate(-4%, 4%) rotate(-30deg) scale(0.95)" },
        },
        "aurora-drift-reverse": {
          "0%, 100%": { transform: "translate(0, 0) rotate(0deg) scale(1)" },
          "33%": { transform: "translate(-6%, -6%) rotate(-45deg) scale(1.1)" },
          "66%": { transform: "translate(5%, -3%) rotate(35deg) scale(0.9)" },
        },
        // Ondulation du dégradé sur le titre du hero
        "text-shimmer": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        // Rebond doux (indicateur de scroll)
        "scroll-cue": {
          "0%, 100%": { transform: "translateY(0)", opacity: "0.4" },
          "50%": { transform: "translateY(6px)", opacity: "1" },
        },
      },

      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
        "aurora-shift": "aurora-shift 12s ease infinite",
        shockwave: "shockwave 1s ease-out forwards",
        float: "float 6s ease-in-out infinite",
        "aurora-drift": "aurora-drift 22s ease-in-out infinite",
        "aurora-drift-reverse": "aurora-drift-reverse 26s ease-in-out infinite",
        "text-shimmer": "text-shimmer 8s ease-in-out infinite",
        "scroll-cue": "scroll-cue 1.8s ease-in-out infinite",
      },
    },
  },

  // Plugin requis par shadcn/ui, Aceternity & Magic UI
  plugins: [require("tailwindcss-animate")],
};

export default config;
