/**
 * ─────────────────────────────────────────────────────────────────────────────
 * US TOGETHER — GESTIONNAIRE DE NOTIFICATIONS SYSTÈME (OS / PWA / BROWSER)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Fonctionne sur :
 *  - macOS & Windows (Chrome, Safari, Firefox, Edge, Brave)
 *  - Android (Chrome, Firefox, Brave, Samsung Internet)
 *  - iOS / iPhone (Safari PWA avec iOS 16.4+ via « Sur l'écran d'accueil »)
 */

export type AppNotificationStatus =
  | "granted"        // Activées et opérationnelles
  | "default"        // Pas encore demandées
  | "denied"         // Bloquées dans le navigateur
  | "ios_need_pwa"   // iPhone détecté mais pas encore en mode PWA plein écran
  | "unsupported";   // Navigateur trop ancien ne supportant pas les notifications

/** Détecte si l'appareil est sous iOS (iPhone / iPad / iPod) */
export function isIOS(): boolean {
  if (typeof window === "undefined") return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    !(window as unknown as { MSStream: unknown }).MSStream
  );
}

/** Détecte si l'application est exécutée en mode PWA plein écran (Standalone) */
export function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

/** Vérifie si l'API Notification est disponible sur cet environnement */
export function isNotificationSupported(): boolean {
  if (typeof window === "undefined") return false;
  return "Notification" in window;
}

/** Retourne le statut précis des notifications pour guider l'utilisateur */
export function getAppNotificationStatus(): AppNotificationStatus {
  if (typeof window === "undefined") return "unsupported";

  // Cas spécial iOS : Apple n'expose l'API Notification que quand le site est ajouté à l'écran d'accueil
  if (isIOS() && !isStandalone() && !("Notification" in window)) {
    return "ios_need_pwa";
  }

  if (!isNotificationSupported()) {
    return isIOS() ? "ios_need_pwa" : "unsupported";
  }

  try {
    const perm = Notification.permission;
    if (perm === "granted") return "granted";
    if (perm === "denied") return "denied";
    return "default";
  } catch {
    return "default";
  }
}

/** Rétrocompatibilité */
export function getNotificationPermission(): NotificationPermission {
  if (!isNotificationSupported()) return "denied";
  try {
    return Notification.permission;
  } catch {
    return "default";
  }
}

/**
 * Demande la permission d'envoi des notifications à l'utilisateur
 */
export async function requestNotificationPermission(): Promise<AppNotificationStatus> {
  if (typeof window === "undefined") return "unsupported";

  // Enregistrer le Service Worker en amont (requis sur mobile)
  if ("serviceWorker" in navigator) {
    try {
      await navigator.serviceWorker.register("/sw.js");
    } catch (err) {
      console.warn("ServiceWorker register warning:", err);
    }
  }

  if (isIOS() && !isStandalone() && !("Notification" in window)) {
    return "ios_need_pwa";
  }

  if (!("Notification" in window) || typeof Notification.requestPermission !== "function") {
    return "unsupported";
  }

  try {
    const permission = await Notification.requestPermission();
    return permission as AppNotificationStatus;
  } catch (err) {
    console.error("Erreur requestNotificationPermission:", err);
    return "denied";
  }
}

/**
 * Déclenche une notification système (Desktop + Mobile via ServiceWorker)
 */
export async function sendAppNotification(
  title: string,
  options?: {
    body?: string;
    icon?: string;
    tag?: string;
    badge?: string;
    data?: string;
  }
): Promise<boolean> {
  if (typeof window === "undefined") return false;

  const status = getAppNotificationStatus();
  if (status !== "granted") return false;

  const defaultOptions: NotificationOptions & { renotify?: boolean; vibrate?: number[] } = {
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    tag: options?.tag || "us-together-notif",
    renotify: true,
    vibrate: [200, 100, 200],
    ...options,
  };

  // 1. Priorité au Service Worker (indispensable sur mobile Android & PWA iOS)
  if ("serviceWorker" in navigator) {
    try {
      const reg = await navigator.serviceWorker.ready;
      if (reg && typeof reg.showNotification === "function") {
        await reg.showNotification(title, defaultOptions);
        return true;
      }
    } catch (swErr) {
      console.warn("SW showNotification fallback to native:", swErr);
    }
  }

  // 2. Fallback direct pour les navigateurs de bureau
  try {
    new Notification(title, defaultOptions);
    return true;
  } catch (directErr) {
    console.warn("Direct Notification constructor failed:", directErr);
    return false;
  }
}
