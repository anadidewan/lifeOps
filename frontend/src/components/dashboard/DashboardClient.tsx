"use client";

import { motion } from "framer-motion";
import {
  AlertTriangle,
  Angry,
  Annoyed,
  ExternalLink,
  Flame,
  Frown,
  Mail,
  Smile,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { onAuthStateChanged } from "firebase/auth";
import { useCallback, useEffect, useMemo, useState } from "react";
import { triggerIntegrationSync } from "@/lib/api/integrations";
import { getLearningInsights, getRiskInsights } from "@/lib/api/planner";
import { listMeetings } from "@/lib/api/meetings";
import { listTasks, skipTask } from "@/lib/api/tasks";
import type {
  LearningInsightResponse,
  MeetingResponse,
  RiskInsightResponse,
  TaskResponse,
} from "@/lib/api/types";
import { formatAuthError } from "@/lib/firebase/auth-flow";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { taskResponseToDetailedPlanTask } from "@/lib/dashboard/map-api-task";
import { DayPlanDetailModal } from "@/components/dashboard/DayPlanDetailModal";
import { PlanTaskRow } from "@/components/dashboard/PlanTaskRow";
import { EndOfDayReviewModal } from "@/components/dashboard/EndOfDayReviewModal";
import { GlassCard } from "@/components/landing/GlassCard";
import { getPlanDayTaskStats, sortTasksByTime } from "@/lib/dashboard/day-plan-detail";
import {
  getDemoGmailComposeHref,
  mockAiSuggestions,
  mockEmailDraft,
  mockProgress,
  mockWeeklyPlan,
  type PlanTask,
  type WeeklyBlockVariant,
} from "@/lib/mock/demo-dashboard-data";
import { cn } from "@/lib/cn";

/** Mon = 0 … Sun = 6, aligned with `mockWeeklyPlan` indices. */
function mondayFirstIndex(d: Date): number {
  return (d.getDay() + 6) % 7;
}

function startOfLocalDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function addDays(base: Date, days: number): Date {
  const x = new Date(base);
  x.setDate(x.getDate() + days);
  return x;
}

const weeklyThumbShell: Record<WeeklyBlockVariant, string> = {
  violet:
    "border-l-[3px] border-l-violet-400/95 bg-gradient-to-br from-violet-500/[0.22] via-violet-950/20 to-indigo-950/35 ring-1 ring-inset ring-violet-400/25",
  blue:
    "border-l-[3px] border-l-sky-400/95 bg-gradient-to-br from-sky-500/[0.2] via-slate-900/25 to-slate-950/40 ring-1 ring-inset ring-sky-400/22",
  neutral:
    "border-l-[3px] border-l-slate-500/90 bg-gradient-to-br from-white/[0.09] to-white/[0.02] ring-1 ring-inset ring-white/[0.1]",
};

const gmailComposeHref = getDemoGmailComposeHref();

const stressLevels = [
  { id: 0, label: "Not stressed", Icon: Smile, iconClass: "text-emerald-300" },
  { id: 1, label: "Slightly stressed", Icon: Frown, iconClass: "text-sky-300" },
  { id: 2, label: "Moderately stressed", Icon: Annoyed, iconClass: "text-amber-300" },
  { id: 3, label: "Very stressed", Icon: Angry, iconClass: "text-orange-300" },
  { id: 4, label: "Extremely stressed", Icon: Flame, iconClass: "text-red-300" },
] as const;

const cardHover = {
  y: -2,
  transition: { type: "spring" as const, stiffness: 380, damping: 28 },
};

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isSameLocalDay(iso: string, day: Date): boolean {
  const d = new Date(iso);
  return sameDay(d, day);
}

/** How far ahead (from start of today) we show tasks on the "Day plan · Today" column. */
const TODAY_PLAN_UPCOMING_DAYS = 7;

/**
 * Tasks shown for a given calendar day column.
 * - For **today**: include overdue, due today, and due within the next `TODAY_PLAN_UPCOMING_DAYS` days
 *   (so synced Canvas assignments with future due dates actually appear).
 * - For **other days**: only tasks whose deadline falls on that day (and undated tasks never appear there).
 */
function tasksForDayColumn(tasks: TaskResponse[], day: Date, isTodayColumn: boolean): TaskResponse[] {
  const todayStart = startOfLocalDay(new Date());
  const dayStart = startOfLocalDay(day);
  const columnIsToday = sameDay(dayStart, todayStart);
  const upcomingEnd = addDays(todayStart, TODAY_PLAN_UPCOMING_DAYS);

  return tasks.filter((t) => {
    if (t.status === "completed" || t.status === "skipped") return false;

    if (!t.deadline) {
      return isTodayColumn && columnIsToday;
    }

    const d = new Date(t.deadline);
    if (Number.isNaN(d.getTime())) {
      return isTodayColumn && columnIsToday;
    }

    if (isSameLocalDay(t.deadline, day)) return true;

    if (columnIsToday && isTodayColumn) {
      if (d < todayStart) return true;
      if (d >= todayStart && d < upcomingEnd) return true;
    }

    return false;
  });
}

function statsForDayTasks(
  tasks: TaskResponse[],
  day: Date,
  isToday: boolean
): { total: number; dueThatDay: number } {
  const col = tasksForDayColumn(tasks, day, isToday);
  return {
    total: col.length,
    dueThatDay: col.filter((t) => t.deadline && isSameLocalDay(t.deadline, day)).length,
  };
}

function dashboardGreetingFromEmail(email: string | null | undefined): string {
  const hour = new Date().getHours();
  const salutation =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  let local = "";
  if (email?.includes("@")) {
    local = email.split("@")[0]?.trim() ?? "";
  } else if (email?.trim()) {
    local = email.trim();
  }
  const name = local.length > 0 ? local : "there";
  return `${salutation}, ${name}`;
}

export function DashboardClient() {
  const [greetingEmail, setGreetingEmail] = useState<string | null>(null);
  const [eodOpen, setEodOpen] = useState(false);

  useEffect(() => {
    let unsub: (() => void) | undefined;
    try {
      const auth = getFirebaseAuth();
      unsub = onAuthStateChanged(auth, (user) => {
        setGreetingEmail(user?.email ?? null);
      });
    } catch {
      setGreetingEmail(null);
    }
    return () => unsub?.();
  }, []);
  const [stressLevel, setStressLevel] = useState<number | null>(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [planModalDayIndex, setPlanModalDayIndex] = useState(0);

  const [apiTasks, setApiTasks] = useState<TaskResponse[] | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [canvasSyncError, setCanvasSyncError] = useState<string | null>(null);
  const [riskInsights, setRiskInsights] = useState<RiskInsightResponse[]>([]);
  const [learningInsights, setLearningInsights] = useState<LearningInsightResponse[]>([]);
  const [meetingsLoaded, setMeetingsLoaded] = useState<MeetingResponse[]>([]);

  const refreshTasks = useCallback(async () => {
    const tasks = await listTasks();
    setApiTasks(tasks);
  }, []);

  const retryCanvasSync = useCallback(async () => {
    try {
      setCanvasSyncError(null);
      await triggerIntegrationSync("canvas");
      await refreshTasks();
    } catch (e) {
      setCanvasSyncError(formatAuthError(e));
    }
  }, [refreshTasks]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const msg = sessionStorage.getItem("lifeos_canvas_sync_error");
      if (msg) {
        setCanvasSyncError(msg);
        sessionStorage.removeItem("lifeos_canvas_sync_error");
      }
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setApiError(null);
        if (
          typeof window !== "undefined" &&
          sessionStorage.getItem("lifeos_pending_gmail_sync") === "1"
        ) {
          sessionStorage.removeItem("lifeos_pending_gmail_sync");
          try {
            await triggerIntegrationSync("gmail");
          } catch {
            /* ignore */
          }
        }
        const today = startOfLocalDay(new Date());
        const [tasks, risk, learn, meet] = await Promise.all([
          listTasks(),
          getRiskInsights(today),
          getLearningInsights(today),
          listMeetings(),
        ]);
        if (!cancelled) {
          setApiTasks(tasks);
          setRiskInsights(risk);
          setLearningInsights(learn);
          setMeetingsLoaded(meet);
        }
      } catch (e) {
        if (!cancelled) setApiError(formatAuthError(e));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSkipTask = useCallback(
    async (id: string) => {
      try {
        await skipTask(parseInt(id, 10));
        await refreshTasks();
      } catch (e) {
        setApiError(formatAuthError(e));
      }
    },
    [refreshTasks]
  );

  const rollingWeek = useMemo(() => {
    const today = startOfLocalDay(new Date());
    return Array.from({ length: 7 }, (_, i) => {
      const date = addDays(today, i);
      const block = mockWeeklyPlan[mondayFirstIndex(date)];
      const weekdayShort = date.toLocaleDateString(undefined, { weekday: "short" });
      const monthDay = date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
      return {
        date,
        block,
        weekdayShort,
        monthDay,
        isToday: i === 0,
      };
    });
  }, []);

  const planModalDay = rollingWeek[planModalDayIndex] ?? rollingWeek[0];

  const todayRolling = rollingWeek[0];

  const todayPlanTasks = useMemo(() => {
    if (!apiTasks) return [];
    const today = startOfLocalDay(new Date());
    const raw = tasksForDayColumn(apiTasks, today, true);
    return sortTasksByTime(raw.map(taskResponseToDetailedPlanTask));
  }, [apiTasks]);

  const todaysPlanTasks = todayPlanTasks;

  const eodPlanTasks: PlanTask[] = useMemo(
    () => todayPlanTasks.map((t) => ({ id: t.id, name: t.title })),
    [todayPlanTasks]
  );

  const planModalTasks = useMemo(() => {
    if (!apiTasks) return [];
    const isTodayCol = sameDay(planModalDay.date, startOfLocalDay(new Date()));
    const raw = tasksForDayColumn(apiTasks, planModalDay.date, isTodayCol);
    return sortTasksByTime(raw.map(taskResponseToDetailedPlanTask));
  }, [apiTasks, planModalDay.date]);

  const topRisk = riskInsights[0];
  const insightLines = learningInsights.slice(0, 5).map((i) => {
    const llm =
      typeof i.llm_summary === "string" && i.llm_summary.trim()
        ? i.llm_summary.trim()
        : typeof (i as { llmSummary?: unknown }).llmSummary === "string"
          ? String((i as { llmSummary: string }).llmSummary).trim()
          : "";
    return {
      key: String(i.task_id),
      text:
        llm ||
        `${i.title}: distress ${(i.distress_score * 100).toFixed(0)}%, completion ~${(i.completion_probability * 100).toFixed(0)}%`,
    };
  });

  const todayTitle = todayRolling
    ? todayRolling.date.toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "";

  const otherRollingDays = rollingWeek.slice(1);

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="relative flex flex-1 flex-col pt-16"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <motion.div
          className="absolute left-1/4 top-1/3 h-48 w-48 rounded-full bg-violet-600/12 blur-3xl"
          animate={{ opacity: [0.4, 0.65, 0.4] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute right-1/4 top-1/2 h-56 w-56 rounded-full bg-indigo-600/10 blur-3xl"
          animate={{ opacity: [0.35, 0.55, 0.35] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative z-[1] mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            "relative rounded-[1.4rem] p-[1px]",
            "bg-gradient-to-br from-white/25 via-white/[0.08] to-white/[0.03]",
            "shadow-[0_32px_90px_-28px_rgba(0,0,0,0.75),0_0_0_1px_rgba(255,255,255,0.07)_inset,0_1px_0_rgba(255,255,255,0.1)_inset]"
          )}
        >
          <div
            className={cn(
              "relative overflow-hidden rounded-[1.35rem]",
              "border border-white/[0.07]",
              "bg-[linear-gradient(165deg,rgba(18,22,38,0.92)_0%,rgba(8,10,20,0.88)_45%,rgba(6,8,18,0.94)_100%)]",
              "shadow-[inset_0_1px_0_rgba(255,255,255,0.06),inset_0_0_80px_-40px_rgba(99,102,241,0.12)]",
              "backdrop-blur-[28px] backdrop-saturate-150 ring-1 ring-inset ring-white/[0.04]"
            )}
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />

            {apiError ? (
              <div className="border-b border-red-500/25 bg-red-500/10 px-4 py-2 text-center text-xs text-red-200/95 sm:px-6">
                {apiError}
              </div>
            ) : null}
            {canvasSyncError ? (
              <div className="flex flex-col gap-2 border-b border-amber-500/25 bg-amber-500/10 px-4 py-2 text-center text-xs text-amber-100/95 sm:flex-row sm:items-center sm:justify-center sm:px-6">
                <p>
                  Canvas sync failed: {canvasSyncError}. Set{" "}
                  <code className="rounded bg-white/10 px-1">CANVAS_BASE_URL</code> in the backend{" "}
                  <code className="rounded bg-white/10 px-1">.env</code> to your school&apos;s Canvas base URL (same
                  site where you created the token), restart the API, then retry.
                </p>
                <button
                  type="button"
                  onClick={() => void retryCanvasSync()}
                  className="shrink-0 rounded-lg border border-amber-400/40 bg-amber-500/20 px-3 py-1 text-[11px] font-semibold text-amber-50 hover:bg-amber-500/30"
                >
                  Retry Canvas sync
                </button>
              </div>
            ) : null}

            <div className="relative border-b border-white/[0.06] bg-white/[0.04] px-4 py-4 backdrop-blur-sm sm:px-6 sm:py-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-400/85 shadow-[0_0_8px_rgba(248,113,113,0.45)]" />
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-400/85 shadow-[0_0_8px_rgba(251,191,36,0.35)]" />
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/85 shadow-[0_0_8px_rgba(52,211,153,0.4)]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium tracking-wide text-slate-200">
                      {dashboardGreetingFromEmail(greetingEmail)}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {apiError
                        ? "Could not load plan data."
                        : apiTasks
                          ? `${todayPlanTasks.length} task(s) today · ${meetingsLoaded.length} meeting(s) loaded`
                          : "Loading plan…"}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3 sm:self-center">
                  <motion.button
                    type="button"
                    onClick={() => setEodOpen(true)}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.99 }}
                    transition={{ type: "spring", stiffness: 400, damping: 26 }}
                    className={cn(
                      "relative w-fit overflow-hidden rounded-full border border-violet-400/45 bg-gradient-to-r from-violet-600/45 via-fuchsia-500/35 to-indigo-600/40 px-5 py-2.5 text-[13px] font-bold text-white",
                      "shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_0_32px_-6px_rgba(139,92,246,0.65),0_8px_24px_-12px_rgba(99,102,241,0.55)]",
                      "ring-2 ring-violet-400/40 ring-offset-2 ring-offset-[rgba(12,14,26,0.95)]",
                      "backdrop-blur-sm transition-[filter,box-shadow] hover:brightness-110 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_0_40px_-4px_rgba(167,139,250,0.7),0_10px_28px_-10px_rgba(99,102,241,0.6)]"
                    )}
                  >
                    <span className="relative z-[1]">Done with the day?</span>
                    <span
                      className="pointer-events-none absolute inset-0 bg-gradient-to-t from-white/10 to-transparent"
                      aria-hidden
                    />
                  </motion.button>
                </div>
              </div>
            </div>

            <div className="relative border-b border-white/[0.06] bg-white/[0.03] px-4 py-4 backdrop-blur-sm sm:px-6 sm:py-5">
              <p className="text-center text-sm font-medium text-slate-200 sm:text-left">
                How stressed do you feel?
              </p>
              <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start sm:gap-2.5">
                {stressLevels.map(({ id, label, Icon, iconClass }) => {
                  const selected = stressLevel === id;
                  return (
                    <motion.button
                      key={id}
                      type="button"
                      onClick={() => setStressLevel(id)}
                      whileHover={{ y: -1 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: "spring", stiffness: 400, damping: 26 }}
                      aria-pressed={selected}
                      className={cn(
                        "flex min-w-[5.5rem] flex-col items-center gap-1.5 rounded-xl border px-2 py-2.5 text-center transition-[border-color,background-color,box-shadow]",
                        "sm:min-w-0 sm:flex-1 sm:max-w-[7.5rem]",
                        selected
                          ? "border-violet-400/50 bg-violet-500/20 shadow-[0_0_24px_-8px_rgba(139,92,246,0.55)] ring-1 ring-violet-400/35"
                          : "border-white/[0.08] bg-white/[0.04] hover:border-white/[0.14] hover:bg-white/[0.06]"
                      )}
                    >
                      <Icon className={cn("h-5 w-5 shrink-0", iconClass)} strokeWidth={1.75} />
                      <span className="text-[10px] font-medium leading-tight text-slate-300">{label}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-5 p-4 sm:gap-6 sm:p-6">
              <div>
                <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Weekly plan
                  </span>
                  <span className="text-[10px] text-slate-600">
                    {rollingWeek[0]?.monthDay} — {rollingWeek[6]?.monthDay}
                  </span>
                </div>
                <div className="space-y-4">
                  <div
                    className={cn(
                      "overflow-hidden rounded-xl border border-white/[0.08]",
                      "bg-[linear-gradient(165deg,rgba(18,22,38,0.96)_0%,rgba(8,10,20,0.92)_50%,rgba(6,8,18,0.96)_100%)]",
                      "shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] ring-1 ring-inset ring-violet-400/20"
                    )}
                  >
                    <div className="border-b border-white/[0.06] px-4 py-3 sm:px-5 sm:py-4">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Day plan · Today
                      </p>
                      <h2 className="mt-1 text-base font-semibold tracking-tight text-white sm:text-lg">
                        {todayTitle}
                      </h2>
                      {todayRolling?.block ? (
                        <p className="mt-1 text-xs text-slate-400">{todayRolling.block.text}</p>
                      ) : null}
                    </div>
                    <div className="max-h-[min(52vh,420px)] overflow-y-auto px-4 py-3 sm:px-5 sm:py-4">
                      {apiTasks === null && !apiError ? (
                        <p className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-6 text-center text-sm text-slate-500">
                          Loading tasks…
                        </p>
                      ) : todayPlanTasks.length === 0 ? (
                        <p className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-6 text-center text-sm text-slate-500">
                          No tasks left for this day.
                        </p>
                      ) : (
                        <ul className="space-y-2">
                          {sortTasksByTime(todayPlanTasks).map((task) => (
                            <li key={task.id}>
                              <PlanTaskRow
                                task={task}
                                onRemove={() => void handleSkipTask(task.id)}
                              />
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>

                  <div className="grid min-w-0 grid-cols-6 gap-1.5 sm:gap-2">
                    {otherRollingDays.map((day, j) => {
                      const i = j + 1;
                      const block = day.block;
                      const selected = selectedDayIndex === i;
                      const stats = apiTasks
                        ? statsForDayTasks(
                            apiTasks,
                            day.date,
                            sameDay(day.date, startOfLocalDay(new Date()))
                          )
                        : getPlanDayTaskStats(mondayFirstIndex(day.date));
                      return (
                        <div key={day.date.toISOString()} className="min-w-0 text-center">
                          <div className="flex flex-col items-center gap-0.5 rounded-lg px-0.5 py-1 sm:px-1">
                            <span className="text-[9px] font-medium text-slate-500">
                              {day.weekdayShort}
                            </span>
                            <span className="text-[8px] text-slate-600">{day.monthDay}</span>
                          </div>
                          <motion.button
                            type="button"
                            aria-pressed={selected}
                            aria-label={`${day.monthDay}: ${stats.total} tasks, ${stats.dueThatDay} with deadline`}
                            onClick={() => {
                              setSelectedDayIndex(i);
                              setPlanModalDayIndex(i);
                              setPlanModalOpen(true);
                            }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.99 }}
                            transition={{ type: "spring", stiffness: 420, damping: 28 }}
                            className={cn(
                              "mt-1.5 w-full min-h-[80px] rounded-lg border p-1.5 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition-[border-color,box-shadow,background-color] sm:min-h-[92px]",
                              selected
                                ? "border-violet-400/45 bg-violet-500/[0.12] shadow-[0_0_24px_-8px_rgba(139,92,246,0.45)] ring-1 ring-violet-400/30"
                                : "border-white/[0.07] bg-white/[0.025] hover:border-white/[0.14] hover:bg-white/[0.04]"
                            )}
                          >
                            <motion.div
                              initial={{ opacity: 0, y: 4 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{
                                delay: 0.05 + j * 0.04,
                                duration: 0.38,
                                ease: [0.22, 1, 0.36, 1],
                              }}
                              className={cn(
                                "flex h-full min-h-[72px] flex-col items-stretch justify-center gap-0.5 rounded-md p-1.5 text-center sm:min-h-[80px] sm:p-2",
                                block
                                  ? weeklyThumbShell[block.variant]
                                  : "border border-white/[0.05] bg-white/[0.02]"
                              )}
                            >
                              <p className="text-[10px] font-bold tabular-nums leading-tight text-slate-50 sm:text-[11px]">
                                {stats.total}{" "}
                                <span className="font-semibold text-slate-400">tasks</span>
                              </p>
                              <p className="text-[9px] font-semibold tabular-nums text-amber-200/95 sm:text-[10px]">
                                {stats.dueThatDay}{" "}
                                <span className="font-medium text-amber-200/70">due</span>
                              </p>
                            </motion.div>
                          </motion.button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <motion.div whileHover={cardHover}>
                  <GlassCard
                    glow="none"
                    className="h-full border-amber-500/22 bg-gradient-to-br from-amber-500/[0.1] to-transparent p-4 shadow-[0_0_36px_-14px_rgba(245,158,11,0.4),inset_0_1px_0_rgba(255,255,255,0.06)]"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/22 ring-1 ring-amber-400/35 shadow-[0_0_20px_-8px_rgba(245,158,11,0.5)]">
                        <AlertTriangle className="h-4 w-4 text-amber-200" strokeWidth={2} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-amber-100/95">
                          {topRisk ? "Top risk" : "Risk insights"}
                        </p>
                        <p className="mt-1.5 text-sm font-medium text-amber-50">
                          {topRisk?.title ?? "No risk data yet"}
                        </p>
                        <p className="mt-0.5 text-xs text-amber-200/80">
                          {topRisk ? `Score ${(topRisk.risk_score * 100).toFixed(0)}%` : "Complete tasks to see scores"}
                        </p>
                        <p className="mt-1 text-[11px] text-amber-200/70">
                          {topRisk?.risk_reason ?? "Sync Canvas or Gmail, then refresh."}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <button
                            type="button"
                            className="rounded-full border border-amber-400/35 bg-amber-500/15 px-3 py-1.5 text-[10px] font-semibold text-amber-100 ring-1 ring-amber-400/20 transition-[background-color,border-color] hover:bg-amber-500/22"
                          >
                            Adjust Plan
                          </button>
                          <button
                            type="button"
                            className="rounded-full border border-white/12 bg-white/[0.06] px-3 py-1.5 text-[10px] font-semibold text-slate-200 transition-[background-color] hover:bg-white/[0.1]"
                          >
                            Draft Email
                          </button>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>

                <motion.div whileHover={cardHover}>
                  <div className="h-full rounded-2xl border border-violet-500/28 bg-gradient-to-br from-violet-500/[0.14] to-indigo-600/[0.07] p-4 shadow-[0_0_36px_-12px_rgba(139,92,246,0.45),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-3.5 w-3.5 text-violet-200" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-violet-100/95">
                        AI suggestions
                      </span>
                    </div>
                    <ul className="mt-3 space-y-2 text-xs leading-snug text-slate-100/95">
                      {(insightLines.length > 0
                        ? insightLines
                        : mockAiSuggestions.map((t, idx) => ({ key: `mock-${idx}`, text: t }))
                      ).map((row) => (
                        <li key={row.key}>{row.text}</li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <motion.div whileHover={cardHover}>
                  <a
                    href={gmailComposeHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block h-full rounded-2xl border border-white/[0.09] bg-white/[0.035] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_8px_28px_-20px_rgba(0,0,0,0.35)] backdrop-blur-xl transition-[border-color,box-shadow] duration-200 hover:border-violet-500/30 hover:shadow-[0_0_40px_-16px_rgba(139,92,246,0.35)]"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-slate-500">
                        <Mail className="h-3.5 w-3.5 text-violet-300/90" />
                        <span className="text-[10px] font-semibold uppercase tracking-wider">
                          Email draft
                        </span>
                      </div>
                      <ExternalLink className="h-3.5 w-3.5 shrink-0 text-slate-500 opacity-70 transition-opacity group-hover:opacity-100" />
                    </div>
                    <p className="mt-2 text-[10px] text-slate-500">
                      Subject: {mockEmailDraft.subject}
                    </p>
                    <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
                      Preview: {mockEmailDraft.preview}
                    </p>
                    <span className="mt-3 inline-flex text-[10px] font-medium text-violet-300/95 group-hover:text-violet-200">
                      Open in Gmail
                    </span>
                  </a>
                </motion.div>

                <motion.div whileHover={cardHover}>
                  <div className="h-full rounded-2xl border border-white/[0.09] bg-white/[0.035] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_8px_28px_-20px_rgba(0,0,0,0.35)] backdrop-blur-xl">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                        Progress
                      </span>
                      <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400">
                        <TrendingUp className="h-3 w-3" />
                        {mockProgress.consistency}
                      </span>
                    </div>
                    <p className="text-2xl font-semibold text-white">{mockProgress.hoursStudied}</p>
                    <div className="mt-3 flex h-14 items-end justify-between gap-1 px-0.5">
                      {mockProgress.barHeights.map((h, idx) => (
                        <div key={idx} className="flex h-14 min-w-0 flex-1 flex-col justify-end">
                          <motion.div
                            className="w-full rounded-t-sm bg-gradient-to-t from-violet-600/95 to-indigo-400/75 shadow-[0_-4px_16px_-4px_rgba(139,92,246,0.35)]"
                            initial={{ height: 0 }}
                            animate={{ height: Math.round((h / 100) * 52) }}
                            transition={{
                              duration: 0.75,
                              delay: 0.15 + idx * 0.05,
                              ease: [0.22, 1, 0.36, 1],
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <DayPlanDetailModal
        key={`day-plan-${planModalDay.date.getTime()}-${planModalOpen}`}
        open={planModalOpen}
        onClose={() => setPlanModalOpen(false)}
        date={planModalDay.date}
        summaryLine={planModalDay.block?.text ?? null}
        tasks={planModalTasks}
        onTaskRemove={apiTasks ? handleSkipTask : undefined}
      />

      <EndOfDayReviewModal
        open={eodOpen}
        onClose={() => setEodOpen(false)}
        todaysTasks={eodPlanTasks}
      />
    </motion.main>
  );
}
