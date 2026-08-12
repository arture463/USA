"use client";

import { useEffect, useState } from "react";
import { Download, Smartphone, X, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function InstallPwa() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showIOS, setShowIOS] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Vérifier si déjà en mode PWA standalone
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setInstalled(true);
      return;
    }

    // Détecter iOS Safari
    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    if (isIOS) {
      setShowIOS(true);
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setInstalled(true);
    }
    setDeferredPrompt(null);
  };

  if (installed || dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed bottom-20 left-4 right-4 z-40 mx-auto max-w-md"
      >
        <div className="panel-tight flex items-center justify-between gap-3 border-neon-cyan/30 bg-background/90 p-3 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neon-cyan/15 text-neon-cyan">
              <Smartphone className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground">
                Installer l&apos;application
              </p>
              <p className="text-[11px] text-foreground/60">
                Accès direct depuis votre écran d&apos;accueil
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {deferredPrompt && (
              <button
                type="button"
                onClick={handleInstallClick}
                className="btn-neon btn-sm btn-pill gap-1 py-1 text-xs"
              >
                <Download className="h-3.5 w-3.5" />
                Installer
              </button>
            )}

            {showIOS && (
              <div className="relative group">
                <span className="label-micro text-neon-rose">
                  Partager ➔ Sur l&apos;écran d&apos;accueil
                </span>
              </div>
            )}

            <button
              type="button"
              onClick={() => setDismissed(true)}
              className="btn-ghost btn-icon-sm"
              aria-label="Fermer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
