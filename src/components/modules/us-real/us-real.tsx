"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  Flame,
  Lock,
  Sparkles,
  ImagePlus,
  Send,
  X,
  Clock,
  MapPin,
  Calendar,
  CheckCircle2,
  HelpCircle,
  Eye,
} from "lucide-react";
import Image from "next/image";
import { SectionHeading } from "@/components/ui/section-heading";
import { useIdentity } from "@/hooks/use-identity";
import { useUsReal, usRealMediaUrl, formatUsRealDate, type DailyPair, type UsRealItem } from "@/hooks/use-us-real";
import { revealOnScroll } from "@/lib/motion";

export function UsReal() {
  const { identity } = useIdentity();
  const {
    loading,
    uploading,
    schedule,
    alertTestSent,
    todayPair,
    myTodayPhoto,
    partnerTodayPhoto,
    hasPostedToday,
    partnerHasPostedToday,
    historyDays,
    streak,
    postDailyPhoto,
    triggerTestAlert,
  } = useUsReal(identity);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [zoomItem, setZoomItem] = useState<{ pair: DailyPair; initialWho?: "paris" | "raleigh" } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setPreviewUrl(null);
    setCaption("");
    setModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || uploading) return;
    try {
      await postDailyPhoto(selectedFile, caption);
      handleCloseModal();
    } catch {
      // Échec déjà géré dans le hook
    }
  };

  const isArthur = identity === "paris";
  const partnerName = isArthur ? "Clara 🇺🇸" : "Arthur 🇫🇷";
  const myName = isArthur ? "Arthur 🇫🇷" : "Clara 🇺🇸";

  return (
    <motion.section {...revealOnScroll} className="w-full">
      {/* ── EN-TÊTE DU MODULE ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
        <SectionHeading
          eyebrow="Double Capture Quotidienne 📸"
          icon={Camera}
          title="US Real :"
          titleAccent="Sans Filtre"
          subtitle="Une photo par jour chacun. Révélez ce que vous faites en même temps des deux côtés de l'océan !"
          accent="rose"
          className="mb-0"
        />

        <div className="flex items-center gap-2">
          {/* Bouton de test d'alerte */}
          <button
            type="button"
            onClick={triggerTestAlert}
            disabled={alertTestSent}
            className="btn-ghost btn-xs text-[11px] gap-1 text-foreground/70 border-white/10 hover:text-amber-300"
          >
            {alertTestSent ? "Alerte envoyée ⚡" : "Tester l'alarme 🔔"}
          </button>

          {/* Badge Streak BeReal */}
          <div className="flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/15 px-3 py-1 text-xs font-bold text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
            <Flame className="h-4 w-4 fill-amber-400 text-amber-400 animate-pulse" />
            <span>{streak} {streak > 1 ? "jours d'affilée" : "jour de série"}</span>
          </div>
        </div>
      </div>

      {/* ── BANNIÈRE D'URGENCE QUOTIDIENNE (DÉCLENCHÉE À L'HEURE ALÉATOIRE SYNCHRONISÉE) ── */}
      {schedule.isAlertActive && !hasPostedToday && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="mb-4 rounded-2xl border-2 border-amber-400 bg-amber-500/15 p-4 shadow-[0_0_30px_rgba(245,158,11,0.3)] backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-3 animate-pulse"
        >
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-400 text-black font-black text-lg shadow-lg">
              ⚠️
            </div>
            <div>
              <p className="text-sm font-black uppercase tracking-wider text-amber-300">
                C&apos;est l&apos;heure du US Real !
              </p>
              <p className="text-xs text-amber-100/90 font-medium">
                L&apos;alerte surprise a sonné ({schedule.triggerLabel}) — Vous devez capturer votre moment du jour !
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="btn-neon btn-sm btn-pill gap-1.5 px-4 py-2 text-xs font-bold bg-amber-400 text-black border-amber-300 hover:bg-amber-300 shrink-0 shadow-[0_0_20px_rgba(245,158,11,0.5)]"
          >
            <Camera className="h-4 w-4" />
            Prendre ma photo maintenant 📸
          </button>
        </motion.div>
      )}

      <div className="panel-roomy relative overflow-hidden space-y-6">
        {/* ── BANDEAU DU JOUR & COMPTE À REBOURS ── */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-amber-400 animate-ping" />
            <p className="text-xs font-bold uppercase tracking-wider text-amber-300">
              L&apos;instant du jour · {todayPair.formattedDate}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {!schedule.isAlertActive && !hasPostedToday && (
              <span className="flex items-center gap-1.5 text-[11px] font-mono text-neon-cyan bg-neon-cyan/10 border border-neon-cyan/25 px-2.5 py-0.5 rounded-full">
                <Clock className="h-3 w-3" />
                <span>Alerte surprise dans {schedule.formattedCountdown}</span>
                <span className="text-foreground/40 font-sans text-[10px]">(plage 14h-21h45 Paris · 8h-15h45 Raleigh)</span>
              </span>
            )}

            <p className="text-[11px] text-foreground/50 font-mono">
              {todayPair.bothPosted
                ? "✨ Double photo complétée aujourd'hui !"
                : hasPostedToday
                  ? `En attente du moment de ${partnerName}...`
                  : `À toi de capturer ton moment du jour !`}
            </p>
          </div>
        </div>

        {/* ── DOUBLE VUE DU JOUR (PARIS 🇫🇷 ↔ RALEIGH 🇺🇸) ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 1. CARTE ARTHUR (PARIS 🇫🇷) */}
          <div className="relative rounded-2xl border border-white/10 bg-black/40 overflow-hidden shadow-xl flex flex-col min-h-[340px]">
            <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur-md px-2.5 py-1 text-[11px] font-semibold text-neon-cyan border border-neon-cyan/30">
              <MapPin className="h-3 w-3" />
              Arthur · Paris 🇫🇷
            </div>

            {todayPair.paris ? (
              // Arthur a posté sa photo
              <div className="relative flex-1 group">
                <div
                  className={`relative w-full h-full min-h-[300px] ${
                    !isArthur && !hasPostedToday ? "blur-2xl scale-105" : ""
                  } transition-all duration-700`}
                >
                  <img
                    src={usRealMediaUrl(todayPair.paris.media_path) || ""}
                    alt="US Real Paris"
                    className="w-full h-full object-cover rounded-2xl min-h-[320px] max-h-[420px]"
                  />
                </div>

                {/* Masque flou si Clara n'a pas encore posté */}
                {!isArthur && !hasPostedToday && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center bg-black/40 backdrop-blur-md">
                    <div className="h-12 w-12 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 mb-3">
                      <Lock className="h-6 w-6" />
                    </div>
                    <p className="text-sm font-bold text-foreground mb-1">
                      Moment d&apos;Arthur verrouillé 🙈
                    </p>
                    <p className="text-xs text-foreground/60 max-w-xs mb-4">
                      Poste ton US Real du jour pour révéler ce qu&apos;Arthur faisait à Paris !
                    </p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="btn-neon btn-sm btn-pill text-xs border-amber-400/60 text-amber-300"
                    >
                      <Camera className="h-3.5 w-3.5" />
                      Prendre ma photo
                    </button>
                  </div>
                )}

                {/* Légende & Heure si visible */}
                {(isArthur || hasPostedToday) && (
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 z-10">
                    {todayPair.paris.caption && (
                      <p className="text-xs text-white font-medium mb-1 drop-shadow">
                        &quot;{todayPair.paris.caption}&quot;
                      </p>
                    )}
                    <p className="text-[10px] font-mono text-white/60 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(todayPair.paris.created_at).toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      (Heure de Paris)
                    </p>
                  </div>
                )}
              </div>
            ) : isArthur ? (
              // Arthur n'a pas encore posté -> bouton pour capturer
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <div className="h-16 w-16 rounded-2xl bg-neon-cyan/15 border border-neon-cyan/30 flex items-center justify-center text-neon-cyan mb-4 shadow-[0_0_20px_rgba(34,211,238,0.2)]">
                  <Camera className="h-8 w-8" />
                </div>
                <h4 className="text-sm font-bold text-foreground mb-1">
                  Ton tour, Arthur !
                </h4>
                <p className="text-xs text-foreground/60 max-w-xs mb-5">
                  Capture ton instant de la journée à Paris pour débloquer le moment de Clara.
                </p>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="btn-neon btn-sm btn-pill gap-1.5 text-xs border-neon-cyan/60 text-neon-cyan shadow-[0_0_15px_rgba(34,211,238,0.25)]"
                  >
                    <Camera className="h-3.5 w-3.5" />
                    Caméra directe
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="btn-ghost btn-sm btn-pill gap-1.5 text-xs border-white/10"
                  >
                    <ImagePlus className="h-3.5 w-3.5" />
                    Galerie
                  </button>
                </div>
              </div>
            ) : (
              // Clara regarde la carte d'Arthur qui n'a pas encore posté
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-foreground/40">
                <Clock className="h-10 w-10 stroke-1 mb-2 text-foreground/30 animate-pulse" />
                <p className="text-xs font-medium">Arthur n&apos;a pas encore posté aujourd&apos;hui</p>
                <p className="text-[10px] text-foreground/40 mt-1">Dès qu&apos;il capture son moment, tu recevras une alerte !</p>
              </div>
            )}
          </div>

          {/* 2. CARTE CLARA (RALEIGH 🇺🇸) */}
          <div className="relative rounded-2xl border border-white/10 bg-black/40 overflow-hidden shadow-xl flex flex-col min-h-[340px]">
            <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur-md px-2.5 py-1 text-[11px] font-semibold text-neon-rose border border-neon-rose/30">
              <MapPin className="h-3 w-3" />
              Clara · Raleigh 🇺🇸
            </div>

            {todayPair.raleigh ? (
              // Clara a posté sa photo
              <div className="relative flex-1 group">
                <div
                  className={`relative w-full h-full min-h-[300px] ${
                    isArthur && !hasPostedToday ? "blur-2xl scale-105" : ""
                  } transition-all duration-700`}
                >
                  <img
                    src={usRealMediaUrl(todayPair.raleigh.media_path) || ""}
                    alt="US Real Raleigh"
                    className="w-full h-full object-cover rounded-2xl min-h-[320px] max-h-[420px]"
                  />
                </div>

                {/* Masque flou si Arthur n'a pas encore posté */}
                {isArthur && !hasPostedToday && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center bg-black/40 backdrop-blur-md">
                    <div className="h-12 w-12 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 mb-3">
                      <Lock className="h-6 w-6" />
                    </div>
                    <p className="text-sm font-bold text-foreground mb-1">
                      Moment de Clara verrouillé 🙈
                    </p>
                    <p className="text-xs text-foreground/60 max-w-xs mb-4">
                      Poste ton US Real du jour pour découvrir ce que fait Clara à Raleigh !
                    </p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="btn-neon btn-sm btn-pill text-xs border-amber-400/60 text-amber-300"
                    >
                      <Camera className="h-3.5 w-3.5" />
                      Prendre ma photo
                    </button>
                  </div>
                )}

                {/* Légende & Heure si visible */}
                {(!isArthur || hasPostedToday) && (
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 z-10">
                    {todayPair.raleigh.caption && (
                      <p className="text-xs text-white font-medium mb-1 drop-shadow">
                        &quot;{todayPair.raleigh.caption}&quot;
                      </p>
                    )}
                    <p className="text-[10px] font-mono text-white/60 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(todayPair.raleigh.created_at).toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      (Heure de Raleigh)
                    </p>
                  </div>
                )}
              </div>
            ) : !isArthur ? (
              // Clara n'a pas encore posté -> bouton pour capturer
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <div className="h-16 w-16 rounded-2xl bg-neon-rose/15 border border-neon-rose/30 flex items-center justify-center text-neon-rose mb-4 shadow-[0_0_20px_rgba(244,114,182,0.2)]">
                  <Camera className="h-8 w-8" />
                </div>
                <h4 className="text-sm font-bold text-foreground mb-1">
                  Ton tour, Clara !
                </h4>
                <p className="text-xs text-foreground/60 max-w-xs mb-5">
                  Capture ton instant de la journée à Raleigh pour débloquer le moment d&apos;Arthur.
                </p>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="btn-neon btn-sm btn-pill gap-1.5 text-xs border-neon-rose/60 text-neon-rose shadow-[0_0_15px_rgba(244,114,182,0.25)]"
                  >
                    <Camera className="h-3.5 w-3.5" />
                    Caméra directe
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="btn-ghost btn-sm btn-pill gap-1.5 text-xs border-white/10"
                  >
                    <ImagePlus className="h-3.5 w-3.5" />
                    Galerie
                  </button>
                </div>
              </div>
            ) : (
              // Arthur regarde la carte de Clara qui n'a pas encore posté
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-foreground/40">
                <Clock className="h-10 w-10 stroke-1 mb-2 text-foreground/30 animate-pulse" />
                <p className="text-xs font-medium">Clara n&apos;a pas encore posté aujourd&apos;hui</p>
                <p className="text-[10px] text-foreground/40 mt-1">Dès qu&apos;elle capture son moment, tu recevras une alerte !</p>
              </div>
            )}
          </div>
        </div>

        {/* Inputs de fichiers cachés */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* ── GALERIE SOUVENIR DES JOURS PRÉCÉDENTS ── */}
        <div className="border-t border-white/10 pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-amber-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                Album Souvenir · Nos Instants Partagés
              </h4>
            </div>
            <span className="text-[11px] font-mono text-foreground/40">
              {historyDays.length} {historyDays.length > 1 ? "jours enregistrés" : "jour enregistré"}
            </span>
          </div>

          {historyDays.length === 0 ? (
            <p className="text-xs text-foreground/40 text-center py-6">
              Vos doubles photos des jours passés apparaîtront ici pour composer votre album des 4 mois ! 📸💖
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {historyDays.map((day) => (
                <div
                  key={day.date}
                  onClick={() => setZoomItem({ pair: day })}
                  className="group relative cursor-pointer rounded-xl border border-white/10 bg-white/5 p-2.5 hover:border-amber-400/40 hover:bg-white/10 transition-all shadow-lg"
                >
                  <p className="text-[11px] font-semibold text-amber-300 mb-2 capitalize flex items-center justify-between">
                    <span>{day.formattedDate}</span>
                    {day.bothPosted && (
                      <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-mono">
                        Duo ✨
                      </span>
                    )}
                  </p>

                  {/* Aperçu double miniature */}
                  <div className="grid grid-cols-2 gap-1.5 rounded-lg overflow-hidden h-28 bg-black/40">
                    {day.paris ? (
                      <div className="relative w-full h-full">
                        <img
                          src={usRealMediaUrl(day.paris.media_path) || ""}
                          alt="Paris"
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-1 left-1 text-[8px] bg-black/70 px-1 rounded text-neon-cyan font-mono">
                          Paris 🇫🇷
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center text-[10px] text-foreground/30">
                        Pas de photo
                      </div>
                    )}

                    {day.raleigh ? (
                      <div className="relative w-full h-full">
                        <img
                          src={usRealMediaUrl(day.raleigh.media_path) || ""}
                          alt="Raleigh"
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-1 left-1 text-[8px] bg-black/70 px-1 rounded text-neon-rose font-mono">
                          Raleigh 🇺🇸
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center text-[10px] text-foreground/30">
                        Pas de photo
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── MODALE DE CONFIRMATION / LÉGENDE DE LA PHOTO ── */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="panel-roomy relative z-10 w-full max-w-sm border-amber-500/40 bg-background/95 p-5 shadow-2xl backdrop-blur-2xl"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                  <Camera className="h-4 w-4 text-amber-400" />
                  Publier mon US Real
                </h3>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="btn-ghost p-1 text-foreground/40 hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {previewUrl && (
                <div className="relative w-full h-64 rounded-xl overflow-hidden mb-3 border border-white/10 shadow-inner">
                  <img
                    src={previewUrl}
                    alt="Aperçu US Real"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="label-micro block mb-1 text-foreground/70">
                    Légende (facultative) :
                  </label>
                  <input
                    type="text"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Ex: Pause café à Paris, sous la clim au labo..."
                    maxLength={100}
                    className="input text-xs w-full py-2 px-3 rounded-lg border-white/15 bg-white/5 focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="btn-ghost btn-sm text-xs"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="btn-neon btn-sm btn-pill gap-1.5 text-xs border-amber-400/60 text-amber-300 hover:bg-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                  >
                    <Send className="h-3.5 w-3.5" />
                    {uploading ? "Envoi en cours..." : "Partager mon instant ✨"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODALE ZOOM D'UN JOUR DE L'ALBUM ── */}
      <AnimatePresence>
        {zoomItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setZoomItem(null)}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="panel-roomy relative z-10 w-full max-w-2xl border-amber-500/40 bg-background/95 p-5 shadow-2xl backdrop-blur-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-amber-300 capitalize flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {zoomItem.pair.formattedDate}
                </h3>
                <button
                  type="button"
                  onClick={() => setZoomItem(null)}
                  className="btn-ghost p-1 text-foreground/40 hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Photo Paris */}
                <div className="rounded-xl overflow-hidden border border-white/10 bg-black/40">
                  <div className="p-2 border-b border-white/10 flex items-center justify-between text-[11px] font-semibold text-neon-cyan">
                    <span>Arthur · Paris 🇫🇷</span>
                    {zoomItem.pair.paris && (
                      <span className="font-mono text-[10px] text-white/50">
                        {new Date(zoomItem.pair.paris.created_at).toLocaleTimeString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    )}
                  </div>
                  {zoomItem.pair.paris ? (
                    <div>
                      <img
                        src={usRealMediaUrl(zoomItem.pair.paris.media_path) || ""}
                        alt="Paris"
                        className="w-full h-64 object-cover"
                      />
                      {zoomItem.pair.paris.caption && (
                        <p className="p-2.5 text-xs text-foreground/80 italic border-t border-white/5">
                          &quot;{zoomItem.pair.paris.caption}&quot;
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="h-64 flex items-center justify-center text-xs text-foreground/40">
                      Pas de photo postée
                    </div>
                  )}
                </div>

                {/* Photo Raleigh */}
                <div className="rounded-xl overflow-hidden border border-white/10 bg-black/40">
                  <div className="p-2 border-b border-white/10 flex items-center justify-between text-[11px] font-semibold text-neon-rose">
                    <span>Clara · Raleigh 🇺🇸</span>
                    {zoomItem.pair.raleigh && (
                      <span className="font-mono text-[10px] text-white/50">
                        {new Date(zoomItem.pair.raleigh.created_at).toLocaleTimeString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    )}
                  </div>
                  {zoomItem.pair.raleigh ? (
                    <div>
                      <img
                        src={usRealMediaUrl(zoomItem.pair.raleigh.media_path) || ""}
                        alt="Raleigh"
                        className="w-full h-64 object-cover"
                      />
                      {zoomItem.pair.raleigh.caption && (
                        <p className="p-2.5 text-xs text-foreground/80 italic border-t border-white/5">
                          &quot;{zoomItem.pair.raleigh.caption}&quot;
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="h-64 flex items-center justify-center text-xs text-foreground/40">
                      Pas de photo postée
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
