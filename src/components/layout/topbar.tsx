import { MobileNav } from "@/components/layout/mobile-nav";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { UserMenu } from "@/components/layout/user-menu";
import { NotificationBell } from "@/features/notifications/components/notification-bell";
import { GlobalSearch } from "@/features/search/components/global-search";
import {
  getUnreadNotificationCount,
  listNotifications,
} from "@/infrastructure/repositories/notification-repository";

export async function Topbar({
  userId,
  name,
  email,
  image,
}: {
  userId: string;
  name: string | null;
  email: string;
  image: string | null;
}) {
  const [notifications, unreadCount] = await Promise.all([
    listNotifications(userId, 10),
    getUnreadNotificationCount(userId),
  ]);

  return (
    <header className="bg-card flex h-16 shrink-0 items-center justify-between border-b px-4 md:px-6">
      <MobileNav />
      <div className="flex flex-1 items-center justify-end gap-2">
        <GlobalSearch />
        <NotificationBell notifications={notifications} unreadCount={unreadCount} />
        <ThemeToggle />
        <UserMenu name={name} email={email} image={image} />
      </div>
    </header>
  );
}
