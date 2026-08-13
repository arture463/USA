"use client";

import { AnimatePresence, motion } from "framer-motion";
import { BookHeart } from "lucide-react";
import { useIdentity } from "@/hooks/use-identity";
import { useJournal } from "@/hooks/use-journal";
import { revealOnScroll } from "@/lib/motion";
import { SectionHeading } from "@/components/ui/section-heading";
import { JournalComposer } from "./journal-composer";
import { JournalEntryCard } from "./journal-entry";

/**
 * MODULE 5 — Journal & Capsule temporelle
 * Fil partagé en temps réel : messages, photos et notes vocales.
 * L'identité est automatiquement détectée par le fuseau horaire.
 */
export function Journal() {
  const { identity, ready } = useIdentity();
  const { entries, loading, sending, addText, addMedia } = useJournal(identity);

  return (
    <motion.section {...revealOnScroll} className="w-full">
      <SectionHeading
        eyebrow="Capsule temporelle"
        icon={BookHeart}
        title="Notre"
        titleAccent="journal"
        subtitle="Vos moments, jour après jour. Tout apparaît en temps réel des deux côtés."
        accent="violet"
      />

      <div className="space-y-4">
          <JournalComposer
            sending={sending}
            onSendText={addText}
            onSendMedia={addMedia}
          />

          {/* Le fil */}
          {loading ? (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="skeleton h-24" />
              ))}
            </div>
          ) : entries.length === 0 ? (
            <div className="panel-roomy text-center text-sm text-foreground/50">
              Rien encore… Écris le tout premier souvenir de votre journal. 💫
            </div>
          ) : (
            <motion.div layout className="space-y-3">
              <AnimatePresence initial={false}>
                {entries.map((entry) => (
                  <JournalEntryCard key={entry.id} entry={entry} />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
    </motion.section>
  );
}
