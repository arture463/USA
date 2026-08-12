"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useModal } from "@/hooks/use-modal";
import { SPRING } from "@/lib/motion";

/**
 * Visionneuse plein écran pour une photo du journal.
 * Fond très flouté, image agrandie, fermeture au clic / Échap.
 */

interface PhotoLightboxProps {
  src: string | null;
  alt: string;
  open: boolean;
  onClose: () => void;
}

export function PhotoLightbox({ src, alt, open, onClose }: PhotoLightboxProps) {
  // Échap + défilement verrouillé + focus piégé (hook partagé)
  const overlayRef = useModal<HTMLDivElement>(open, onClose);

  return (
    <AnimatePresence>
      {open && src && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          ref={overlayRef}
          role="dialog"
          aria-modal="true"
          aria-label={alt}
          tabIndex={-1}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 p-4 outline-none backdrop-blur-xl"
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="btn-ghost btn-icon-sm btn-pill absolute right-4 top-4"
          >
            <X className="h-5 w-5" />
          </button>

          <motion.img
            src={src}
            alt={alt}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            transition={SPRING}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[88vh] max-w-full rounded-card object-contain shadow-2xl"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
