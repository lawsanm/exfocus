import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { NavLinks } from "@/components/layout/nav-links";

export function Sidebar() {
  return (
    <aside className="bg-sidebar hidden w-64 shrink-0 flex-col border-r md:flex">
      <div className="flex h-16 items-center gap-2 border-b px-5">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="bg-gradient-brand flex size-8 items-center justify-center rounded-lg text-white">
            <GraduationCap className="size-5" aria-hidden="true" />
          </span>
          exfocus
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-4">
        <NavLinks />
      </div>
    </aside>
  );
}
