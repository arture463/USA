"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail } from "lucide-react";
import { ENVELOPES, type Envelope } from "@/lib/open-when-data";
import { useOpenedEnvelopes } from "@/hooks/use-opened-envelopes";
import { useClock } from "@/hooks/use-clock";
import { revealOnScroll } from "@/lib/motion";
import { SectionHeading } from "@/components/ui/section-heading";
import { EnvelopeCard } from "./envelope-card";
import { LetterModal } from "./letter-modal";

/**
 * MODULE 4 — "Open When..."
 * Grille d'enveloppes numériques verrouillées (libre / date / code)
 * + modale lettre avec confettis.
 */
export function OpenWhen() {
  const now = useClock();
  const { unlocked, markUnlocked } = useOpenedEnvelopes();
  const [selected, setSelected] = useState<Envelope | null>(null);

  // Skeleton pendant l'hydratation (cohérent avec les autres modules)
  if (!now) {
    return (
      <section className="w-full">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
          {ENVELOPES.map((e) => (
            <div key={e.id} className="skeleton h-36" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <motion.section {...revealOnScroll} className="w-full">
      <SectionHeading
        eyebrow="Courrier du cœur"
        icon={Mail}
        title="Open"
        titleAccent="when..."
        subtitle="Des lettres qui t'attendent. Certaines se méritent."
        accent="rose"
      />

      {/* Grille d'enveloppes — 2 colonnes mobile, 3 desktop */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        {ENVELOPES.map((envelope) => (
          <EnvelopeCard
            key={envelope.id}
            envelope={envelope}
            isUnlocked={unlocked.has(envelope.id)}
            now={now}
            onOpen={setSelected}
          />
        ))}
      </div>

      {/* Modale lettre / saisie de code */}
      <LetterModal
        envelope={selected}
        isUnlocked={selected ? unlocked.has(selected.id) : false}
        onUnlock={markUnlocked}
        onClose={() => setSelected(null)}
      />
    </motion.section>
  );
}
