"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { buildEndOfDaySummary } from "@/lib/dashboard/end-of-day-summary";
import { FUTURE_ASSIGNMENTS } from "@/lib/dashboard/future-assignments";
import type { PlanTask } from "@/lib/dashboard/todays-plan-tasks";
import { cn } from "@/lib/cn";
import type {
  EndOfDayReviewPayload,
  EndOfDayReviewSummary,
  ExtraCompletedAssignment,
  TaskReviewEntry,
  TaskReviewStatus,
} from "@/types/end-of-day-review";

const SLIDER_STOPS = [0, 20, 40, 60, 80, 100] as const;

const MIN_SEARCH_LEN = 3;

const rangeClass = cn(
  "h-2 w-full cursor-pointer rounded-full appearance-none",
  "bg-gradient-to-r from-red-500/85 via-amber-400/75 to-emerald-500/85",
  "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5",
  "[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-white/25",
  "[&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-[0_0_14px_rgba(139,92,246,0.55)]",
  "[&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0",
  "[&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:shadow-[0_0_14px_rgba(139,92,246,0.55)]"
);

function normalizeTasksForSubmit(entries: TaskReviewEntry[]): TaskReviewEntry[] {
  return entries.map((t) => {
    if (t.status === "yes") return { ...t, completionValue: 100 };
    if (t.status === "no") return { ...t, completionValue: 0 };
    if (t.status === "partial") {
      const v = SLIDER_STOPS.reduce((a, b) =>
        Math.abs(b - t.completionValue) < Math.abs(a - t.completionValue) ? b : a
      );
      return { ...t, completionValue: v };
    }
    return { ...t, completionValue: 0 };
  });
}

type Phase = "form" | "summary";

type EndOfDayReviewModalProps = {
  open: boolean;
  onClose: () => void;
  todaysTasks: PlanTask[];
};

/** Mounted only while `open`; fresh state each time the modal opens (no reset effect). */
function EndOfDayReviewOverlay({
  onClose,
  todaysTasks,
}: {
  onClose: () => void;
  todaysTasks: PlanTask[];
}) {
  const [phase, setPhase] = useState<Phase>("form");
  const [taskEntries, setTaskEntries] = useState<TaskReviewEntry[]>(() =>
    todaysTasks.map((t) => ({
      taskId: t.id,
      taskName: t.name,
      status: null,
      completionValue: 40,
    }))
  );
  const [extraCompleted, setExtraCompleted] = useState<ExtraCompletedAssignment[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [summary, setSummary] = useState<EndOfDayReviewSummary | null>(null);
  const [lastPayload, setLastPayload] = useState<EndOfDayReviewPayload | null>(null);

  const setTaskStatus = useCallback((taskId: string, status: TaskReviewStatus) => {
    setTaskEntries((prev) =>
      prev.map((t) => {
        if (t.taskId !== taskId) return t;
        if (status === "yes") return { ...t, status: "yes", completionValue: 100 };
        if (status === "no") return { ...t, status: "no", completionValue: 0 };
        if (status === "partial") return { ...t, status: "partial", completionValue: 40 };
        return { ...t, status: null, completionValue: 0 };
      })
    );
  }, []);

  const setPartialValue = useCallback((taskId: string, value: number) => {
    setTaskEntries((prev) =>
      prev.map((t) => (t.taskId === taskId ? { ...t, completionValue: value } : t))
    );
  }, []);

  const searchMatches = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (q.length < MIN_SEARCH_LEN) return [];
    const selected = new Set(extraCompleted.map((e) => e.id));
    return FUTURE_ASSIGNMENTS.filter(
      (a) => !selected.has(a.id) && a.title.toLowerCase().includes(q)
    );
  }, [searchQuery, extraCompleted]);

  const addExtra = useCallback((a: ExtraCompletedAssignment) => {
    setExtraCompleted((prev) => (prev.some((p) => p.id === a.id) ? prev : [...prev, a]));
    setSearchQuery("");
  }, []);

  const canSubmit =
    taskEntries.length === 0 || taskEntries.every((t) => t.status !== null);

  const handleSubmit = () => {
    const normalized = normalizeTasksForSubmit(taskEntries);
    const payload: EndOfDayReviewPayload = {
      reviewedAt: new Date().toISOString(),
      tasks: normalized,
      extraCompleted,
    };
    setLastPayload(payload);
    setSummary(buildEndOfDaySummary(normalized, extraCompleted));
    setPhase("summary");
  };

  const handleClose = () => {
    onClose();
  };

  return (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.button
            type="button"
            aria-label="Close overlay"
            className="absolute inset-0 bg-[#030512]/75 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="eod-review-title"
            className={cn(
              "relative z-[1] max-h-[min(92vh,720px)] w-full max-w-lg overflow-y-auto rounded-[1.25rem] p-[1px]",
              "bg-gradient-to-br from-white/22 via-white/[0.08] to-white/[0.03]",
              "shadow-[0_32px_90px_-28px_rgba(0,0,0,0.85),0_0_0_1px_rgba(255,255,255,0.07)_inset]"
            )}
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          >
            <div
              className={cn(
                "rounded-[1.2rem] border border-white/[0.08]",
                "bg-[linear-gradient(165deg,rgba(18,22,38,0.96)_0%,rgba(8,10,20,0.92)_50%,rgba(6,8,18,0.96)_100%)]",
                "shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-[24px]"
              )}
            >
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-t-[1.2rem]" />

              <div className="relative flex items-start justify-between gap-3 border-b border-white/[0.06] px-5 py-4">
                <div>
                  <h2 id="eod-review-title" className="text-lg font-semibold tracking-tight text-white">
                    Done with the day?
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">Review today&apos;s tasks</p>
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-white/[0.06] hover:text-slate-300"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" strokeWidth={2} />
                </button>
              </div>

              <div className="space-y-6 px-5 py-5">
                {phase === "form" ? (
                  <>
                    <div className="space-y-5">
                      {taskEntries.length === 0 ? (
                        <p className="text-center text-xs text-slate-500">No plan tasks today</p>
                      ) : (
                        taskEntries.map((entry) => (
                          <div
                            key={entry.taskId}
                            className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                          >
                            <p className="text-[13px] font-medium text-slate-200">
                              Did you complete {entry.taskName}?
                            </p>
                            <div className="mt-3 flex flex-wrap gap-1.5">
                              {(
                                [
                                  { key: "yes" as const, label: "Yes" },
                                  { key: "partial" as const, label: "Partial" },
                                  { key: "no" as const, label: "No" },
                                ] as const
                              ).map(({ key, label }) => (
                                <button
                                  key={key}
                                  type="button"
                                  onClick={() => setTaskStatus(entry.taskId, key)}
                                  className={cn(
                                    "rounded-full px-3 py-1.5 text-[11px] font-semibold transition-[background-color,border-color,color,box-shadow]",
                                    entry.status === key
                                      ? "border border-violet-400/40 bg-violet-500/25 text-violet-100 shadow-[0_0_20px_-8px_rgba(139,92,246,0.5)]"
                                      : "border border-white/[0.1] bg-white/[0.04] text-slate-400 hover:border-white/[0.14] hover:bg-white/[0.06] hover:text-slate-200"
                                  )}
                                >
                                  {label}
                                </button>
                              ))}
                            </div>
                            <AnimatePresence initial={false}>
                              {entry.status === "partial" && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                                  className="overflow-hidden"
                                >
                                  <div className="pt-4">
                                    <input
                                      type="range"
                                      min={0}
                                      max={100}
                                      step={20}
                                      value={entry.completionValue}
                                      onChange={(e) =>
                                        setPartialValue(entry.taskId, Number(e.target.value))
                                      }
                                      className={rangeClass}
                                    />
                                    <div className="mt-2 flex justify-between text-[9px] font-medium tabular-nums text-slate-500">
                                      {SLIDER_STOPS.map((m) => (
                                        <span key={m}>{m}</span>
                                      ))}
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                        Extra completed work
                      </p>
                      <div className="relative mt-2">
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search assignments"
                          className={cn(
                            "w-full rounded-xl border border-white/[0.09] bg-white/[0.04] px-3 py-2.5 text-sm text-white",
                            "placeholder:text-slate-600 outline-none transition-[border-color,box-shadow] duration-200",
                            "focus:border-violet-500/45 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.15)]"
                          )}
                          autoComplete="off"
                        />
                        {searchQuery.trim().length >= MIN_SEARCH_LEN && searchMatches.length > 0 && (
                          <ul
                            className={cn(
                              "absolute left-0 right-0 top-[calc(100%+6px)] z-10 max-h-40 overflow-auto rounded-xl border border-white/[0.1]",
                              "bg-[rgba(10,12,24,0.96)] py-1 shadow-[0_16px_40px_-16px_rgba(0,0,0,0.8)] backdrop-blur-xl"
                            )}
                          >
                            {searchMatches.map((a) => (
                              <li key={a.id}>
                                <button
                                  type="button"
                                  className="w-full px-3 py-2 text-left text-[13px] text-slate-200 transition-colors hover:bg-white/[0.06]"
                                  onClick={() => addExtra(a)}
                                >
                                  {a.title}
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                      {extraCompleted.length > 0 && (
                        <ul className="mt-3 space-y-1.5 border-t border-white/[0.06] pt-3">
                          {extraCompleted.map((e) => (
                            <li
                              key={e.id}
                              className="text-xs font-medium text-emerald-200/90"
                            >
                              {e.title}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                      <button
                        type="button"
                        onClick={handleClose}
                        className="rounded-full border border-white/[0.12] bg-white/[0.04] px-4 py-2.5 text-[13px] font-semibold text-slate-300 transition-[background-color,border-color] hover:bg-white/[0.07]"
                      >
                        Cancel
                      </button>
                      <motion.button
                        type="button"
                        disabled={!canSubmit}
                        onClick={handleSubmit}
                        whileHover={canSubmit ? { y: -1 } : undefined}
                        whileTap={canSubmit ? { scale: 0.995 } : undefined}
                        className={cn(
                          "rounded-full px-5 py-2.5 text-[13px] font-semibold text-white",
                          "bg-gradient-to-r from-violet-600 via-violet-500 to-indigo-600",
                          "shadow-[0_0_28px_-4px_rgba(139,92,246,0.55),inset_0_1px_0_rgba(255,255,255,0.12)]",
                          "ring-1 ring-white/15 transition-[filter,opacity] hover:brightness-[1.06]",
                          !canSubmit && "cursor-not-allowed opacity-45 hover:brightness-100"
                        )}
                      >
                        Finish Review
                      </motion.button>
                    </div>
                  </>
                ) : (
                  <>
                    {summary && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                        className="space-y-3 rounded-xl border border-violet-500/20 bg-violet-500/[0.07] p-4 text-sm leading-relaxed text-slate-200"
                      >
                        <p>{summary.goalsCompleted}</p>
                        <p>{summary.needForImprovement}</p>
                        <p>{summary.tomorrowAdjustment}</p>
                        <p>{summary.extraWorkDone}</p>
                      </motion.div>
                    )}
                    {lastPayload && (
                      <p className="sr-only" aria-live="polite">
                        Review saved locally at {lastPayload.reviewedAt}
                      </p>
                    )}
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={handleClose}
                        className={cn(
                          "rounded-full px-5 py-2.5 text-[13px] font-semibold text-white",
                          "bg-gradient-to-r from-violet-600 via-violet-500 to-indigo-600",
                          "shadow-[0_0_28px_-4px_rgba(139,92,246,0.55),inset_0_1px_0_rgba(255,255,255,0.12)]",
                          "ring-1 ring-white/15 transition-[filter] hover:brightness-[1.06]"
                        )}
                      >
                        Close
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
  );
}

export function EndOfDayReviewModal({ open, onClose, todaysTasks }: EndOfDayReviewModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && <EndOfDayReviewOverlay onClose={onClose} todaysTasks={todaysTasks} />}
    </AnimatePresence>
  );
}
