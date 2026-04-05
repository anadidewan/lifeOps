/**
 * Demo-only dashboard dataset. Swap or gate with DEMO_MODE when wiring a real API.
 */

import type { ExtraCompletedAssignment } from "@/types/end-of-day-review";

/** Flip to false when live data replaces this module. */
export const DEMO_MODE = true as const;

export interface PlanTask {
  id: string;
  name: string;
}

export type WeeklyBlockVariant = "violet" | "blue" | "neutral";

export interface WeeklyPlanBlock {
  /** Full line for modals and assistive labels */
  text: string;
  /** Short title on the week thumbnail */
  headline: string;
  /** Secondary line: duration, focus, or format */
  subline?: string;
  variant: WeeklyBlockVariant;
}

export const mockHeader = {
  greeting: "Good evening, Saksham",
  aiStatus: "AI Status: Analyzing",
} as const;

export const mockTodaysTasks: PlanTask[] = [
  { id: "demo-today-db", name: "Database Project" },
  { id: "demo-today-econ", name: "Econ Assignment" },
  { id: "demo-today-meeting", name: "Meeting Review" },
  { id: "demo-today-calc", name: "Calculus Problem Set" },
  { id: "demo-today-ai-slides", name: "AI Society Slides" },
];

export function getDemoDueSummaryLine(atRiskCount = 1): string {
  return `${mockTodaysTasks.length} due today • ${atRiskCount} at risk`;
}

export const mockWeeklyPlan: WeeklyPlanBlock[] = [
  {
    text: "Economics — problem set & readings",
    headline: "Economics",
    subline: "2h · deep work",
    variant: "violet",
  },
  {
    text: "Database project — schema & queries",
    headline: "DB project",
    subline: "3h · build",
    variant: "blue",
  },
  {
    text: "Meeting review — notes & follow-ups",
    headline: "Meeting",
    subline: "Review & email",
    variant: "neutral",
  },
  {
    text: "Calculus — problem set",
    headline: "Calculus",
    subline: "2h · practice",
    variant: "blue",
  },
  {
    text: "AI Society — slide deck",
    headline: "AI Society",
    subline: "Slides draft",
    variant: "violet",
  },
  {
    text: "Weekly revision — light review",
    headline: "Revision",
    subline: "Light session",
    variant: "neutral",
  },
  {
    text: "Buffer — catch up or rest",
    headline: "Buffer day",
    subline: "Flexible",
    variant: "neutral",
  },
];

export const mockFailureAlert = {
  label: "Failure Detection Alert",
  projectName: "Database Project",
  riskLevel: "High risk",
  progressMeta: "20% done • 2 days left",
} as const;

export const mockAiSuggestions: string[] = [
  "Start DB earlier",
  "Move Econ to evening",
  "Reduce Thursday load",
];

export const mockEmailDraft = {
  subject: "Extension Request",
  preview: "Dear Professor, I wanted to reach out regarding...",
  bodyForMail:
    "Dear Professor, I wanted to reach out regarding the assignment timeline.\n\nThank you,\nSaksham\n",
} as const;

export const mockProgress = {
  hoursStudied: "6h studied",
  consistency: "+12% consistency",
  barHeights: [40, 65, 45, 80, 55, 90, 72] as const,
} as const;

export const mockFutureAssignments: ExtraCompletedAssignment[] = [
  { id: "asg-econ-quiz-4", title: "Econ Quiz 4" },
  { id: "asg-calc-hw-7", title: "Calc Homework 7" },
  { id: "asg-db-er", title: "Database ER Diagram" },
  { id: "asg-team-pitch", title: "Team Pitch Deck" },
  { id: "asg-sustainability", title: "Sustainability Reflection" },
  { id: "asg-ai-society-notes", title: "AI Society Speaker Notes" },
  { id: "asg-marketing-case", title: "Marketing Case Review" },
  { id: "asg-python-lab", title: "Python Lab Submission" },
  { id: "asg-resume", title: "Resume Revision" },
  { id: "asg-meeting-followup", title: "Meeting Follow Up Notes" },
  { id: "asg-midterm-review", title: "Midterm Review Sheet" },
  { id: "asg-stats-practice", title: "Statistics Practice Set" },
  { id: "asg-orgo-lab", title: "Organic Chemistry Lab Report" },
  { id: "asg-phil-reading", title: "Philosophy Reading Summary" },
  { id: "asg-linalg-ps", title: "Linear Algebra Problem Set" },
  { id: "asg-capstone-outline", title: "Capstone Outline Draft" },
];

export const mockDashboardData = {
  DEMO_MODE,
  header: mockHeader,
  getDueSummaryLine: getDemoDueSummaryLine,
  todaysTasks: mockTodaysTasks,
  weeklyPlan: mockWeeklyPlan,
  failureAlert: mockFailureAlert,
  aiSuggestions: mockAiSuggestions,
  emailDraft: mockEmailDraft,
  progress: mockProgress,
  futureAssignments: mockFutureAssignments,
} as const;

export function getDemoGmailComposeHref(): string {
  return (
    "https://mail.google.com/mail/?view=cm&fs=1&su=" +
    encodeURIComponent(mockEmailDraft.subject) +
    "&body=" +
    encodeURIComponent(mockEmailDraft.bodyForMail)
  );
}
