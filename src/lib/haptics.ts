/**
 * Vibration tactile (API Vibration du navigateur).
 * Fonctionne surtout sur Android/Chrome ; iOS Safari ne la supporte pas
 * (échec silencieux, ce n'est qu'un bonus sensoriel).
 */

/** Motif "battement de cœur" à la réception d'une pensée. */
export function vibrateHeartbeat(): void {
  try {
    navigator.vibrate?.([50, 80, 140]);
  } catch {
    /* non supporté → on ignore */
  }
}

/** Petit tick de confirmation à l'envoi. */
export function vibrateTick(): void {
  try {
    navigator.vibrate?.(35);
  } catch {
    /* non supporté → on ignore */
  }
}
