"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Clock, Globe2, Radio, Mail, Egg, BookHeart, Music2, Dumbbell, HeartHandshake, Camera, MoonStar } from "lucide-react";
import { cn } from "@/lib/utils";

import { useIdentity } from "@/hooks/use-identity";
import { usePresence } from "@/hooks/use-presence";

/**
 * Dock de navigation flottant (bas d'écran).
 *  - défilement doux vers chaque section au clic
 *  - "scroll-spy" : la section visible est mise en avant (IntersectionObserver)
 *  - l'indicateur actif GLISSE d'une icône à l'autre (layoutId Framer Motion)
 *  - Sélecteur rapide d'identité (Arthur 🇫🇷 ↔ Clara 🇺🇸)
 *
 * Les `id` doivent correspondre aux <section id="..."> de la page.
 */

const ITEMS = [
  { id: "time", label: "Heure", Icon: Clock },
  { id: "globe", label: "Globe", Icon: Globe2 },
  { id: "sky", label: "Ciel", Icon: MoonStar },
  { id: "signal", label: "Signal", Icon: Radio },
  { id: "us-real", label: "US Real", Icon: Camera },
  { id: "letters", label: "Lettres", Icon: Mail },
  { id: "bucket", label: "Envies", Icon: HeartHandshake },
  { id: "pet", label: "Bestiole", Icon: Egg },
  { id: "journal", label: "Journal", Icon: BookHeart },
  { id: "gym", label: "Gym", Icon: Dumbbell },
  { id: "music", label: "Musique", Icon: Music2 },
] as const;

export function NavDock() {
  const [active, setActive] = useState<string>(ITEMS[0].id);
  const { identity, setIdentity } = useIdentity();
  const { otherOnline, lastSeenFormatted } = usePresence(identity);
  const otherName = identity === "paris" ? "Clara 🇺🇸" : "Arthur 🇫🇷";

  useEffect(() => {
    // Une section est "active" quand elle occupe la bande centrale de l'écran
    const observer = new IntersectionObserver(
      (obsEntries) => {
        obsEntries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );

    ITEMS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const goTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

  return (
    // Wrapper = positionnement/centrage. Le conteneur est visible d'emblée
    // (pas d'animation d'entrée sur la visibilité) ; l'effet fluide vit dans
    // la pastille active qui glisse (layoutId) ci-dessous.
    <div className="fixed bottom-4 left-1/2 z-40 -translate-x-1/2 duration-500 animate-in fade-in slide-in-from-bottom-4 max-w-[98vw] px-1">
      <nav className="glass-floating flex items-center gap-1 rounded-full px-2 py-1.5 max-w-[96vw] overflow-x-auto no-scrollbar scroll-smooth">
        {ITEMS.map(({ id, label, Icon }) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => goTo(id)}
            aria-label={label}
            aria-current={isActive}
            className={cn(
              "focus-ring relative flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-medium transition-colors sm:px-3.5 sm:py-2",
              isActive
                ? "text-white"
                : "text-foreground/50 hover:text-foreground/80"
            )}
          >
            {/* Pastille active qui glisse d'un item à l'autre */}
            {isActive && (
              <motion.span
                layoutId="nav-active-pill"
                className="absolute inset-0 rounded-full bg-gradient-to-r from-neon-violet/30 to-neon-cyan/25 ring-1 ring-white/15"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
              <Icon className="relative h-4 w-4 shrink-0" />
              {/* Libellé masqué sur mobile pour rester compact */}
              <span className="relative hidden md:inline">{label}</span>
            </button>
          );
        })}

        {/* Statut de présence de l'autre + Bouton d'identité */}
        <div className="ml-1 flex items-center gap-1.5 border-l border-white/10 pl-1.5">
          {/* Badge statut de l'autre */}
          <div
            className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-mono text-foreground/80 cursor-default"
            title={otherOnline ? `${otherName} est en ligne` : `${otherName} · Dernier passage: ${lastSeenFormatted}`}
          >
            {otherOnline ? (
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
            ) : (
              <span className="h-2 w-2 rounded-full bg-slate-500" />
            )}
            <span className="hidden md:inline font-sans font-medium text-[11px]">
              {otherOnline ? `${otherName} en ligne 🟢` : lastSeenFormatted}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIdentity(identity === "paris" ? "raleigh" : "paris")}
            className="focus-ring relative flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1.5 text-xs font-semibold transition-all hover:bg-white/20 border border-white/15 shadow-sm"
            title="Changer d'identité (Arthur / Clara)"
          >
            <span>{identity === "paris" ? "🇫🇷 Arthur" : "🇺🇸 Clara"}</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
