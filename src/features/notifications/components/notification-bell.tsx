"use client";

import Link from "next/link";
import { useTransition } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "@/features/notifications/actions";
import type { Notification } from "@/generated/prisma/client";

function timeAgo(date: Date): string {
  const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function NotificationBell({
  notifications,
  unreadCount,
}: {
  notifications: Notification[];
  unreadCount: number;
}) {
  const [, startTransition] = useTransition();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" size="icon" aria-label="Notifications" />}
      >
        <span className="relative">
          <Bell className="size-5" />
          {unreadCount > 0 && (
            <Badge className="bg-destructive text-destructive-foreground absolute -top-2 -right-2 flex size-4 items-center justify-center rounded-full p-0 text-[10px]">
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-2 py-1.5">
          <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
          {unreadCount > 0 && (
            <button
              type="button"
              className="text-primary text-xs hover:underline"
              onClick={() => startTransition(() => markAllNotificationsReadAction())}
            >
              Mark all read
            </button>
          )}
        </div>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <p className="text-muted-foreground px-2 py-6 text-center text-sm">
            You&apos;re all caught up.
          </p>
        ) : (
          <div className="max-h-80 overflow-y-auto">
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className="flex-col items-start gap-0.5"
                render={notification.relatedUrl ? <Link href={notification.relatedUrl} /> : <div />}
                onClick={() => {
                  if (!notification.read) {
                    startTransition(() => markNotificationReadAction(notification.id));
                  }
                }}
              >
                <div className="flex w-full items-center gap-2">
                  {!notification.read && (
                    <span className="bg-primary size-1.5 shrink-0 rounded-full" />
                  )}
                  <span className="truncate text-sm font-medium">{notification.title}</span>
                </div>
                <span className="text-muted-foreground text-xs">{notification.body}</span>
                <span className="text-muted-foreground text-[11px]">
                  {timeAgo(notification.createdAt)}
                </span>
              </DropdownMenuItem>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
