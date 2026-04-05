"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { PlanTaskRow } from "@/components/dashboard/PlanTaskRow";
import {
  sortTasksByTime,
  type DetailedPlanTask,
} from "@/lib/dashboard/day-plan-detail";
import { cn } from "@/lib/cn";

type DayPlanDetailModalProps = {
  open: boolean;
  onClose: () => void;
  /** Calendar date for this plan column */
  date: Date;
  /** Short summary from weekly strip (e.g. "Mon: Econ (2h)") */
  summaryLine: string | null;
  tasks: DetailedPlanTask[];
  /** When set (e.g. for today’s plan), removals sync back to the parent dashboard list. */
  onTasksChange?: (tasks: DetailedPlanTask[]) => void;
};

export function DayPlanDetailModal({
  open,
  onClose,
  date,
  summaryLine,
  tasks,
  onTasksChange,
}: DayPlanDetailModalProps) {
  const [localTasks, setLocalTasks] = useState<DetailedPlanTask[]>(() => tasks);

  const sortedTasks = useMemo(() => sortTasksByTime(localTasks), [localTasks]);

  const removeTask = (id: string) => {
    setLocalTasks((prev) => {
      const next = prev.filter((t) => t.id !== id);
      onTasksChange?.(next);
      return next;
    });
  };

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

  const title = date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <AnimatePresence>
      {open && (
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
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="day-plan-title"
            className={cn(
              "relative z-[1] max-h-[min(92vh,640px)] w-full max-w-lg overflow-y-auto rounded-[1.25rem] p-[1px]",
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
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-[1.2rem] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

              <div className="relative flex items-start justify-between gap-3 border-b border-white/[0.06] px-5 py-4">
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Day plan
                  </p>
                  <h2 id="day-plan-title" className="mt-1 text-lg font-semibold tracking-tight text-white">
                    {title}
                  </h2>
                  {summaryLine && (
                    <p className="mt-1 text-xs text-slate-400">{summaryLine}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="shrink-0 rounded-lg p-2 text-slate-500 transition-colors hover:bg-white/[0.06] hover:text-slate-300"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" strokeWidth={2} />
                </button>
              </div>

              <div className="px-5 py-4">
                {sortedTasks.length === 0 ? (
                  <p className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-6 text-center text-sm text-slate-500">
                    No tasks left for this day.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {sortedTasks.map((task) => (
                      <li key={task.id}>
                        <PlanTaskRow task={task} onRemove={() => removeTask(task.id)} />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
