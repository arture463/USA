"use client";

import { useEffect, useRef } from "react";

/**
 * ── BACKGROUND FX ──
 * Couche d'ambiance plein écran, fixée derrière tout le contenu :
 *  1. Champ d'étoiles animé (canvas) : scintillement + étoiles filantes
 *  2. Aurora : nappes de couleur néon floutées qui dérivent lentement
 *  3. Grille perspective "sci-fi" très subtile en bas d'écran
 *
 * Performance : un seul canvas, requestAnimationFrame, DPR plafonné à 2,
 * nombre d'étoiles proportionnel à la surface. Aucun re-render React.
 */

interface Star {
  x: number;
  y: number;
  r: number; // rayon
  baseAlpha: number; // luminosité de base
  phase: number; // déphasage du scintillement
  speed: number; // vitesse de scintillement
}

interface ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number; // 1 → 0
}

export function BackgroundFX() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let raf = 0;
    let stars: Star[] = [];
    let shooting: ShootingStar[] = [];
    let w = 0;
    let h = 0;

    /** (Re)génère le ciel en fonction de la taille de la fenêtre. */
    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // ~1 étoile / 9000px² → suffisamment dense, plus léger à dessiner
      const count = Math.floor((w * h) / 9000);
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.4 + 0.3,
        baseAlpha: Math.random() * 0.5 + 0.2,
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 1.5 + 0.5,
      }));
    };

    /** Fait naître une étoile filante depuis le haut de l'écran. */
    const spawnShootingStar = () => {
      const angle = Math.PI * (0.65 + Math.random() * 0.2); // diagonale ↙
      const speed = 6 + Math.random() * 5;
      shooting.push({
        x: Math.random() * w * 0.9 + w * 0.1,
        y: Math.random() * h * 0.3,
        vx: Math.cos(angle) * speed,
        vy: -Math.sin(angle) * speed,
        life: 1,
      });
    };

    let last = performance.now();
    const draw = (now: number) => {
      const t = now / 1000;
      ctx.clearRect(0, 0, w, h);

      // ── Étoiles scintillantes ──
      for (const s of stars) {
        const twinkle = 0.5 + 0.5 * Math.sin(t * s.speed + s.phase);
        ctx.globalAlpha = s.baseAlpha * (0.4 + 0.6 * twinkle);
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // ── Étoiles filantes (rare : ~1 toutes les 4-8 s) ──
      if (now - last > 4000 + Math.random() * 4000) {
        spawnShootingStar();
        last = now;
      }
      shooting = shooting.filter((m) => m.life > 0);
      for (const m of shooting) {
        m.x += m.vx;
        m.y += m.vy;
        m.life -= 0.015;
        const tail = 18;
        const grad = ctx.createLinearGradient(
          m.x,
          m.y,
          m.x - m.vx * tail,
          m.y - m.vy * tail
        );
        grad.addColorStop(0, `rgba(190, 240, 255, ${m.life})`);
        grad.addColorStop(1, "rgba(190, 240, 255, 0)");
        ctx.globalAlpha = 1;
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(m.x - m.vx * tail, m.y - m.vy * tail);
        ctx.stroke();
      }

      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    };

    resize();
    raf = requestAnimationFrame(draw);
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* ── Aurora : nappes néon floutées (STATIQUES pour la perf : un flou
             de cette taille est très coûteux à ré-animer chaque frame) ── */}
      <div
        className="absolute -left-1/4 -top-1/4 h-[70vh] w-[70vw] rounded-full opacity-25 blur-[90px]"
        style={{
          background:
            "radial-gradient(circle, hsl(265 90% 55% / 0.9), hsl(190 95% 50% / 0.3) 55%, transparent 72%)",
        }}
      />
      <div
        className="absolute -right-1/4 top-1/3 h-[60vh] w-[55vw] rounded-full opacity-20 blur-[90px]"
        style={{
          background:
            "radial-gradient(circle, hsl(330 90% 58% / 0.9), hsl(265 90% 55% / 0.3) 55%, transparent 72%)",
        }}
      />

      {/* ── Champ d'étoiles ── */}
      <canvas ref={canvasRef} className="absolute inset-0" />

      {/* ── Grille perspective sci-fi (horizon bas) ── */}
      <div
        className="absolute inset-x-0 bottom-0 h-[38vh] opacity-[0.13]"
        style={{
          backgroundImage:
            "linear-gradient(to right, hsl(190 95% 60% / 0.6) 1px, transparent 1px), linear-gradient(to top, hsl(265 90% 65% / 0.6) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          transform: "perspective(600px) rotateX(60deg) scale(1.6)",
          transformOrigin: "bottom",
          maskImage: "linear-gradient(to top, black 20%, transparent 90%)",
          WebkitMaskImage:
            "linear-gradient(to top, black 20%, transparent 90%)",
        }}
      />

      {/* ── Vignette : concentre le regard au centre ── */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,hsl(240_10%_3%/0.7)_100%)]" />
    </div>
  );
}
