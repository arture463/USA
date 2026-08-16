"use client";

import { useEffect, useState } from "react";
import {
  Download,
  Smartphone,
  X,
  Share2,
  PlusSquare,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  HelpCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPwa() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isInAppBrowser, setIsInAppBrowser] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [guideModalOpen, setGuideModalOpen] = useState(false);

  useEffect(() => {
    // 1. Vérifier si l'application est déjà lancée en mode Standalone / PWA
    if (
      typeof window !== "undefined" &&
      (window.matchMedia("(display-mode: standalone)").matches ||
        (navigator as unknown as { standalone?: boolean }).standalone === true)
    ) {
      setIsInstalled(true);
      return;
    }

    // 2. Détecter iOS
    const ua = navigator.userAgent || "";
    const isIOSDevice = /iPad|iPhone|iPod/.test(ua) && !(window as unknown as { MSStream: unknown }).MSStream;
    setIsIOS(isIOSDevice);

    // 3. Détecter navigateur intégré (Instagram, Facebook, WhatsApp, etc.)
    const inApp = /FBAN|FBAV|Instagram|Line|Twitter|Snapchat|WhatsApp/i.test(ua);
    setIsInAppBrowser(inApp);

    // 4. Écouter l'événement d'installation natif (Android, Chrome, Edge)
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // Détecter si l'installation a eu lieu avec succès
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setGuideModalOpen(false);
    };

    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === "accepted") {
          setIsInstalled(true);
        }
        setDeferredPrompt(null);
        return;
      } catch (err) {
        console.warn("Prompt error, opening visual guide:", err);
      }
    }
    // Si sur iOS ou si pas de prompt natif immédiat -> ouvrir le guide visuel interactif
    setGuideModalOpen(true);
  };

  if (isInstalled || dismissed) return null;

  return (
    <>
      {/* ── BANNIÈRE FLOTTANTE DU BAS ── */}
      <AnimatePresence>
        {!dismissed && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="fixed bottom-24 left-4 right-4 z-40 mx-auto max-w-md"
          >
            <div className="panel-tight flex items-center justify-between gap-3 border-neon-cyan/40 bg-background/95 p-3 shadow-2xl backdrop-blur-2xl ring-1 ring-white/10">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neon-cyan/15 text-neon-cyan shadow-[0_0_12px_rgba(34,211,238,0.25)]">
                  <Smartphone className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <span>Installer l&apos;application</span>
                    <span className="rounded bg-neon-cyan/20 px-1 py-0.2 text-[9px] font-mono text-neon-cyan uppercase">
                      PWA
                    </span>
                  </p>
                  <p className="text-[11px] text-foreground/60">
                    Plein écran, hors-ligne & notifications d&apos;amour
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="btn-neon btn-sm btn-pill gap-1.5 py-1.5 px-3 text-xs border-neon-cyan/60 text-neon-cyan hover:bg-neon-cyan/15 shadow-[0_0_15px_rgba(34,211,238,0.3)] shrink-0"
                >
                  <Download className="h-3.5 w-3.5" />
                  Installer
                </button>

                <button
                  type="button"
                  onClick={() => setDismissed(true)}
                  className="btn-ghost p-1.5 text-foreground/40 hover:text-foreground hover:bg-white/5 rounded-full transition-colors"
                  aria-label="Fermer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MODALE GUIDE D'INSTALLATION (iOS / Android) ── */}
      <AnimatePresence>
        {guideModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setGuideModalOpen(false)}
              className="absolute inset-0 bg-black/75 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="panel-roomy relative z-10 w-full max-w-sm border-neon-cyan/40 bg-background/95 p-6 shadow-2xl backdrop-blur-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neon-cyan/15 text-neon-cyan">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">
                      Installer US Together
                    </h3>
                    <p className="text-[11px] text-foreground/60">
                      {isIOS ? "Guide d'installation iPhone / iPad" : "Installation sur votre téléphone"}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setGuideModalOpen(false)}
                  className="btn-ghost p-1 text-foreground/40 hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Avertissement navigateur in-app */}
              {isInAppBrowser && (
                <div className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-2.5 text-xs text-amber-200">
                  ⚠️ <strong>Attention :</strong> Vous êtes dans un navigateur intégré. Touchez les 3 points en haut et choisissez <em>« Ouvrir dans Safari / Chrome »</em> pour pouvoir installer l&apos;application.
                </div>
              )}

              {/* Guide pour iPhone / iPad */}
              {isIOS ? (
                <div className="space-y-3.5">
                  <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neon-cyan/20 text-xs font-bold text-neon-cyan">
                      1
                    </span>
                    <div className="text-xs">
                      <p className="font-semibold text-foreground flex items-center gap-1.5">
                        Appuie sur Partager
                        <Share2 className="h-3.5 w-3.5 text-neon-cyan" />
                      </p>
                      <p className="text-[11px] text-foreground/60 mt-0.5">
                        C&apos;est le bouton avec le carré et la flèche vers le haut en bas de Safari.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neon-cyan/20 text-xs font-bold text-neon-cyan">
                      2
                    </span>
                    <div className="text-xs">
                      <p className="font-semibold text-foreground flex items-center gap-1.5">
                        Sur l&apos;écran d&apos;accueil
                        <PlusSquare className="h-3.5 w-3.5 text-neon-rose" />
                      </p>
                      <p className="text-[11px] text-foreground/60 mt-0.5">
                        Fais défiler la liste vers le bas et touche <em>« Sur l&apos;écran d&apos;accueil »</em> (ou <em>« Add to Home Screen »</em>).
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neon-cyan/20 text-xs font-bold text-neon-cyan">
                      3
                    </span>
                    <div className="text-xs">
                      <p className="font-semibold text-foreground flex items-center gap-1.5">
                        Valide avec « Ajouter »
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      </p>
                      <p className="text-[11px] text-foreground/60 mt-0.5">
                        Touche <em>« Ajouter »</em> en haut à droite. L&apos;icône apparaît sur votre écran d&apos;accueil comme une vraie application !
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                /* Guide pour Android / PC */
                <div className="space-y-3.5">
                  <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neon-cyan/20 text-xs font-bold text-neon-cyan">
                      1
                    </span>
                    <div className="text-xs">
                      <p className="font-semibold text-foreground">
                        Menu du navigateur (⋮)
                      </p>
                      <p className="text-[11px] text-foreground/60 mt-0.5">
                        Appuie sur les 3 points verticaux en haut à droite de Chrome.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neon-cyan/20 text-xs font-bold text-neon-cyan">
                      2
                    </span>
                    <div className="text-xs">
                      <p className="font-semibold text-foreground">
                        Installer l&apos;application
                      </p>
                      <p className="text-[11px] text-foreground/60 mt-0.5">
                        Sélectionne <em>« Installer l&apos;application »</em> ou <em>« Ajouter à l&apos;écran d&apos;accueil »</em>.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-5 flex justify-end">
                <button
                  type="button"
                  onClick={() => setGuideModalOpen(false)}
                  className="btn-neon btn-sm btn-pill text-xs w-full justify-center"
                >
                  J&apos;ai compris ! ✨
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
