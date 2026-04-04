/**
 * Detailed day plan items for the weekly plan modal.
 * Demo data simulates tasks synced from Canvas and email; replace with API slices later.
 */

export type TaskSource = "canvas" | "email";

export type TaskCategory =
  | "assignment"
  | "meeting"
  | "quiz"
  | "reading"
  | "project"
  | "exam";

export interface DetailedPlanTask {
  id: string;
  title: string;
  source: TaskSource;
  category: TaskCategory;
  /** Minutes from midnight (local), for sorting. */
  timeMinutes: number;
  /** Short display time, e.g. "9:00 AM". */
  timeLabel: string;
  /** Optional line (e.g. course code, sender). */
  meta?: string;
}

export const CATEGORY_LABEL: Record<TaskCategory, string> = {
  meeting: "Meeting",
  exam: "Exam",
  quiz: "Quiz",
  assignment: "Assignment",
  project: "Project",
  reading: "Reading",
};

/** Colored border + badge for category; Canvas/Email use neutral pills in the UI. */
export const CATEGORY_STYLES: Record<
  TaskCategory,
  { border: string; badge: string }
> = {
  meeting: {
    border: "border-l-cyan-400/90",
    badge:
      "bg-cyan-500/18 text-cyan-100 ring-cyan-400/38 shadow-[0_0_12px_-4px_rgba(34,211,238,0.35)]",
  },
  exam: {
    border: "border-l-rose-400/90",
    badge:
      "bg-rose-500/18 text-rose-100 ring-rose-400/38 shadow-[0_0_12px_-4px_rgba(251,113,133,0.3)]",
  },
  quiz: {
    border: "border-l-violet-400/90",
    badge:
      "bg-violet-500/18 text-violet-100 ring-violet-400/38 shadow-[0_0_12px_-4px_rgba(167,139,250,0.35)]",
  },
  assignment: {
    border: "border-l-amber-400/90",
    badge:
      "bg-amber-500/18 text-amber-100 ring-amber-400/38 shadow-[0_0_12px_-4px_rgba(251,191,36,0.3)]",
  },
  project: {
    border: "border-l-indigo-400/90",
    badge:
      "bg-indigo-500/18 text-indigo-100 ring-indigo-400/38 shadow-[0_0_12px_-4px_rgba(129,140,248,0.35)]",
  },
  reading: {
    border: "border-l-emerald-400/90",
    badge:
      "bg-emerald-500/18 text-emerald-100 ring-emerald-400/38 shadow-[0_0_12px_-4px_rgba(52,211,153,0.3)]",
  },
};

/** Mon = 0 … Sun = 6 */
export const DETAILED_PLAN_BY_MONDAY_INDEX: Record<number, DetailedPlanTask[]> = {
  0: [
    {
      id: "d-mon-1",
      title: "Chapter 6 reading quiz",
      source: "canvas",
      category: "quiz",
      timeMinutes: 9 * 60 + 30,
      timeLabel: "9:30 AM",
      meta: "ECON 201",
    },
    {
      id: "d-mon-2",
      title: "TA office hours — Econ",
      source: "email",
      category: "meeting",
      timeMinutes: 11 * 60,
      timeLabel: "11:00 AM",
      meta: "From: econ-tas@school.edu",
    },
    {
      id: "d-mon-3",
      title: "Microeconomics Problem Set 4",
      source: "canvas",
      category: "assignment",
      timeMinutes: 14 * 60 + 30,
      timeLabel: "2:30 PM",
      meta: "ECON 201 · due 11:59 PM",
    },
  ],
  1: [
    {
      id: "d-tue-1",
      title: "Lab safety acknowledgement",
      source: "canvas",
      category: "assignment",
      timeMinutes: 8 * 60,
      timeLabel: "8:00 AM",
      meta: "CS 340",
    },
    {
      id: "d-tue-2",
      title: "Group sync on schema",
      source: "email",
      category: "meeting",
      timeMinutes: 10 * 60 + 15,
      timeLabel: "10:15 AM",
      meta: "Thread: Re: ER draft",
    },
    {
      id: "d-tue-3",
      title: "Database ER diagram milestone",
      source: "canvas",
      category: "project",
      timeMinutes: 15 * 60 + 45,
      timeLabel: "3:45 PM",
      meta: "CS 340 · submission portal",
    },
  ],
  2: [
    {
      id: "d-wed-1",
      title: "Advisor check-in",
      source: "email",
      category: "meeting",
      timeMinutes: 13 * 60,
      timeLabel: "1:00 PM",
      meta: "Calendar invite",
    },
    {
      id: "d-wed-2",
      title: "Weekly reading reflection",
      source: "canvas",
      category: "reading",
      timeMinutes: 19 * 60,
      timeLabel: "7:00 PM",
      meta: "PHIL 120",
    },
  ],
  3: [
    {
      id: "d-thu-1",
      title: "Question about HW 7",
      source: "email",
      category: "reading",
      timeMinutes: 9 * 60 + 45,
      timeLabel: "9:45 AM",
      meta: "From: calc-help@school.edu",
    },
    {
      id: "d-thu-2",
      title: "Calculus WebAssign — Series",
      source: "canvas",
      category: "assignment",
      timeMinutes: 11 * 60 + 30,
      timeLabel: "11:30 AM",
      meta: "MATH 221",
    },
    {
      id: "d-thu-3",
      title: "Midterm review session",
      source: "canvas",
      category: "exam",
      timeMinutes: 19 * 60,
      timeLabel: "7:00 PM",
      meta: "MATH 221",
    },
  ],
  4: [
    {
      id: "d-fri-1",
      title: "Speaker panel RSVP",
      source: "email",
      category: "meeting",
      timeMinutes: 10 * 60,
      timeLabel: "10:00 AM",
      meta: "From: ai-society@club.edu",
    },
    {
      id: "d-fri-2",
      title: "AI Society slide deck",
      source: "canvas",
      category: "project",
      timeMinutes: 16 * 60 + 15,
      timeLabel: "4:15 PM",
      meta: "Club org · shared drive",
    },
  ],
  5: [
    {
      id: "d-sat-1",
      title: "Weekly digest — deadlines",
      source: "email",
      category: "assignment",
      timeMinutes: 8 * 60 + 30,
      timeLabel: "8:30 AM",
      meta: "Notifications summary",
    },
    {
      id: "d-sat-2",
      title: "Catch-up: incomplete modules",
      source: "canvas",
      category: "reading",
      timeMinutes: 14 * 60,
      timeLabel: "2:00 PM",
      meta: "Multiple courses",
    },
  ],
  6: [
    {
      id: "d-sun-1",
      title: "Week ahead prep",
      source: "email",
      category: "meeting",
      timeMinutes: 10 * 60,
      timeLabel: "10:00 AM",
      meta: "Personal reminder",
    },
    {
      id: "d-sun-2",
      title: "Syllabus scan for next week",
      source: "canvas",
      category: "reading",
      timeMinutes: 17 * 60,
      timeLabel: "5:00 PM",
      meta: "All active courses",
    },
  ],
};

/** @param mondayFirstIndex — Mon = 0 … Sun = 6 */
export function getDetailedPlanTasksForWeekday(mondayFirstIndex: number): DetailedPlanTask[] {
  return DETAILED_PLAN_BY_MONDAY_INDEX[mondayFirstIndex] ?? [];
}

export function sortTasksByTime(tasks: DetailedPlanTask[]): DetailedPlanTask[] {
  return [...tasks].sort((a, b) => a.timeMinutes - b.timeMinutes);
}
