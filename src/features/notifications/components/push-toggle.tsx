"use client";

import { useState } from "react";
import { Bell, BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePushSubscription } from "@/features/notifications/hooks/use-push-subscription";

export function PushToggle({
  vapidPublicKey,
  initiallyEnabled,
}: {
  vapidPublicKey: string;
  initiallyEnabled: boolean;
}) {
  const { isSupported, isSubscribing, subscribe, unsubscribe } =
    usePushSubscription(vapidPublicKey);
  const [enabled, setEnabled] = useState(initiallyEnabled);

  if (!vapidPublicKey) {
    return (
      <p className="text-muted-foreground text-sm">
        Push notifications aren&apos;t configured for this deployment yet.
      </p>
    );
  }

  if (!isSupported) {
    return (
      <p className="text-muted-foreground text-sm">
        Push notifications aren&apos;t supported in this browser.
      </p>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Button
        variant={enabled ? "outline" : "default"}
        size="sm"
        disabled={isSubscribing}
        onClick={async () => {
          if (enabled) {
            await unsubscribe();
            setEnabled(false);
          } else {
            await subscribe();
            setEnabled(true);
          }
        }}
      >
        {enabled ? <BellOff className="size-4" /> : <Bell className="size-4" />}
        {enabled ? "Disable browser push" : "Enable browser push"}
      </Button>
    </div>
  );
}
