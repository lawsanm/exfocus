import webpush from "web-push";
import { env } from "@/lib/env";

let configured = false;

function ensureConfigured() {
  if (configured) return;
  if (env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && env.VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(
      "mailto:support@exfocus.app",
      env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      env.VAPID_PRIVATE_KEY,
    );
  }
  configured = true;
}

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
}

export interface StoredPushSubscription {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

/** No-ops silently if VAPID keys aren't configured yet, or the stored
 * subscription is malformed/expired — push is a best-effort enhancement
 * on top of the in-app notification list, never the only delivery path. */
export async function sendPushNotification(
  subscription: StoredPushSubscription,
  payload: PushPayload,
): Promise<void> {
  ensureConfigured();
  if (!env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || !env.VAPID_PRIVATE_KEY) return;

  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload));
  } catch (error) {
    console.error("Push notification failed to send:", error);
  }
}
