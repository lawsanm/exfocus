import { MobileNav } from "@/components/layout/mobile-nav";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { UserMenu } from "@/components/layout/user-menu";

export function Topbar({
  name,
  email,
  image,
}: {
  name: string | null;
  email: string;
  image: string | null;
}) {
  return (
    <header className="bg-background flex h-16 shrink-0 items-center justify-between border-b px-4 md:px-6">
      <MobileNav />
      <div className="flex flex-1 items-center justify-end gap-2">
        <ThemeToggle />
        <UserMenu name={name} email={email} image={image} />
      </div>
    </header>
  );
}
