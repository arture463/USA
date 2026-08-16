/**
 * Gestionnaire unifié et universel des notifications (Desktop, Android, iOS PWA)
 */

export function isNotificationSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export function getNotificationPermission(): NotificationPermission {
  if (!isNotificationSupported()) return "denied";
  try {
    return Notification.permission;
  } catch {
    return "default";
  }
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) return "denied";

  try {
    // 1. Enregistrer le Service Worker en amont (indispensable pour mobile)
    if ("serviceWorker" in navigator) {
      try {
        await navigator.serviceWorker.register("/sw.js");
      } catch (err) {
        console.warn("SW register error:", err);
      }
    }

    // 2. Demander la permission système
    const permission = await Notification.requestPermission();
    return permission;
  } catch (err) {
    console.error("Erreur lors de la demande de permission de notification:", err);
    return "denied";
  }
}

export async function sendAppNotification(
  title: string,
  options?: {
    body?: string;
    icon?: string;
    tag?: string;
    badge?: string;
  }
): Promise<boolean> {
  if (!isNotificationSupported()) return false;
  if (getNotificationPermission() !== "granted") return false;

  const defaultOptions = {
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    ...options,
  };

  // 1. Essayer via Service Worker (requis sur mobile / PWA iOS / Android)
  if ("serviceWorker" in navigator) {
    try {
      let reg = await navigator.serviceWorker.getRegistration();
      if (!reg) {
        reg = await navigator.serviceWorker.register("/sw.js");
      }
      if (reg && typeof reg.showNotification === "function") {
        await reg.showNotification(title, defaultOptions);
        return true;
      }
    } catch (swErr) {
      console.warn("ServiceWorker showNotification fallback:", swErr);
    }
  }

  // 2. Fallback pour navigateurs Desktop classiques
  try {
    new Notification(title, defaultOptions);
    return true;
  } catch (directErr) {
    console.warn("Direct Notification error:", directErr);
    return false;
  }
}
