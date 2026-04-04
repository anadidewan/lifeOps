"use client";

import { motion } from "framer-motion";
import {
  AlertTriangle,
  ExternalLink,
  Mail,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { useMemo, useState } from "react";
import { EndOfDayReviewModal } from "@/components/dashboard/EndOfDayReviewModal";
import { GlassCard } from "@/components/landing/GlassCard";
import { getTodaysPlanTasks } from "@/lib/dashboard/todays-plan-tasks";
import {
  getDemoDueSummaryLine,
  getDemoGmailComposeHref,
  mockAiSuggestions,
  mockEmailDraft,
  mockFailureAlert,
  mockHeader,
  mockInsights,
  mockProgress,
  mockQuickActions,
  mockWeeklyPlan,
  type WeeklyBlockVariant,
} from "@/lib/mock/demo-dashboard-data";
import { cn } from "@/lib/cn";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

const weeklyBlockStyles: Record<WeeklyBlockVariant, string> = {
  violet:
    "rounded-md bg-gradient-to-br from-violet-500/50 to-indigo-600/38 px-1 py-1 text-[8px] font-medium leading-tight text-white ring-1 ring-white/12 shadow-[0_4px_16px_-4px_rgba(139,92,246,0.45)]",
  blue:
    "rounded-md bg-gradient-to-br from-blue-500/45 to-cyan-600/28 px-1 py-1 text-[8px] font-medium text-blue-50 ring-1 ring-white/10 shadow-[0_4px_16px_-4px_rgba(59,130,246,0.35)]",
  neutral:
    "rounded-md bg-white/[0.07] px-1 py-0.5 text-[7px] text-slate-300 ring-1 ring-white/[0.05]",
};

const gmailComposeHref = getDemoGmailComposeHref();

const cardHover = {
  y: -2,
  transition: { type: "spring" as const, stiffness: 380, damping: 28 },
};

export function DashboardClient() {
  const [eodOpen, setEodOpen] = useState(false);
  const todaysPlanTasks = useMemo(() => getTodaysPlanTasks(), []);

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
                      {mockHeader.greeting}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">{getDemoDueSummaryLine()}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3 sm:self-center">
                  <motion.button
                    type="button"
                    onClick={() => setEodOpen(true)}
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.995 }}
                    transition={{ type: "spring", stiffness: 400, damping: 26 }}
                    className={cn(
                      "w-fit rounded-full border border-white/[0.12] bg-white/[0.05] px-3.5 py-2 text-[12px] font-semibold text-slate-200",
                      "shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_0_24px_-10px_rgba(139,92,246,0.35)] backdrop-blur-sm",
                      "transition-[border-color,background-color,box-shadow] hover:border-violet-400/30 hover:bg-white/[0.08]"
                    )}
                  >
                    Done with the day?
                  </motion.button>
                  <span className="w-fit rounded-full bg-emerald-500/18 px-3 py-1 text-[10px] font-semibold text-emerald-200/95 ring-1 ring-emerald-400/28 shadow-[0_0_16px_-6px_rgba(52,211,153,0.45)]">
                    {mockHeader.aiStatus}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid gap-5 p-4 sm:gap-6 sm:p-6">
              <div>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Weekly plan
                  </span>
                </div>
                <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                  {days.map((d, i) => {
                    const block = mockWeeklyPlan[i];
                    return (
                      <div key={d} className="text-center">
                        <span className="text-[9px] font-medium text-slate-600">{d}</span>
                        <div className="mt-1.5 min-h-[68px] rounded-lg border border-white/[0.07] bg-white/[0.025] p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:min-h-[80px]">
                          {block && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.96 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.2 + i * 0.055, duration: 0.35 }}
                              className={weeklyBlockStyles[block.variant]}
                            >
                              {block.text}
                            </motion.div>
                          )}
                        </div>
                      </div>
                    );
                  })}
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
                          {mockFailureAlert.label}
                        </p>
                        <p className="mt-1.5 text-sm font-medium text-amber-50">
                          {mockFailureAlert.projectName}
                        </p>
                        <p className="mt-0.5 text-xs text-amber-200/80">{mockFailureAlert.riskLevel}</p>
                        <p className="mt-1 text-[11px] text-amber-200/70">
                          {mockFailureAlert.progressMeta}
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
                      {mockAiSuggestions.map((line) => (
                        <li key={line}>{line}</li>
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

              <motion.div whileHover={cardHover}>
                <GlassCard glow="blue" className="p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    Insight
                  </p>
                  <p className="mt-2 text-sm text-slate-200">{mockInsights.line1}</p>
                  <p className="mt-1 text-sm text-slate-400">{mockInsights.line2}</p>
                </GlassCard>
              </motion.div>

              <div className="flex flex-wrap gap-2">
                {mockQuickActions.map((label) => (
                    <motion.button
                      key={label}
                      type="button"
                      whileHover={{ y: -1 }}
                      whileTap={{ scale: 0.99 }}
                      transition={{ type: "spring", stiffness: 400, damping: 26 }}
                      className={cn(
                        "rounded-full border border-white/[0.1] bg-white/[0.04] px-3.5 py-2 text-[11px] font-medium text-slate-200",
                        "shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-sm",
                        "transition-[border-color,background-color,box-shadow] hover:border-white/[0.16] hover:bg-white/[0.07]"
                      )}
                    >
                      {label}
                    </motion.button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <EndOfDayReviewModal
        open={eodOpen}
        onClose={() => setEodOpen(false)}
        todaysTasks={todaysPlanTasks}
      />
    </motion.main>
  );
}
