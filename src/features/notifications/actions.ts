"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/infrastructure/db/prisma";
import { requireUserId } from "@/lib/auth/require-user";
import {
  notificationPreferencesSchema,
  pushSubscriptionSchema,
  type NotificationPreferencesInput,
} from "@/features/notifications/schemas";
import type { FormActionState } from "@/lib/form-action-state";

export async function markNotificationReadAction(notificationId: string): Promise<void> {
  const userId = await requireUserId();
  await prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data: { read: true },
  });
  revalidatePath("/", "layout");
}

export async function markAllNotificationsReadAction(): Promise<void> {
  const userId = await requireUserId();
  await prisma.notification.updateMany({ where: { userId, read: false }, data: { read: true } });
  revalidatePath("/", "layout");
}

export async function savePushSubscriptionAction(subscription: unknown): Promise<void> {
  const userId = await requireUserId();
  const parsed = pushSubscriptionSchema.parse(subscription);

  await prisma.notificationPreference.upsert({
    where: { userId },
    create: { userId, pushEnabled: true, pushSubscription: parsed },
    update: { pushEnabled: true, pushSubscription: parsed },
  });
}

export async function removePushSubscriptionAction(): Promise<void> {
  const userId = await requireUserId();
  await prisma.notificationPreference.upsert({
    where: { userId },
    create: { userId, pushEnabled: false, pushSubscription: undefined },
    update: { pushEnabled: false, pushSubscription: undefined },
  });
}

export async function updateNotificationPreferencesAction(
  _prevState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const userId = await requireUserId();
  const raw: NotificationPreferencesInput = {
    studyReminders: formData.get("studyReminders") === "on",
    examAlerts: formData.get("examAlerts") === "on",
    assignmentAlerts: formData.get("assignmentAlerts") === "on",
    dailySummary: formData.get("dailySummary") === "on",
    weeklySummary: formData.get("weeklySummary") === "on",
    streakReminders: formData.get("streakReminders") === "on",
  };
  const parsed = notificationPreferencesSchema.safeParse(raw);
  if (!parsed.success) return { error: "Invalid preferences." };

  await prisma.notificationPreference.upsert({
    where: { userId },
    create: { userId, ...parsed.data },
    update: parsed.data,
  });

  revalidatePath("/settings");
  return { success: true };
}
