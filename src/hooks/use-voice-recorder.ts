"use client";

import { useCallback, useRef, useState } from "react";

/**
 * Enregistreur de note vocale (API MediaRecorder du navigateur).
 * Gère la permission micro, le chrono, et produit un Blob audio/webm.
 *
 * États : idle → (start) recording → (stop) blob prêt → (reset) idle
 */
export function useVoiceRecorder() {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  const start = useCallback(async () => {
    setError(null);
    setBlob(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const audio = new Blob(chunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });
        setBlob(audio);
        // Libère le micro (éteint le voyant du navigateur)
        stream.getTracks().forEach((t) => t.stop());
      };

      recorder.start();
      recorderRef.current = recorder;
      setRecording(true);
      setSeconds(0);
      timerRef.current = window.setInterval(
        () => setSeconds((s) => s + 1),
        1000
      );
    } catch {
      setError("Micro inaccessible. Autorise l'accès au microphone.");
    }
  }, []);

  const stop = useCallback(() => {
    recorderRef.current?.stop();
    setRecording(false);
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    setBlob(null);
    setSeconds(0);
    setError(null);
  }, []);

  return { recording, seconds, blob, error, start, stop, reset };
}
