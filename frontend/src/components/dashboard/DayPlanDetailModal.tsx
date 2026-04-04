"use client";

import { AnimatePresence, motion } from "framer-motion";
import { GraduationCap, Mail, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  CATEGORY_LABEL,
  CATEGORY_STYLES,
  type DetailedPlanTask,
  type TaskSource,
  sortTasksByTime,
} from "@/lib/dashboard/day-plan-detail";
import { cn } from "@/lib/cn";

const SOURCE_LABEL: Record<TaskSource, string> = {
  canvas: "Canvas",
  email: "Email",
};

const SOURCE_ICON: Record<TaskSource, typeof GraduationCap> = {
  canvas: GraduationCap,
  email: Mail,
};

/** Matches the former neutral category pill — used for Canvas / Email. */
const SOURCE_BADGE_NEUTRAL = cn(
  "rounded-full bg-white/[0.06] px-1.5 py-px text-[9px] font-medium uppercase tracking-wide",
  "text-slate-400 ring-1 ring-white/[0.08]"
);

type DayPlanDetailModalProps = {
  open: boolean;
  onClose: () => void;
  /** Calendar date for this plan column */
  date: Date;
  /** Short summary from weekly strip (e.g. "Mon: Econ (2h)") */
  summaryLine: string | null;
  tasks: DetailedPlanTask[];
};

export function DayPlanDetailModal({
  open,
  onClose,
  date,
  summaryLine,
  tasks,
}: DayPlanDetailModalProps) {
  const [localTasks, setLocalTasks] = useState<DetailedPlanTask[]>(() => tasks);

  const sortedTasks = useMemo(() => sortTasksByTime(localTasks), [localTasks]);

  const removeTask = (id: string) => {
    setLocalTasks((prev) => prev.filter((t) => t.id !== id));
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
                        <TaskRow task={task} onRemove={() => removeTask(task.id)} />
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

function TaskRow({
  task,
  onRemove,
}: {
  task: DetailedPlanTask;
  onRemove: () => void;
}) {
  const cat = CATEGORY_STYLES[task.category];
  const Icon = SOURCE_ICON[task.source];
  return (
    <div
      className={cn(
        "rounded-xl border border-white/[0.07] bg-white/[0.03] pl-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]",
        "border-l-2",
        cat.border
      )}
    >
      <div className="flex gap-2 py-2 pr-1 sm:pr-2">
        <div className="flex w-[52px] shrink-0 flex-col justify-center border-r border-white/[0.06] pr-2 text-right">
          <span className="text-[11px] font-semibold tabular-nums text-slate-300">{task.timeLabel}</span>
        </div>
        <div className="mt-0.5 shrink-0 text-slate-500">
          <Icon className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
        </div>
        <div className="min-w-0 flex-1 py-0.5">
          <div className="flex flex-wrap items-start gap-1.5 pr-1">
            <span className="text-[13px] font-medium leading-snug text-slate-100">{task.title}</span>
            <span
              className={cn(
                "rounded-full px-1.5 py-px text-[9px] font-semibold uppercase tracking-wide ring-1",
                cat.badge
              )}
            >
              {CATEGORY_LABEL[task.category]}
            </span>
            <span className={SOURCE_BADGE_NEUTRAL}>{SOURCE_LABEL[task.source]}</span>
          </div>
          {task.meta && (
            <p className="mt-1 text-[11px] leading-snug text-slate-500">{task.meta}</p>
          )}
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="shrink-0 self-start rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-red-500/15 hover:text-red-300"
          aria-label={`Remove ${task.title}`}
        >
          <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
