"use client";

import { useEffect, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { isSoundMuted, setSoundMuted, playThoughtSentSound } from "@/lib/sound-fx";
import { cn } from "@/lib/utils";

export function SoundControl() {
  const [muted, setMuted] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMuted(isSoundMuted());
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const toggle = () => {
    const next = !muted;
    setSoundMuted(next);
    setMuted(next);
    if (!next) {
      // Joue un son doux pour confirmer l'activation
      playThoughtSentSound();
    }
  };

  return (
    <div className="fixed top-4 right-4 z-40">
      <button
        type="button"
        onClick={toggle}
        aria-label={muted ? "Activer les sons interactifs" : "Couper les sons interactifs"}
        title={muted ? "Activer les sons interactifs" : "Couper les sons interactifs"}
        className={cn(
          "group flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-mono backdrop-blur-xl border transition-all duration-300 shadow-lg",
          muted
            ? "border-white/10 bg-black/40 text-foreground/40 hover:text-foreground/70 hover:border-white/20"
            : "border-neon-cyan/40 bg-neon-cyan/10 text-neon-cyan shadow-[0_0_15px_rgba(34,211,238,0.2)] hover:bg-neon-cyan/20"
        )}
      >
        {muted ? (
          <>
            <VolumeX className="h-3.5 w-3.5" />
            <span className="text-[10px] hidden sm:inline">Muet</span>
          </>
        ) : (
          <>
            <Volume2 className="h-3.5 w-3.5 animate-pulse" />
            {/* 3 barres d'égaliseur animées */}
            <span className="flex items-center gap-0.5 h-2.5">
              <span className="w-0.5 bg-neon-cyan rounded-full animate-bounce [animation-delay:-0.3s] h-2.5" />
              <span className="w-0.5 bg-neon-cyan rounded-full animate-bounce [animation-delay:-0.15s] h-1.5" />
              <span className="w-0.5 bg-neon-cyan rounded-full animate-bounce h-2" />
            </span>
            <span className="text-[10px] hidden sm:inline">Audio 3D</span>
          </>
        )}
      </button>
    </div>
  );
}
