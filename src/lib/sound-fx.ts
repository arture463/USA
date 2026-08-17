/**
 * ─────────────────────────────────────────────────────────────────────────────
 * US TOGETHER — SOUND DESIGN ENGINE (Synthesized Next-Gen Web Audio API)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Moteur audio interactif 100% synthétisé (zéro latence, zéro fichier externe).
 * Conçu pour être doux, chaleureux, poétique et gratifiant.
 *
 * Échoue silencieusement si l'autoplay est bloqué par le navigateur.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  try {
    if (typeof window === "undefined") return null;
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

    if (!AudioContextClass) return null;

    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === "suspended") {
      void audioCtx.resume();
    }
    return audioCtx;
  } catch {
    return null;
  }
}

/**
 * 1. PENSÉE ENVOYÉE (Heart Pulse & Cosmic Ping)
 * Pulsation cardiaque douce + étincelle montante vers l'Atlantique
 */
export function playThoughtSentSound(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.12, now);
    masterGain.connect(ctx.destination);

    // Warm sub pulse (battement de cœur)
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = "sine";
    subOsc.frequency.setValueAtTime(130, now);
    subOsc.frequency.exponentialRampToValueAtTime(65, now + 0.18);

    subGain.gain.setValueAtTime(0, now);
    subGain.gain.linearRampToValueAtTime(0.35, now + 0.02);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    subOsc.connect(subGain).connect(masterGain);
    subOsc.start(now);
    subOsc.stop(now + 0.25);

    // Cosmic sparkle (envolée céleste)
    const sparkleNotes = [587.33, 880, 1174.66]; // D5, A5, D6
    sparkleNotes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + 0.05 + idx * 0.04);

      const start = now + 0.05 + idx * 0.04;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.12, start + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.45);

      osc.connect(gain).connect(masterGain);
      osc.start(start);
      osc.stop(start + 0.5);
    });
  } catch {}
}

/**
 * 2. PENSÉE REÇUE (Carillon Romantique Céleste)
 * Arpège pentatonique riche et cristallin avec résonance douce
 */
export function playThoughtReceivedSound(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.15, now);
    masterGain.connect(ctx.destination);

    // Warm Low-pass filter pour velouter le son
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(3200, now);
    filter.connect(masterGain);

    // Accord Céleste Romantique (F# Major 9 / Dream chord: F#4, A#4, C#5, F5, G#5)
    const chord = [369.99, 466.16, 554.37, 698.46, 830.61];

    chord.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const harmonicOsc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      harmonicOsc.type = "triangle";

      osc.frequency.setValueAtTime(freq, now);
      harmonicOsc.frequency.setValueAtTime(freq * 2, now);

      const start = now + idx * 0.08;
      const duration = 0.9 + idx * 0.15;

      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.18, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

      osc.connect(gain);
      harmonicOsc.connect(gain);
      gain.connect(filter);

      osc.start(start);
      harmonicOsc.start(start);
      osc.stop(start + duration);
      harmonicOsc.stop(start + duration);
    });
  } catch {}
}

/**
 * 3. OBJECTIF VALIDÉ / BUCKET LIST ACCOMPLIE
 * Pop tactile gratifiant + carillon majeur lumineux
 */
export function playObjectiveCompleteSound(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;

    // Pop d'impact tactile
    const popOsc = ctx.createOscillator();
    const popGain = ctx.createGain();
    popOsc.type = "sine";
    popOsc.frequency.setValueAtTime(600, now);
    popOsc.frequency.exponentialRampToValueAtTime(180, now + 0.05);

    popGain.gain.setValueAtTime(0.2, now);
    popGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    popOsc.connect(popGain).connect(ctx.destination);
    popOsc.start(now);
    popOsc.stop(now + 0.07);

    // Carillon doré triomphal (G5 -> B5 -> D6 -> G6)
    const bells = [783.99, 987.77, 1174.66, 1567.98];
    bells.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now);

      const start = now + 0.04 + idx * 0.06;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.14, start + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.6);

      osc.connect(gain).connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.65);
    });
  } catch {}
}

/**
 * 4. SÉANCE DE SPORT ENREGISTRÉE (Power Level-Up)
 * Fanfare dynamique & synthwave valorisante
 */
export function playGymWorkoutLoggedSound(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const fanfare = [
      { freq: 440.0, delay: 0 },       // A4
      { freq: 554.37, delay: 0.08 },   // C#5
      { freq: 659.25, delay: 0.16 },   // E5
      { freq: 880.0, delay: 0.26 },    // A5 (Triomphe)
    ];

    fanfare.forEach(({ freq, delay }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now + delay);

      const start = now + delay;
      const length = delay === 0.26 ? 0.8 : 0.4;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.18, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + length);

      osc.connect(gain).connect(ctx.destination);
      osc.start(start);
      osc.stop(start + length + 0.05);
    });
  } catch {}
}

/**
 * 5. HIGH-FIVE / ENCOURAGEMENT SPORT
 * Cliquetis de gourde & étincelle énergique
 */
export function playHighFiveSound(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const clinkNotes = [1046.5, 1318.51, 1567.98]; // C6, E6, G6
    clinkNotes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);

      const start = now + idx * 0.05;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.12, start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.35);

      osc.connect(gain).connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.4);
    });
  } catch {}
}

/**
 * 6. LETTRE OUVERTE (Intime & Céleste)
 * Chuchotement de papier & scintillement délicat
 */
export function playLetterOpenSound(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + idx * 0.09);

      const start = now + idx * 0.09;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.11, start + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.75);

      osc.connect(gain).connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.8);
    });
  } catch {}
}

/**
 * 7. ENVOI SOUVENIR DANS LE JOURNAL
 * Swoosh feutré et note de validation douce
 */
export function playJournalMessageSentSound(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.12, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.4);
  } catch {}
}

/**
 * 8. FRIANDISE CRÉATURE PARTAGÉE
 * Bulle mignonne et vibrato joueur
 */
export function playPetFeedSound(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const bubbleNotes = [659.25, 987.77, 1318.51]; // E5 -> B5 -> E6
    bubbleNotes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq * 0.85, now + idx * 0.06);
      osc.frequency.exponentialRampToValueAtTime(freq, now + idx * 0.06 + 0.04);

      const start = now + idx * 0.06;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.15, start + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.3);

      osc.connect(gain).connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.35);
    });
  } catch {}
}

/**
 * 9. ÉVOLUTION MAJEURE DE LA CRÉATURE (Cinématique Triomphale)
 */
export function playEvolution(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const out = ctx.destination;

    // 1. Bourdon de tension montant
    const drone = ctx.createOscillator();
    const droneGain = ctx.createGain();
    drone.type = "triangle";
    drone.frequency.setValueAtTime(110, now);
    drone.frequency.exponentialRampToValueAtTime(660, now + 3.1);
    droneGain.gain.setValueAtTime(0.0001, now);
    droneGain.gain.exponentialRampToValueAtTime(0.1, now + 2.4);
    droneGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.25);
    drone.connect(droneGain).connect(out);
    drone.start(now);
    drone.stop(now + 3.3);

    // 2. Impact du flash
    const impact = ctx.createOscillator();
    const impactGain = ctx.createGain();
    impact.type = "sine";
    impact.frequency.setValueAtTime(880, now + 3.1);
    impact.frequency.exponentialRampToValueAtTime(120, now + 3.5);
    impactGain.gain.setValueAtTime(0.0001, now + 3.1);
    impactGain.gain.linearRampToValueAtTime(0.25, now + 3.13);
    impactGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.6);
    impact.connect(impactGain).connect(out);
    impact.start(now + 3.1);
    impact.stop(now + 3.6);

    // 3. Arpège de révélation triomphal (Do-Mi-Sol-Do-Mi)
    const fanfare = [523.25, 659.25, 783.99, 1046.5, 1318.51];
    fanfare.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.value = freq;

      const start = now + 3.35 + i * 0.1;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.16, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 1.1);

      osc.connect(gain).connect(out);
      osc.start(start);
      osc.stop(start + 1.15);
    });
  } catch {}
}

/**
 * 10. DÉCLENCHEUR PHOTO BE REAL (Camera Shutter & Flash)
 */
export function playCameraShutterSound(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;

    // Bruit de déclencheur mécanique (click-clack)
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(1400, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.04);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.06);

    // Deuxième battement mécanique
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(1800, now + 0.07);
    osc2.frequency.exponentialRampToValueAtTime(300, now + 0.12);

    gain2.gain.setValueAtTime(0.25, now + 0.07);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.13);

    osc2.connect(gain2).connect(ctx.destination);
    osc2.start(now + 0.07);
    osc2.stop(now + 0.14);
  } catch {}
}

/**
 * 11. RÉVÉLATION DOUBLE PHOTO US REAL (Chime magique)
 */
export function playBeRealRevealSound(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const notes = [587.33, 739.99, 880, 1174.66]; // D5, F#5, A5, D6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now + idx * 0.07);

      const start = now + idx * 0.07;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.14, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.8);

      osc.connect(gain).connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.85);
    });
  } catch {}
}

/**
 * 12. RÉVÉLATION TÉLÉPATHIE (Laser Scifi & Synth Chime)
 */
export function playTelepathyRevealSound(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;

    // 1. Onde de balayage laser ascendant
    const laser = ctx.createOscillator();
    const laserGain = ctx.createGain();
    laser.type = "sawtooth";
    laser.frequency.setValueAtTime(220, now);
    laser.frequency.exponentialRampToValueAtTime(1760, now + 0.35);

    laserGain.gain.setValueAtTime(0.12, now);
    laserGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(800, now);
    filter.frequency.exponentialRampToValueAtTime(4000, now + 0.35);

    laser.connect(filter).connect(laserGain).connect(ctx.destination);
    laser.start(now);
    laser.stop(now + 0.42);

    // 2. Éclat d'harmonie céleste (Do - Mi - Sol - Si - Do)
    const chord = [523.25, 659.25, 783.99, 987.77, 1046.5];
    chord.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now + 0.25 + idx * 0.06);

      const start = now + 0.25 + idx * 0.06;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.15, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.9);

      osc.connect(gain).connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.95);
    });
  } catch {}
}

/** Rétrocompatibilité : playChime pointe sur le carillon enrichi */
export const playChime = playThoughtReceivedSound;
