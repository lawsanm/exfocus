import { z } from "zod";

export const notificationPreferencesSchema = z.object({
  studyReminders: z.boolean(),
  examAlerts: z.boolean(),
  assignmentAlerts: z.boolean(),
  dailySummary: z.boolean(),
  weeklySummary: z.boolean(),
  streakReminders: z.boolean(),
});

export type NotificationPreferencesInput = z.infer<typeof notificationPreferencesSchema>;

export const pushSubscriptionSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string(),
  }),
});
