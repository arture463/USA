"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Radio, Wifi, WifiOff } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { useIdentity } from "@/hooks/use-identity";
import { useThinkingOfYou } from "@/hooks/use-thinking-of-you";
import { usePresence } from "@/hooks/use-presence";
import { usePetFeeder } from "@/hooks/use-pet";
import { FOOD } from "@/lib/pet-data";
import { playChime } from "@/lib/chime";
import { vibrateHeartbeat, vibrateTick } from "@/lib/haptics";
import { LOCATIONS } from "@/lib/constants";
import { revealOnScroll } from "@/lib/motion";
import {
  getNotificationPermission,
  requestNotificationPermission,
  sendAppNotification,
  isNotificationSupported,
} from "@/lib/notifications";
import { Shockwave } from "./shockwave";
import type { Thought } from "@/types";

/**
 * MODULE 3 — Thinking of You
 * Un bouton "signal" : quand tu cliques, une pensée part en base ;
 * l'écran de l'autre reçoit l'onde de choc en temps réel (Supabase Realtime).
 */
export function ThinkingOfYou() {
  const { identity, setIdentity, ready } = useIdentity();
  const [burst, setBurst] = useState(0);
  const [justSent, setJustSent] = useState(false);
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>("default");
  const [testSent, setTestSent] = useState(false);

  useEffect(() => {
    setNotifPermission(getNotificationPermission());
  }, []);

  const handleRequestNotifPermission = async () => {
    const res = await requestNotificationPermission();
    setNotifPermission(res);
    if (res === "granted") {
      void sendAppNotification("💖 Notifications d'amour activées !", {
        body: "Tu recevras un signal chaque fois qu'une pensée t'est envoyée.",
      });
    }
  };

  const handleTestNotification = async () => {
    setTestSent(true);
    await sendAppNotification(
      identity === "paris" ? "💙 Clara pense à toi !" : "💜 Arthur pense à toi !",
      {
        body: identity === "paris" ? "Test de notification réussi depuis Raleigh 🇺🇸 💖" : "Test de notification réussi depuis Paris 🇫🇷 💖",
      }
    );
    setTimeout(() => setTestSent(false), 3000);
  };

  // Réception d'une pensée de l'autre → onde de choc + carillon + vibration + notification OS
  const handleReceive = useCallback((_thought: Thought) => {
    setBurst((b) => b + 1);
    playChime();
    vibrateHeartbeat();

    // Notification système OS (Desktop & Mobile via Service Worker)
    void sendAppNotification(
      identity === "paris" ? "💙 Clara pense à toi !" : "💜 Arthur pense à toi !",
      {
        body: identity === "paris" ? "Une pensée vient d'arriver depuis Raleigh 🇺🇸 💖" : "Une pensée vient d'arriver depuis Paris 🇫🇷 💖",
      }
    );
  }, [identity]);

  const { received, connected, sending, send } = useThinkingOfYou(
    identity,
    handleReceive
  );

  // Présence : l'autre est-il·elle connecté·e en ce moment ?
  const { otherOnline } = usePresence(identity);

  // Être en ligne en même temps nourrit la créature — une fois par jour,
  // la clé du jour étant dédoublonnée en base.
  const feedPet = usePetFeeder(identity);
  useEffect(() => {
    if (!otherOnline) return;
    const today = new Date().toISOString().slice(0, 10);
    void feedPet(FOOD.together, `together:${today}`, "together");
  }, [otherOnline, feedPet]);

  const handleSend = async () => {
    vibrateTick();
    await send();
    setJustSent(true);
    window.setTimeout(() => setJustSent(false), 1600);
  };

  // Skeleton pendant la lecture du localStorage (évite le flash)
  if (!ready) {
    return <div className="skeleton h-72 w-full" />;
  }

  const other =
    identity === "paris" ? LOCATIONS.raleigh : LOCATIONS.paris;

  return (
    <>
      {/* L'onde de choc vit au-dessus de toute la page */}
      <Shockwave burst={burst} />

      <motion.section
        {...revealOnScroll}
        className="panel-roomy relative w-full overflow-hidden text-center"
      >
        {/* Indicateur de connexion temps réel (coin haut droit) */}
        <div className="label-micro absolute right-4 top-4 flex items-center gap-1.5">
          {connected ? (
            <>
              <Wifi className="h-3 w-3 text-neon-cyan" />
              <span className="text-neon-cyan">En ligne</span>
            </>
          ) : (
            <>
              <WifiOff className="h-3 w-3" />
              <span>Connexion…</span>
            </>
          )}
        </div>

        <SectionHeading
          eyebrow="Signal privé"
          icon={Radio}
          title="Thinking of"
          titleAccent="you"
          subtitle={`Appuie, et ${other.label} verra son écran s'illuminer, où que vous soyez.`}
          accent="rose"
          className="mb-0"
        />

        {/* Présence live : ✨ le moment "on est là en même temps" */}
        <div className="mt-4 flex h-7 items-center justify-center">
          <AnimatePresence mode="wait">
            {otherOnline ? (
              <motion.span
                key="online"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="chip-text border-neon-mint/30 bg-neon-mint/10 text-neon-mint"
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-neon-mint opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-neon-mint" />
                </span>
                {other.label} est là, maintenant 💚
              </motion.span>
            ) : (
              <motion.span
                key="offline"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="label-micro"
              >
                {other.label} n&apos;est pas connecté·e
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* LE bouton */}
        <div className="mt-8 flex justify-center">
          <motion.button
            type="button"
            onClick={handleSend}
            disabled={sending}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
            aria-label={`Envoyer une pensée à ${other.label}`}
            className="focus-ring group relative flex h-36 w-36 items-center justify-center rounded-full disabled:opacity-70"
          >
            {/* Halo pulsant permanent */}
            <span className="absolute inset-0 animate-pulse-glow rounded-full bg-neon-rose/20 blur-xl" />
            {/* Anneau au clic */}
            {justSent && (
              <motion.span
                className="absolute inset-0 rounded-full border-2 border-neon-rose"
                initial={{ scale: 1, opacity: 0.8 }}
                animate={{ scale: 1.8, opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            )}
            {/* Corps du bouton */}
            <span className="relative flex h-32 w-32 items-center justify-center rounded-full border border-white/15 bg-gradient-to-br from-neon-rose/30 to-neon-violet/20 backdrop-blur-sm transition-shadow group-hover:shadow-glow-rose">
              <Heart
                className={`h-14 w-14 text-white transition-transform ${
                  justSent ? "scale-125" : "group-hover:scale-110"
                }`}
                fill="currentColor"
              />
            </span>
          </motion.button>
        </div>

        {/* Feedback d'envoi */}
        <p className="mt-6 h-5 text-sm text-foreground/60">
          {justSent
            ? `💜 Pensée envoyée à ${other.label} !`
            : "Appuie sur le cœur"}
        </p>

        {/* Compteur du jour */}
        <p className="label-micro mt-1">
          {received > 0
            ? `${received} pensée${received > 1 ? "s" : ""} reçue${
                received > 1 ? "s" : ""
              } aujourd'hui`
            : "Aucune pensée reçue aujourd'hui… pour l'instant"}
        </p>

        {/* Gestion des notifications OS */}
        <div className="mt-4 flex flex-col items-center gap-2">
          {notifPermission === "default" && (
            <button
              type="button"
              onClick={handleRequestNotifPermission}
              className="btn-neon btn-xs gap-1.5 border-rose-400/50 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 shadow-[0_0_12px_rgba(244,63,94,0.2)]"
            >
              🔔 Activer les notifications d&apos;amour sur cet appareil
            </button>
          )}

          {notifPermission === "granted" && (
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 text-[11px] font-medium text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Notifications d&apos;amour actives
              </span>
              <button
                type="button"
                onClick={handleTestNotification}
                disabled={testSent}
                className="btn-ghost btn-xs text-[11px] text-foreground/70 hover:text-foreground border-white/10"
              >
                {testSent ? "Notification envoyée ✨" : "Tester 🔔"}
              </button>
            </div>
          )}

          {notifPermission === "denied" && (
            <p className="text-[11px] text-amber-400/80">
              ⚠️ Notifications bloquées par le navigateur (autorisez-les dans les paramètres de votre navigateur).
            </p>
          )}
        </div>
      </motion.section>
    </>
  );
}
