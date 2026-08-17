"use client";

import { useEffect, useRef } from "react";

interface Sparkle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
  type: "spark" | "heart";
  rotation: number;
  vRot: number;
}

const COLORS = [
  "rgba(34, 211, 238, ", // cyan
  "rgba(168, 85, 247, ", // violet
  "rgba(244, 114, 182, ", // rose
  "rgba(251, 191, 36, ", // gold
];

export function ClickSparkles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    const onResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize, { passive: true });

    let sparkles: Sparkle[] = [];
    let animationFrameId = 0;

    const addSparkles = (x: number, y: number) => {
      const count = 7;
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 3 + 1.5;
        const color = COLORS[Math.floor(Math.random() * COLORS.length)];
        const isHeart = Math.random() < 0.25;

        sparkles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 0.8, // légère dérive vers le haut
          size: isHeart ? Math.random() * 4 + 5 : Math.random() * 2.5 + 1.5,
          color,
          alpha: 1,
          decay: Math.random() * 0.025 + 0.02,
          type: isHeart ? "heart" : "spark",
          rotation: Math.random() * Math.PI * 2,
          vRot: (Math.random() - 0.5) * 0.1,
        });
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      // Éviter de surcharger si on clique très vite
      if (sparkles.length < 50) {
        addSparkles(e.clientX, e.clientY);
      }
    };

    window.addEventListener("pointerdown", handlePointerDown, { passive: true });

    const drawHeart = (c: CanvasRenderingContext2D, x: number, y: number, size: number) => {
      c.beginPath();
      const topCurveHeight = size * 0.3;
      c.moveTo(x, y + topCurveHeight);
      c.bezierCurveTo(x, y, x - size / 2, y, x - size / 2, y + topCurveHeight);
      c.bezierCurveTo(x - size / 2, y + (size + topCurveHeight) / 2, x, y + size, x, y + size);
      c.bezierCurveTo(x, y + size, x + size / 2, y + (size + topCurveHeight) / 2, x + size / 2, y + topCurveHeight);
      c.bezierCurveTo(x + size / 2, y, x, y, x, y + topCurveHeight);
      c.closePath();
      c.fill();
    };

    const render = () => {
      ctx.clearRect(0, 0, w, h);

      if (sparkles.length > 0) {
        for (let i = sparkles.length - 1; i >= 0; i--) {
          const s = sparkles[i];
          s.x += s.vx;
          s.y += s.vy;
          s.vx *= 0.94;
          s.vy *= 0.94;
          s.rotation += s.vRot;
          s.alpha -= s.decay;

          if (s.alpha <= 0) {
            sparkles.splice(i, 1);
            continue;
          }

          ctx.fillStyle = `${s.color}${s.alpha})`;

          if (s.type === "heart") {
            ctx.save();
            ctx.translate(s.x, s.y);
            ctx.rotate(s.rotation);
            drawHeart(ctx, -s.size / 2, -s.size / 2, s.size);
            ctx.restore();
          } else {
            // Spark étoile à 4 branches
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointerdown", handlePointerDown);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-50 h-full w-full"
    />
  );
}
