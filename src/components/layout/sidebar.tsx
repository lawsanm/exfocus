"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { GraduationCap, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { NavLinks } from "@/components/layout/nav-links";
import { InlineScript } from "@/components/shared/inline-script";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const COLLAPSED_STORAGE_KEY = "exfocus:sidebar-collapsed";

/**
 * Collapse state persists to localStorage. On hard navigations the server
 * renders the expanded default and the InlineScript flips `data-collapsed`
 * before first paint; every visual difference between the two states is CSS
 * keyed off that attribute, so the lazy useState initializer and the DOM
 * always agree and hydration stays clean.
 */
export function Sidebar() {
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return localStorage.getItem(COLLAPSED_STORAGE_KEY) === "1";
    } catch {
      return false;
    }
  });

  const toggle = useCallback(() => setCollapsed((prev) => !prev), []);

  useEffect(() => {
    try {
      localStorage.setItem(COLLAPSED_STORAGE_KEY, collapsed ? "1" : "0");
    } catch {
      // localStorage unavailable (private mode) — state stays session-only.
    }
  }, [collapsed]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "b") {
        event.preventDefault();
        toggle();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [toggle]);

  return (
    <>
      <aside
        id="app-sidebar"
        data-collapsed={collapsed}
        suppressHydrationWarning
        className="group/sidebar bg-sidebar hidden h-full w-64 shrink-0 flex-col border-r transition-[width] duration-300 ease-in-out data-[collapsed=true]:w-[4.5rem] motion-reduce:transition-none md:flex"
      >
        <div className="flex h-16 shrink-0 items-center border-b px-5 group-data-[collapsed=true]/sidebar:justify-center group-data-[collapsed=true]/sidebar:px-0">
          <Link
            href="/dashboard"
            aria-label="exfocus dashboard"
            className="flex items-center gap-2 font-semibold tracking-tight"
          >
            <span className="bg-gradient-brand flex size-8 shrink-0 items-center justify-center rounded-lg text-white">
              <GraduationCap className="size-5" aria-hidden="true" />
            </span>
            <span className="truncate group-data-[collapsed=true]/sidebar:hidden">exfocus</span>
          </Link>
        </div>
        <div className="flex-1 overflow-x-hidden overflow-y-auto px-3 py-4">
          <NavLinks collapsed={collapsed} />
        </div>
        <div className="shrink-0 border-t p-3">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="ghost"
                    onClick={toggle}
                    aria-label="Toggle sidebar"
                    aria-keyshortcuts="Control+B"
                    className="text-muted-foreground w-full justify-start gap-2.5 px-3 group-data-[collapsed=true]/sidebar:justify-center group-data-[collapsed=true]/sidebar:px-0"
                  />
                }
              >
                <PanelLeftClose
                  className="size-4 group-data-[collapsed=true]/sidebar:hidden"
                  aria-hidden="true"
                />
                <PanelLeftOpen
                  className="hidden size-4 group-data-[collapsed=true]/sidebar:block"
                  aria-hidden="true"
                />
                <span className="truncate group-data-[collapsed=true]/sidebar:hidden">
                  Collapse
                </span>
              </TooltipTrigger>
              {collapsed && <TooltipContent side="right">Expand sidebar (Ctrl+B)</TooltipContent>}
            </Tooltip>
          </TooltipProvider>
        </div>
      </aside>
      <InlineScript
        html={`try{if(localStorage.getItem("${COLLAPSED_STORAGE_KEY}")==="1"){var s=document.getElementById("app-sidebar");if(s)s.setAttribute("data-collapsed","true")}}catch(e){}`}
      />
    </>
  );
}
