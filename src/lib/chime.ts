/**
 * Petit carillon synthétisé (Web Audio) joué à la réception d'une pensée.
 * Aucun fichier audio à charger : trois notes sinusoïdales (accord Do-Mi-Sol).
 * Échoue silencieusement si le navigateur bloque l'audio (autoplay policy).
 */

let ctx: AudioContext | null = null;

export function playChime(): void {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    ctx = ctx ?? new AudioCtx();
    if (ctx.state === "suspended") void ctx.resume();

    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99]; // Do5, Mi5, Sol5

    notes.forEach((freq, i) => {
      const osc = ctx!.createOscillator();
      const gain = ctx!.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;

      const start = now + i * 0.09; // léger arpège
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.14, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.7);

      osc.connect(gain).connect(ctx!.destination);
      osc.start(start);
      osc.stop(start + 0.7);
    });
  } catch {
    // Audio indisponible → on ignore, ce n'est qu'un bonus
  }
}

/** Récupère (ou crée) le contexte audio partagé. */
function audioContext(): AudioContext | null {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    ctx = ctx ?? new AudioCtx();
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

/**
 * Jingle d'évolution, en trois temps calés sur l'animation :
 *  - un bourdon qui monte pendant le clignotement (0 → 3,1 s)
 *  - un impact au flash (3,1 s)
 *  - un arpège majeur triomphal à la révélation (3,3 s)
 *
 * Entièrement synthétisé — aucun fichier à charger.
 */
export function playEvolution(): void {
  const audio = audioContext();
  if (!audio) return;

  try {
    const now = audio.currentTime;
    const out = audio.destination;

    // ── 1. Le bourdon qui monte : la tension ──
    const drone = audio.createOscillator();
    const droneGain = audio.createGain();
    drone.type = "triangle";
    drone.frequency.setValueAtTime(110, now);
    drone.frequency.exponentialRampToValueAtTime(660, now + 3.1);
    droneGain.gain.setValueAtTime(0.0001, now);
    droneGain.gain.exponentialRampToValueAtTime(0.09, now + 2.4);
    droneGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.25);
    drone.connect(droneGain).connect(out);
    drone.start(now);
    drone.stop(now + 3.3);

    // ── 2. L'impact du flash ──
    const impact = audio.createOscillator();
    const impactGain = audio.createGain();
    impact.type = "sine";
    impact.frequency.setValueAtTime(880, now + 3.1);
    impact.frequency.exponentialRampToValueAtTime(120, now + 3.5);
    impactGain.gain.setValueAtTime(0.0001, now + 3.1);
    impactGain.gain.linearRampToValueAtTime(0.2, now + 3.13);
    impactGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.6);
    impact.connect(impactGain).connect(out);
    impact.start(now + 3.1);
    impact.stop(now + 3.6);

    // ── 3. L'arpège de victoire (Do-Mi-Sol-Do, deux octaves) ──
    const fanfare = [523.25, 659.25, 783.99, 1046.5];
    fanfare.forEach((freq, i) => {
      const osc = audio.createOscillator();
      const gain = audio.createGain();
      osc.type = "triangle";
      osc.frequency.value = freq;

      const start = now + 3.35 + i * 0.11;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.13, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.9);

      osc.connect(gain).connect(out);
      osc.start(start);
      osc.stop(start + 0.95);
    });
  } catch {
    // Idem : le son n'est qu'un bonus
  }
}
