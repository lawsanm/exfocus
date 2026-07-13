"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { SubmitButton } from "@/features/auth/components/submit-button";
import { PushToggle } from "@/features/notifications/components/push-toggle";
import { useDialogFormAction } from "@/hooks/use-dialog-form-action";
import { updateNotificationPreferencesAction } from "@/features/notifications/actions";
import type { FormActionState } from "@/lib/form-action-state";
import type { NotificationPreference } from "@/generated/prisma/client";

const initialState: FormActionState = {};

const FIELDS: { name: keyof NotificationPreference; label: string }[] = [
  { name: "studyReminders", label: "Study reminders" },
  { name: "examAlerts", label: "Exam alerts" },
  { name: "assignmentAlerts", label: "Assignment alerts" },
  { name: "dailySummary", label: "Daily summary" },
  { name: "weeklySummary", label: "Weekly summary" },
  { name: "streakReminders", label: "Streak reminders" },
];

export function NotificationSettingsCard({
  preferences,
  vapidPublicKey,
}: {
  preferences: NotificationPreference;
  vapidPublicKey: string;
}) {
  const { formAction } = useDialogFormAction(updateNotificationPreferencesAction, initialState);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form action={formAction} className="space-y-3">
          {FIELDS.map((field) => (
            <div key={field.name} className="flex items-center gap-2.5">
              <Checkbox
                id={field.name}
                name={field.name}
                defaultChecked={Boolean(preferences[field.name])}
              />
              <Label htmlFor={field.name}>{field.label}</Label>
            </div>
          ))}
          <SubmitButton className="w-auto">Save preferences</SubmitButton>
        </form>
        <Separator />
        <div className="space-y-2">
          <p className="text-sm font-medium">Browser push</p>
          <PushToggle vapidPublicKey={vapidPublicKey} initiallyEnabled={preferences.pushEnabled} />
        </div>
      </CardContent>
    </Card>
  );
}
