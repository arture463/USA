"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Heart } from "lucide-react";

/**
 * Onde de choc plein écran, déclenchée quand l'autre pense à toi.
 * `burst` est un compteur : à chaque incrément, l'animation rejoue.
 *
 * Composition : 3 anneaux concentriques qui se propagent + un cœur qui
 * pulse au centre + un flash doux + un halo néon sur les bords d'écran.
 */

interface ShockwaveProps {
  burst: number;
}

const RING_COLORS = [
  "hsl(330 90% 68%)", // rose
  "hsl(265 90% 65%)", // violet
  "hsl(190 95% 60%)", // cyan
];

export function Shockwave({ burst }: ShockwaveProps) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (burst === 0) return;
    setActive(true);
    const id = setTimeout(() => setActive(false), 2600);
    return () => clearTimeout(id);
  }, [burst]);

  return (
    <AnimatePresence>
      {active && (
        // `key={burst}` : re-déclenche proprement si une pensée arrive pendant l'anim
        <motion.div
          key={burst}
          className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Flash doux global */}
          <motion.div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at center, hsl(330 90% 68% / 0.18), transparent 60%)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1.4, times: [0, 0.15, 1] }}
          />

          {/* Halo néon sur les bords (inset shadow via box-shadow) */}
          <motion.div
            className="absolute inset-0"
            style={{ boxShadow: "inset 0 0 160px 20px hsl(330 90% 68% / 0.5)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.9, 0] }}
            transition={{ duration: 2, times: [0, 0.2, 1] }}
          />

          {/* Anneaux concentriques */}
          {RING_COLORS.map((color, i) => (
            <motion.div
              key={color}
              className="absolute rounded-full"
              style={{
                width: 120,
                height: 120,
                border: `2px solid ${color}`,
                boxShadow: `0 0 40px ${color}`,
              }}
              initial={{ scale: 0, opacity: 0.9 }}
              animate={{ scale: 16, opacity: 0 }}
              transition={{
                duration: 2.2,
                delay: i * 0.18,
                ease: "easeOut",
              }}
            />
          ))}

          {/* Cœur central */}
          <motion.div
            className="relative text-neon-rose"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.3, 1, 1.15, 0], opacity: [0, 1, 1, 1, 0] }}
            transition={{ duration: 2.4, times: [0, 0.2, 0.4, 0.6, 1] }}
          >
            <Heart
              className="h-24 w-24 drop-shadow-[0_0_30px_hsl(330_90%_68%)]"
              fill="currentColor"
            />
          </motion.div>

          {/* Légende */}
          <motion.p
            className="text-glow absolute bottom-1/3 font-display text-lg font-semibold text-white"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: [0, 1, 1, 0], y: 0 }}
            transition={{ duration: 2.4, times: [0, 0.2, 0.7, 1] }}
          >
            Quelqu&apos;un pense à toi 💜
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
