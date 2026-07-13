import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/infrastructure/db/prisma";
import { getOrCreateNotificationPreferences } from "@/infrastructure/repositories/notification-repository";
import { ThemeSettingsCard } from "@/features/settings/components/theme-settings-card";
import { NotificationSettingsCard } from "@/features/settings/components/notification-settings-card";
import { StudyPreferencesCard } from "@/features/settings/components/study-preferences-card";
import { DataManagementCard } from "@/features/settings/components/data-management-card";
import { env } from "@/lib/env";

export const metadata: Metadata = {
  title: "Settings",
};

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [user, preferences] = await Promise.all([
    prisma.user.findUniqueOrThrow({
      where: { id: session.user.id },
      select: { defaultFocusMode: true, academicYear: true },
    }),
    getOrCreateNotificationPreferences(session.user.id),
  ]);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm">Theme, notifications, and your data.</p>
      </div>

      <ThemeSettingsCard />
      <StudyPreferencesCard
        defaultFocusMode={user.defaultFocusMode}
        academicYear={user.academicYear}
      />
      <NotificationSettingsCard
        preferences={preferences}
        vapidPublicKey={env.NEXT_PUBLIC_VAPID_PUBLIC_KEY}
      />
      <DataManagementCard />
    </div>
  );
}
