"use client";

import { motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Mail,
  Timer,
} from "lucide-react";
import { AnimatedSection } from "./AnimatedSection";
import { GlassCard } from "./GlassCard";
import { SectionHeading } from "./SectionHeading";

export function DashboardPreview() {
  return (
    <AnimatedSection id="dashboard" className="py-24 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Product preview"
          title="One surface. Full situational awareness."
          subtitle="A calm command center for plans, risk, drafts, and momentum, designed like software you would actually trust."
        />
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.65 }}
          className="relative mt-16"
        >
          <div className="absolute -inset-1 rounded-[1.75rem] bg-gradient-to-r from-violet-600/25 via-indigo-600/15 to-blue-600/20 blur-xl" />
          <GlassCard className="relative overflow-hidden">
            <div className="flex flex-col border-b border-white/[0.06] bg-white/[0.03] px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]" />
                <span className="text-sm font-medium text-white">Good evening, Saksham</span>
                <span className="hidden text-xs text-slate-500 sm:inline">
                  3 due today • 1 at risk
                </span>
              </div>
              <div className="mt-2 flex gap-2 sm:mt-0">
                <span className="rounded-lg bg-white/[0.06] px-2 py-1 text-[10px] font-medium text-slate-300">
                  Dashboard
                </span>
                <span className="rounded-lg bg-violet-500/15 px-2 py-1 text-[10px] font-medium text-violet-200">
                  Planner
                </span>
              </div>
            </div>
            <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="border-b border-white/[0.06] p-4 sm:p-6 lg:border-b-0 lg:border-r">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  PLAN
                </p>
                <div className="mt-4 grid grid-cols-7 gap-2 text-center text-[10px] text-slate-500">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                    <span key={d}>{d}</span>
                  ))}
                </div>
                <div className="mt-2 grid min-h-[140px] grid-cols-7 gap-2">
                  {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                      key={i}
                      className="rounded-lg border border-white/[0.05] bg-white/[0.02] p-1.5"
                    >
                      {i === 2 ? (
                        <div className="space-y-1">
                          <div className="rounded bg-violet-500/30 px-1 py-0.5 text-[9px] text-violet-100">
                            Mon: Econ (2h)
                          </div>
                          <div className="rounded bg-blue-500/25 px-1 py-0.5 text-[9px] text-blue-100">
                            Tue: DB (3h)
                          </div>
                        </div>
                      ) : i === 4 ? (
                        <div className="rounded bg-amber-500/25 px-1 py-0.5 text-[9px] text-amber-100">
                          Wed: Review
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/[0.06] px-2.5 py-1 text-[10px] text-slate-300">
                    <Timer className="h-3 w-3 text-cyan-300" />
                    Fix My Week
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/[0.06] px-2.5 py-1 text-[10px] text-slate-300">
                    <CheckCircle2 className="h-3 w-3 text-emerald-300" />
                    Rebalance
                  </span>
                </div>
              </div>
              <div className="flex flex-col">
                <div className="border-b border-white/[0.06] p-4 sm:p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    RISK
                  </p>
                  <div className="mt-3 flex items-start gap-3 rounded-xl border border-amber-500/25 bg-amber-500/10 p-3">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
                    <div>
                      <p className="text-xs font-medium text-amber-100">
                        Database Project
                      </p>
                      <p className="mt-1 text-[11px] leading-relaxed text-amber-200/70">
                        High risk 20% done • 2 days left Actions: Adjust Plan Draft Email
                      </p>
                    </div>
                  </div>
                </div>
                <div className="grid flex-1 grid-cols-1 gap-0 sm:grid-cols-2">
                  <div className="border-b border-white/[0.06] p-4 sm:border-b-0 sm:border-r">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      EMAIL
                    </p>
                    <div className="mt-2 flex items-center gap-2 text-[10px] text-slate-500">
                      <Mail className="h-3.5 w-3.5" />
                      Subject: Extension Request
                    </div>
                    <p className="mt-2 text-[11px] leading-relaxed text-slate-400">
                      Preview: Dear Professor...
                    </p>
                    <button
                      type="button"
                      className="mt-3 inline-flex items-center gap-1 text-[10px] font-medium text-violet-300"
                    >
                      Draft Email
                      <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      PROGRESS
                    </p>
                    <p className="mt-3 text-2xl font-semibold text-white">6h studied</p>
                    <p className="text-[11px] text-slate-500">+12% consistency</p>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400"
                        initial={{ width: 0 }}
                        whileInView={{ width: "78%" }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </AnimatedSection>
  );
}
