import { useState } from "react";
import {
  removePushSubscriptionAction,
  savePushSubscriptionAction,
} from "@/features/notifications/actions";

function urlBase64ToUint8Array(base64String: string): BufferSource {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0))).buffer as BufferSource;
}

export function usePushSubscription(vapidPublicKey: string) {
  const [isSubscribing, setIsSubscribing] = useState(false);
  const isSupported =
    typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window;

  async function subscribe() {
    if (!isSupported || !vapidPublicKey) return;
    setIsSubscribing(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") return;

      const registration = await navigator.serviceWorker.register("/sw.js");
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      await savePushSubscriptionAction(subscription.toJSON());
    } finally {
      setIsSubscribing(false);
    }
  }

  async function unsubscribe() {
    if (!isSupported) return;
    const registration = await navigator.serviceWorker.getRegistration();
    const subscription = await registration?.pushManager.getSubscription();
    await subscription?.unsubscribe();
    await removePushSubscriptionAction();
  }

  return { isSupported, isSubscribing, subscribe, unsubscribe };
}
