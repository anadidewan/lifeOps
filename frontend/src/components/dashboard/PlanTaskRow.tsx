"use client";

import { GraduationCap, Mail, Trash2 } from "lucide-react";
import {
  CATEGORY_LABEL,
  CATEGORY_STYLES,
  type DetailedPlanTask,
  type TaskSource,
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

const SOURCE_BADGE_NEUTRAL = cn(
  "rounded-full bg-white/[0.06] px-1.5 py-px text-[9px] font-medium uppercase tracking-wide",
  "text-slate-400 ring-1 ring-white/[0.08]"
);

export function PlanTaskRow({
  task,
  onRemove,
}: {
  task: DetailedPlanTask;
  onRemove?: () => void;
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
          {task.meta ? (
            <p className="mt-1 text-[11px] leading-snug text-slate-500">{task.meta}</p>
          ) : null}
        </div>
        {onRemove ? (
          <button
            type="button"
            onClick={onRemove}
            className="shrink-0 self-start rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-red-500/15 hover:text-red-300"
            aria-label={`Remove ${task.title}`}
          >
            <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
        ) : null}
      </div>
    </div>
  );
}
