"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Lock, Calendar, Key, Sparkles, X, Plus } from "lucide-react";
import type { Envelope, EnvelopeLock } from "@/lib/open-when-data";

interface AddLetterModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (envelope: Omit<Envelope, "id">) => void;
}

const EMOJIS = ["💌", "🫂", "🌧️", "💜", "🎓", "⏳", "✈️", "☕", "🍕", "🌙", "✨", "🎉"];

export function AddLetterModal({ open, onClose, onAdd }: AddLetterModalProps) {
  const [title, setTitle] = useState("");
  const [emoji, setEmoji] = useState("💌");
  const [message, setMessage] = useState("");
  const [lockType, setLockType] = useState<"free" | "date" | "code">("free");
  const [dateStr, setDateStr] = useState("");
  const [codeStr, setCodeStr] = useState("");
  const [hintStr, setHintStr] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    let lock: EnvelopeLock = { type: "free" };
    if (lockType === "date" && dateStr) {
      lock = { type: "date", opensAt: new Date(dateStr).toISOString() };
    } else if (lockType === "code" && codeStr) {
      lock = {
        type: "code",
        code: codeStr.trim().toUpperCase(),
        hint: hintStr.trim() || undefined,
      };
    }

    onAdd({
      title: title.trim(),
      emoji,
      message: message.trim(),
      lock,
    });

    // Reset
    setTitle("");
    setMessage("");
    setLockType("free");
    setDateStr("");
    setCodeStr("");
    setHintStr("");
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/80 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="panel-tight relative z-10 w-full max-w-lg border-white/20 shadow-2xl"
          >
            <button
              type="button"
              onClick={onClose}
              className="btn-ghost btn-icon-sm absolute right-4 top-4"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-neon-rose/10 text-neon-rose">
                <Plus className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold">
                  Écrire une nouvelle lettre
                </h3>
                <p className="text-xs text-foreground/50">
                  Ajoute une enveloppe scellée pour accompagner vos 4 mois
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Titre Ouvre quand... */}
              <div>
                <label className="label-micro mb-1 block">
                  Ouvre quand...
                </label>
                <div className="flex gap-2">
                  <select
                    value={emoji}
                    onChange={(e) => setEmoji(e.target.value)}
                    className="field w-16 text-center text-lg"
                  >
                    {EMOJIS.map((em) => (
                      <option key={em} value={em}>
                        {em}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="ex: tu as le mal du pays..."
                    className="field flex-1"
                  />
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="label-micro mb-1 block">Votre lettre</label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Écris ton mot doux ici..."
                  className="field w-full resize-none py-2"
                />
              </div>

              {/* Type de verrou */}
              <div>
                <label className="label-micro mb-2 block">
                  Condition de déverrouillage
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setLockType("free")}
                    className={`btn-ghost text-xs ${
                      lockType === "free" ? "border-neon-rose text-neon-rose" : ""
                    }`}
                  >
                    <Sparkles className="h-3.5 w-3.5" /> Libre
                  </button>
                  <button
                    type="button"
                    onClick={() => setLockType("date")}
                    className={`btn-ghost text-xs ${
                      lockType === "date" ? "border-neon-cyan text-neon-cyan" : ""
                    }`}
                  >
                    <Calendar className="h-3.5 w-3.5" /> Date
                  </button>
                  <button
                    type="button"
                    onClick={() => setLockType("code")}
                    className={`btn-ghost text-xs ${
                      lockType === "code" ? "border-neon-violet text-neon-violet" : ""
                    }`}
                  >
                    <Key className="h-3.5 w-3.5" /> Code
                  </button>
                </div>
              </div>

              {/* Champs conditionnels */}
              {lockType === "date" && (
                <div>
                  <label className="label-micro mb-1 block">
                    Ouverture le (date & heure)
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={dateStr}
                    onChange={(e) => setDateStr(e.target.value)}
                    className="field w-full"
                  />
                </div>
              )}

              {lockType === "code" && (
                <div className="space-y-2">
                  <div>
                    <label className="label-micro mb-1 block">
                      Code secret (en majuscules)
                    </label>
                    <input
                      type="text"
                      required
                      value={codeStr}
                      onChange={(e) => setCodeStr(e.target.value)}
                      placeholder="ex: PARIS, AMOUR, 1204..."
                      className="field w-full uppercase"
                    />
                  </div>
                  <div>
                    <label className="label-micro mb-1 block">
                      Indice (optionnel)
                    </label>
                    <input
                      type="text"
                      value={hintStr}
                      onChange={(e) => setHintStr(e.target.value)}
                      placeholder="ex: Le nom de notre premier café..."
                      className="field w-full"
                    />
                  </div>
                </div>
              )}

              {/* Submit */}
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-ghost text-xs"
                >
                  Annuler
                </button>
                <button type="submit" className="btn-neon btn-sm">
                  <Lock className="h-3.5 w-3.5" /> Sceller l&apos;enveloppe
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
