"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ImagePlus, Mic, Send, Square, X, Loader2 } from "lucide-react";
import { useVoiceRecorder } from "@/hooks/use-voice-recorder";

/**
 * Barre de composition du journal.
 * Trois modes fusionnés :
 *  - texte (avec photo optionnelle en pièce jointe)
 *  - photo (aperçu + légende)
 *  - note vocale (enregistrement → aperçu → envoi)
 */

interface JournalComposerProps {
  sending: boolean;
  onSendText: (body: string) => Promise<void>;
  onSendMedia: (file: Blob, kind: "photo" | "voice", body?: string) => Promise<void>;
}

/** Formate un nombre de secondes en M:SS. */
function fmt(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

/** Hauteur max du champ avant défilement interne (= max-h-32 de Tailwind). */
const TEXTAREA_MAX_PX = 128;

export function JournalComposer({
  sending,
  onSendText,
  onSendMedia,
}: JournalComposerProps) {
  const [text, setText] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);

  const voice = useVoiceRecorder();

  /**
   * Ajuste la hauteur du champ à son contenu.
   * Sans ça, `rows={1}` + `resize-none` figeait le champ sur une seule ligne :
   * un message de plusieurs lignes défilait dans 44 px de haut.
   */
  const autoSize = () => {
    const el = textRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, TEXTAREA_MAX_PX)}px`;
  };

  const handlePickPhoto = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const clearPhoto = () => {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhoto(null);
    setPhotoPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  /** Vide le champ ET rend sa hauteur d'origine (sinon il reste étiré). */
  const resetText = () => {
    setText("");
    const el = textRef.current;
    if (el) el.style.height = "auto";
  };

  const handleSend = async () => {
    if (sending) return;
    if (photo) {
      await onSendMedia(photo, "photo", text);
      clearPhoto();
      resetText();
    } else if (text.trim()) {
      await onSendText(text);
      resetText();
    }
  };

  const sendVoice = async () => {
    if (!voice.blob) return;
    await onSendMedia(voice.blob, "voice");
    voice.reset();
  };

  const canSend = !sending && (text.trim().length > 0 || photo !== null);

  return (
    <div className="panel-tight">
      {/* ── Mode enregistrement vocal ── */}
      <AnimatePresence mode="wait">
        {voice.recording ? (
          <motion.div
            key="recording"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-between gap-3 px-1 py-2"
          >
            <span className="flex items-center gap-2 text-sm text-neon-rose">
              <span className="h-3 w-3 animate-pulse rounded-full bg-neon-rose" />
              Enregistrement… {fmt(voice.seconds)}
            </span>
            <button
              type="button"
              onClick={voice.stop}
              className="btn-neon btn-md btn-pill from-neon-rose to-neon-rose"
            >
              <Square className="h-4 w-4" fill="currentColor" />
              Stop
            </button>
          </motion.div>
        ) : voice.blob ? (
          /* ── Aperçu de la note vocale avant envoi ── */
          <motion.div
            key="voice-preview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3"
          >
            <audio
              controls
              src={URL.createObjectURL(voice.blob)}
              className="h-10 flex-1"
            />
            <button
              type="button"
              onClick={voice.reset}
              aria-label="Annuler"
              className="btn-ghost btn-icon-sm btn-pill"
            >
              <X className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={sendVoice}
              disabled={sending}
              aria-label="Envoyer la note vocale"
              className="btn-neon btn-icon-sm btn-pill"
            >
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </motion.div>
        ) : (
          /* ── Mode normal : texte + photo + actions ── */
          <motion.div
            key="normal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Aperçu photo attachée */}
            <AnimatePresence>
              {photoPreview && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="relative mb-3 inline-block"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photoPreview}
                    alt="Aperçu"
                    className="max-h-40 rounded-inner object-cover"
                  />
                  <button
                    type="button"
                    onClick={clearPhoto}
                    aria-label="Retirer la photo"
                    className="focus-ring absolute -right-2 -top-2 rounded-full bg-black/70 p-1 text-white backdrop-blur"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-end gap-2">
              <textarea
                ref={textRef}
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                  autoSize();
                }}
                onKeyDown={(e) => {
                  // Entrée = envoyer, Maj+Entrée = nouvelle ligne
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void handleSend();
                  }
                }}
                rows={1}
                placeholder="Raconte ta journée, un détail, une pensée…"
                className="field max-h-32 min-h-[44px] flex-1 resize-none"
              />

              {/* Photo */}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handlePickPhoto}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                aria-label="Ajouter une photo"
                className="btn-ghost btn-icon rounded-inner hover:text-neon-cyan"
              >
                <ImagePlus className="h-5 w-5" />
              </button>

              {/* Voix */}
              <button
                type="button"
                onClick={voice.start}
                aria-label="Enregistrer une note vocale"
                className="btn-ghost btn-icon rounded-inner hover:text-neon-rose"
              >
                <Mic className="h-5 w-5" />
              </button>

              {/* Envoyer */}
              <button
                type="button"
                onClick={handleSend}
                disabled={!canSend}
                aria-label="Envoyer"
                className="btn-neon btn-icon rounded-inner"
              >
                {sending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </button>
            </div>

            {voice.error && (
              <p className="mt-2 text-xs text-destructive">{voice.error}</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
