"use client";

import { useId } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { NAV_GROUPS } from "@/components/layout/nav-config";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

/**
 * Shared between the desktop sidebar and the mobile sheet. Collapsed styling
 * is keyed off the sidebar's `data-collapsed` attribute (group/sidebar) so a
 * pre-hydration inline script can restore the persisted state without a
 * flash; the `collapsed` prop only gates tooltips, which never render on the
 * server.
 */
export function NavLinks({
  onNavigate,
  collapsed = false,
}: {
  onNavigate?: () => void;
  collapsed?: boolean;
}) {
  const pathname = usePathname();
  const instanceId = useId();

  return (
    <TooltipProvider>
      <nav className="flex flex-col gap-6 group-data-[collapsed=true]/sidebar:gap-4">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="flex flex-col gap-1">
            <span className="text-muted-foreground px-3 text-xs font-medium whitespace-nowrap group-data-[collapsed=true]/sidebar:hidden">
              {group.label}
            </span>
            {group.items.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger
                    render={
                      <Link
                        href={item.href}
                        onClick={onNavigate}
                        aria-current={isActive ? "page" : undefined}
                        className={cn(
                          "relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                          "group-data-[collapsed=true]/sidebar:size-10 group-data-[collapsed=true]/sidebar:justify-center group-data-[collapsed=true]/sidebar:gap-0 group-data-[collapsed=true]/sidebar:self-center group-data-[collapsed=true]/sidebar:px-0",
                          isActive
                            ? "text-primary"
                            : "text-foreground/80 hover:bg-accent hover:text-accent-foreground",
                        )}
                      />
                    }
                  >
                    {isActive && (
                      <motion.span
                        layoutId={`nav-active-${instanceId}`}
                        className="bg-primary/10 ring-primary/20 absolute inset-0 -z-10 rounded-lg ring-1"
                        transition={{ type: "spring", stiffness: 400, damping: 32 }}
                      />
                    )}
                    <Icon
                      className="size-4 shrink-0 group-data-[collapsed=true]/sidebar:size-5"
                      aria-hidden="true"
                    />
                    <span className="truncate group-data-[collapsed=true]/sidebar:sr-only">
                      {item.label}
                    </span>
                  </TooltipTrigger>
                  {collapsed && <TooltipContent side="right">{item.label}</TooltipContent>}
                </Tooltip>
              );
            })}
          </div>
        ))}
      </nav>
    </TooltipProvider>
  );
}
