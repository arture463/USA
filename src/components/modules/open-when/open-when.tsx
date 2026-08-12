"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Plus } from "lucide-react";
import type { Envelope } from "@/lib/open-when-data";
import { useOpenedEnvelopes } from "@/hooks/use-opened-envelopes";
import { useEnvelopes } from "@/hooks/use-envelopes";
import { useClock } from "@/hooks/use-clock";
import { revealOnScroll } from "@/lib/motion";
import { SectionHeading } from "@/components/ui/section-heading";
import { EnvelopeCard } from "./envelope-card";
import { LetterModal } from "./letter-modal";
import { AddLetterModal } from "./add-letter-modal";

/**
 * MODULE 4 — "Open When..."
 * Grille d'enveloppes numériques verrouillées (libre / date / code)
 * + modale lettre avec confettis + création de nouvelles enveloppes.
 */
export function OpenWhen() {
  const now = useClock();
  const { envelopes, addEnvelope } = useEnvelopes();
  const { unlocked, markUnlocked } = useOpenedEnvelopes();
  const [selected, setSelected] = useState<Envelope | null>(null);
  const [adding, setAdding] = useState(false);

  // Skeleton pendant l'hydratation (cohérent avec les autres modules)
  if (!now) {
    return (
      <section className="w-full">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
          {envelopes.slice(0, 6).map((e) => (
            <div key={e.id} className="skeleton h-36" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <motion.section {...revealOnScroll} className="w-full">
      <div className="flex items-center justify-between gap-4">
        <SectionHeading
          eyebrow="Courrier du cœur"
          icon={Mail}
          title="Open"
          titleAccent="when..."
          subtitle="Des lettres qui t'attendent. Certaines se méritent."
          accent="rose"
        />

        <button
          type="button"
          onClick={() => setAdding(true)}
          className="btn-ghost btn-sm btn-pill shrink-0 gap-1.5 text-xs text-neon-rose hover:border-neon-rose/40"
        >
          <Plus className="h-3.5 w-3.5" />
          Écrire une lettre
        </button>
      </div>

      {/* Grille d'enveloppes — 2 colonnes mobile, 3 desktop */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        {envelopes.map((envelope) => (
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

      {/* Modale d'ajout de nouvelle lettre */}
      <AddLetterModal
        open={adding}
        onClose={() => setAdding(false)}
        onAdd={addEnvelope}
      />
    </motion.section>
  );
}
