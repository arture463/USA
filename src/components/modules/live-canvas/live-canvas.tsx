"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Palette,
  Sparkles,
  Trash2,
  Download,
  Save,
  Image as ImageIcon,
  Check,
  Calendar,
  X,
  Brush,
} from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { useIdentity } from "@/hooks/use-identity";
import { useLiveCanvas, type StrokePoint, type SavedCanvasArtwork } from "@/hooks/use-live-canvas";
import { revealOnScroll } from "@/lib/motion";
import { formatUsRealDate } from "@/hooks/use-us-real";

const COLORS = [
  { name: "Cyan Quantique", hex: "#22d3ee", borderClass: "border-cyan-400" },
  { name: "Rose Céleste", hex: "#f472b6", borderClass: "border-pink-400" },
  { name: "Violet Astral", hex: "#a855f7", borderClass: "border-purple-400" },
  { name: "Or Stellaire", hex: "#fbbf24", borderClass: "border-amber-400" },
  { name: "Blanc Éther", hex: "#ffffff", borderClass: "border-white" },
];

const SIZES = [
  { label: "Fin", size: 3 },
  { label: "Normal", size: 6 },
  { label: "Aérien", size: 14 },
];

export function LiveCanvas() {
  const { identity } = useIdentity();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedColor, setSelectedColor] = useState(COLORS[0].hex);
  const [brushSize, setBrushSize] = useState(6);
  const [isDrawing, setIsDrawing] = useState(false);
  const [titleInput, setTitleInput] = useState("");
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [zoomArtwork, setZoomArtwork] = useState<SavedCanvasArtwork | null>(null);

  const lastPointRef = useRef<{ xRatio: number; yRatio: number } | null>(null);
  const strokeIdRef = useRef<string>("");

  // Fonction pour dessiner un segment sur le canvas
  const drawSegment = useCallback(
    (
      x1Ratio: number,
      y1Ratio: number,
      x2Ratio: number,
      y2Ratio: number,
      color: string,
      size: number
    ) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const w = canvas.width;
      const h = canvas.height;

      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = size;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.shadowColor = color;
      ctx.shadowBlur = size * 2.2;

      ctx.beginPath();
      ctx.moveTo(x1Ratio * w, y1Ratio * h);
      ctx.lineTo(x2Ratio * w, y2Ratio * h);
      ctx.stroke();
      ctx.restore();
    },
    []
  );

  // Réception du tracé en direct du partenaire
  const handleRemoteDraw = useCallback(
    (p: StrokePoint) => {
      if (p.prevXRatio !== undefined && p.prevYRatio !== undefined) {
        drawSegment(p.prevXRatio, p.prevYRatio, p.xRatio, p.yRatio, p.color, p.size);
      }
    },
    [drawSegment]
  );

  // Réception de l'effacement distant
  const handleRemoteClear = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, []);

  const {
    artworks,
    partnerDrawing,
    partnerName,
    saving,
    broadcastStroke,
    broadcastClear,
    saveArtwork,
  } = useLiveCanvas(identity, handleRemoteDraw, handleRemoteClear);

  // Initialisation et redimensionnement du canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      // Sauvegarder le dessin actuel lors d'un resize
      const temp = document.createElement("canvas");
      temp.width = canvas.width;
      temp.height = canvas.height;
      const tempCtx = temp.getContext("2d");
      if (tempCtx) tempCtx.drawImage(canvas, 0, 0);

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;

      const ctx = canvas.getContext("2d");
      if (ctx && temp.width > 0 && temp.height > 0) {
        ctx.drawImage(temp, 0, 0, canvas.width, canvas.height);
      }
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

  // Gestion du tracé local
  const getCoordinates = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { xRatio: 0, yRatio: 0 };
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    return {
      xRatio: Math.max(0, Math.min(1, x / rect.width)),
      yRatio: Math.max(0, Math.min(1, y / rect.height)),
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!identity) return;
    const { xRatio, yRatio } = getCoordinates(e);
    setIsDrawing(true);
    lastPointRef.current = { xRatio, yRatio };
    strokeIdRef.current = `${Date.now()}-${Math.random()}`;

    // Dessiner un petit point initial
    drawSegment(xRatio, yRatio, xRatio + 0.001, yRatio + 0.001, selectedColor, brushSize);

    broadcastStroke({
      xRatio,
      yRatio,
      prevXRatio: xRatio,
      prevYRatio: yRatio,
      color: selectedColor,
      size: brushSize,
      author: identity,
      strokeId: strokeIdRef.current,
    });
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !identity || !lastPointRef.current) return;
    const { xRatio, yRatio } = getCoordinates(e);
    const prev = lastPointRef.current;

    drawSegment(prev.xRatio, prev.yRatio, xRatio, yRatio, selectedColor, brushSize);

    broadcastStroke({
      xRatio,
      yRatio,
      prevXRatio: prev.xRatio,
      prevYRatio: prev.yRatio,
      color: selectedColor,
      size: brushSize,
      author: identity,
      strokeId: strokeIdRef.current,
    });

    lastPointRef.current = { xRatio, yRatio };
  };

  const handlePointerUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    lastPointRef.current = null;
  };

  // Effacer la toile
  const handleClear = () => {
    handleRemoteClear();
    broadcastClear();
  };

  // Télécharger le dessin en PNG
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Créer une version avec fond sombre
    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = canvas.width;
    exportCanvas.height = canvas.height;
    const ctx = exportCanvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#090d16";
    ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
    ctx.drawImage(canvas, 0, 0);

    const a = document.createElement("a");
    a.download = `croquis-us-together-${new Date().toISOString().slice(0, 10)}.png`;
    a.href = exportCanvas.toDataURL("image/png");
    a.click();
  };

  // Confirmer la sauvegarde dans la galerie
  const handleConfirmSave = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = 600;
    exportCanvas.height = 400;
    const ctx = exportCanvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#090d16";
    ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
    ctx.drawImage(canvas, 0, 0, 600, 400);

    const dataUrl = exportCanvas.toDataURL("image/webp", 0.85);
    await saveArtwork(dataUrl, titleInput.trim() || "Croquis d'Amour");
    setShowSaveModal(false);
    setTitleInput("");
  };

  return (
    <motion.section {...revealOnScroll} className="w-full">
      {/* ── EN-TÊTE DU MODULE ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
        <SectionHeading
          eyebrow="Tracé Quantique & Dessin Partagé 🎨"
          icon={Palette}
          title="Toile Néon :"
          titleAccent="En Direct"
          subtitle="Dessine avec ton doigt ou ta souris. Clara voit le trait de lumière briller sur son écran en temps réel."
          accent="cyan"
          className="mb-0"
        />

        {/* Indicateur de partenaire en train de dessiner */}
        <div
          className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition-all ${
            partnerDrawing
              ? "border border-neon-rose bg-neon-rose/20 text-neon-rose shadow-[0_0_15px_rgba(244,114,182,0.4)] animate-pulse"
              : "border border-white/10 bg-white/5 text-foreground/50"
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>
            {partnerDrawing ? `${partnerName} dessine en direct ✨` : "Toile partagée en direct"}
          </span>
        </div>
      </div>

      <div className="panel-roomy relative overflow-hidden space-y-4 border-neon-cyan/30 bg-gradient-to-b from-neon-cyan/10 via-background/95 to-background/95 shadow-[0_0_35px_rgba(34,211,238,0.15)]">
        {/* ── BARRE D'OUTILS (COULEURS & TAILLES) ── */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-xl">
          {/* 1. Palette de Couleurs */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-foreground/50 hidden sm:inline">Couleur :</span>
            <div className="flex items-center gap-1.5">
              {COLORS.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => setSelectedColor(c.hex)}
                  title={c.name}
                  className={`h-7 w-7 rounded-full border-2 transition-all flex items-center justify-center ${
                    selectedColor === c.hex
                      ? `${c.borderClass} scale-110 shadow-[0_0_15px_${c.hex}]`
                      : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                  style={{ backgroundColor: c.hex }}
                >
                  {selectedColor === c.hex && (
                    <Check
                      className={`h-3.5 w-3.5 ${
                        c.hex === "#ffffff" ? "text-black" : "text-black"
                      }`}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Taille de Pinceau */}
          <div className="flex items-center gap-1.5">
            {SIZES.map((s) => (
              <button
                key={s.size}
                type="button"
                onClick={() => setBrushSize(s.size)}
                className={`btn-xs btn-pill px-2.5 py-1 text-[11px] font-mono border transition-all ${
                  brushSize === s.size
                    ? "border-neon-cyan bg-neon-cyan/20 text-neon-cyan shadow-[0_0_12px_rgba(34,211,238,0.3)]"
                    : "border-white/10 bg-white/5 text-foreground/60 hover:text-foreground"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* 3. Actions Rapides */}
          <div className="flex items-center gap-1.5 ml-auto">
            <button
              type="button"
              onClick={handleClear}
              className="btn-ghost btn-xs btn-pill gap-1 border-white/10 text-foreground/60 hover:text-rose-300 hover:border-rose-400/40 text-[11px]"
              title="Effacer en poussière d'étoiles"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Effacer</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="btn-ghost btn-xs btn-pill gap-1 border-white/10 text-foreground/70 hover:text-foreground text-[11px]"
              title="Télécharger l'image PNG"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">PNG</span>
            </button>

            <button
              type="button"
              onClick={() => setShowSaveModal(true)}
              className="btn-neon btn-xs btn-pill gap-1 border-neon-cyan/50 text-neon-cyan shadow-[0_0_12px_rgba(34,211,238,0.25)] text-[11px]"
            >
              <Save className="h-3.5 w-3.5" />
              <span>Garder</span>
            </button>
          </div>
        </div>

        {/* ── LA TOILE NÉON INTERACTIVE ── */}
        <div className="relative rounded-2xl border-2 border-white/15 bg-[#090d16] overflow-hidden shadow-2xl h-[340px] sm:h-[420px] cursor-crosshair">
          {/* Ciel étoilé léger d'arrière-plan */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-950/40 via-black/80 to-[#090d16] pointer-events-none" />

          <canvas
            ref={canvasRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onPointerLeave={handlePointerUp}
            style={{ touchAction: "none" }}
            className="relative z-10 w-full h-full"
          />

          <div className="pointer-events-none absolute bottom-3 right-3 z-20 flex items-center gap-1.5 rounded-full bg-black/70 backdrop-blur-md px-2.5 py-1 text-[10px] font-mono text-white/50 border border-white/10">
            <Brush className="h-3 w-3 text-neon-cyan" />
            <span>Tracé Quantique Actif</span>
          </div>
        </div>

        {/* ── CARNET DE CROQUIS COMPLICE (HISTORIQUE) ── */}
        {artworks.length > 0 && (
          <div className="border-t border-white/10 pt-4 space-y-3">
            <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <ImageIcon className="h-3.5 w-3.5 text-neon-cyan" />
              <span>Carnet de Croquis Complice ({artworks.length} {artworks.length > 1 ? "œuvres" : "œuvre"})</span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {artworks.map((art) => (
                <div
                  key={art.id}
                  onClick={() => setZoomArtwork(art)}
                  className="group relative rounded-xl border border-white/15 bg-black/40 overflow-hidden cursor-pointer hover:border-neon-cyan/50 hover:shadow-[0_0_20px_rgba(34,211,238,0.25)] transition-all"
                >
                  <img
                    src={art.imageData}
                    alt={art.title}
                    className="w-full h-28 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="p-2 bg-black/80 backdrop-blur-sm">
                    <p className="text-[11px] font-bold text-foreground truncate">{art.title}</p>
                    <p className="text-[9px] font-mono text-foreground/50 flex items-center justify-between mt-0.5">
                      <span>{art.author === "paris" ? "Arthur 🇫🇷" : "Clara 🇺🇸"}</span>
                      <span>{formatUsRealDate(art.created_at.slice(0, 10))}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── MODALE SAUVEGARDE DU CROQUIS ── */}
      <AnimatePresence>
        {showSaveModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 15 }}
              className="relative max-w-sm w-full rounded-2xl border border-neon-cyan/40 bg-slate-900/95 p-5 space-y-4 shadow-[0_0_40px_rgba(34,211,238,0.3)] text-center"
            >
              <div className="mx-auto h-12 w-12 rounded-full bg-neon-cyan/20 border border-neon-cyan/40 flex items-center justify-center text-neon-cyan">
                <Palette className="h-6 w-6" />
              </div>

              <div>
                <h3 className="text-sm font-bold text-foreground">
                  Garder dans notre Carnet de Croquis 🖼️
                </h3>
                <p className="text-xs text-foreground/60 mt-1">
                  Donne un petit titre à votre œuvre pour la retrouver dans vos souvenirs.
                </p>
              </div>

              <input
                type="text"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                placeholder="Ex: Notre cœur transatlantique..."
                maxLength={40}
                className="input text-xs w-full p-2.5 rounded-xl border-white/15 bg-black/40 focus:border-neon-cyan"
              />

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSaveModal(false)}
                  className="btn-ghost btn-xs btn-pill text-xs border-white/10"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSave}
                  disabled={saving}
                  className="btn-neon btn-xs btn-pill text-xs border-neon-cyan text-neon-cyan shadow-[0_0_15px_rgba(34,211,238,0.3)]"
                >
                  {saving ? "Sauvegarde..." : "Enregistrer ✨"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MODALE ZOOM SUR UN CROQUIS ── */}
      <AnimatePresence>
        {zoomArtwork && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setZoomArtwork(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-xl w-full rounded-2xl border border-white/20 bg-slate-950 overflow-hidden shadow-2xl p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-foreground">{zoomArtwork.title}</h4>
                  <p className="text-xs text-foreground/50 font-mono">
                    Par {zoomArtwork.author === "paris" ? "Arthur 🇫🇷" : "Clara 🇺🇸"} · {formatUsRealDate(zoomArtwork.created_at.slice(0, 10))}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setZoomArtwork(null)}
                  className="rounded-full p-1.5 text-foreground/50 hover:text-foreground hover:bg-white/10"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <img
                src={zoomArtwork.imageData}
                alt={zoomArtwork.title}
                className="w-full max-h-[70vh] object-contain rounded-xl border border-white/10 bg-black"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
