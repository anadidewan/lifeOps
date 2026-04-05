"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  LANDING_SCROLL_STORAGE_KEY,
  scheduleScrollToLandingSection,
} from "@/lib/landing-scroll";

/** Runs on the home page: restores scroll target after `/` navigation from other routes, or honors URL hash. */
export function LandingScrollRestore() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== "/") return;

    const pending = sessionStorage.getItem(LANDING_SCROLL_STORAGE_KEY);
    if (pending) {
      sessionStorage.removeItem(LANDING_SCROLL_STORAGE_KEY);
      scheduleScrollToLandingSection(pending);
      return;
    }

    const hash = typeof window !== "undefined" ? window.location.hash.slice(1) : "";
    if (hash) {
      scheduleScrollToLandingSection(hash);
    }
  }, [pathname]);

  return null;
}
