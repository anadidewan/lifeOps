/** Session key: pending section `id` to scroll to after client navigation to `/`. */
export const LANDING_SCROLL_STORAGE_KEY = "lifeos:landingSectionScroll";

export const landingNavSections = [
  { id: "features", label: "Features" },
  { id: "how-it-works", label: "How it works" },
  { id: "pre-failure", label: "Pre-Failure Intelligence" },
] as const;

export function scrollToLandingSection(sectionId: string) {
  document.getElementById(sectionId)?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

export function scheduleScrollToLandingSection(sectionId: string) {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => scrollToLandingSection(sectionId));
  });
}
