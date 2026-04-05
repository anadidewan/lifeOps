"use client";

import { motion } from "framer-motion";
import { ArrowRight, Mail, RefreshCw } from "lucide-react";
import { AnimatedSection } from "./AnimatedSection";
import { GlassCard } from "./GlassCard";
import { SectionHeading } from "./SectionHeading";

export function PreFailureSection() {
  return (
    <AnimatedSection id="pre-failure" className="relative py-24 sm:py-28">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_50%,rgba(139,92,246,0.12),transparent)]" />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Pre-failure intelligence"
          title="Catch the week before it breaks"
          subtitle="LifeOS does not wait for a missed deadline. It reads load plus behavior, then moves first."
        />
        <div className="mt-16 grid gap-8 lg:grid-cols-2 lg:items-stretch">
          <GlassCard className="flex flex-col justify-center p-8 sm:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400/90">
              Risk signal
            </p>
            <p className="mt-4 text-xl font-medium leading-snug text-white sm:text-2xl">
              You have{" "}
              <span className="text-violet-300">3 assignments</span> and{" "}
              <span className="text-violet-300">1 exam</span> next week. Based on
              your recent behavior, you are{" "}
              <span className="text-amber-200">at risk of missing</span> your
              database project.
            </p>
            <p className="mt-6 text-sm text-slate-500">
              Modeled from syllabus density, calendar conflict, and focus trends
              on similar work.
            </p>
          </GlassCard>

          <div className="flex flex-col gap-4">
            <motion.div
              initial={{ opacity: 0, x: 12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45 }}
            >
              <GlassCard glow="blue" className="flex gap-4 p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/15">
                  <RefreshCw className="h-4 w-4 text-blue-300" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    Reschedules deep work
                  </p>
                  <p className="mt-1 text-sm text-slate-400">
                    Moves two sessions earlier and protects a 90-minute block
                    before the due date.
                  </p>
                </div>
              </GlassCard>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: 0.08 }}
            >
              <GlassCard className="flex gap-4 p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/15">
                  <ArrowRight className="h-4 w-4 text-violet-300" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    Suggests an earlier start
                  </p>
                  <p className="mt-1 text-sm text-slate-400">
                    Nudges tonight with a scoped checklist, no generic “study
                    more” guilt.
                  </p>
                </div>
              </GlassCard>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: 0.16 }}
            >
              <GlassCard className="flex gap-4 p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/15">
                  <Mail className="h-4 w-4 text-indigo-300" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    Drafts email if needed
                  </p>
                  <p className="mt-1 text-sm text-slate-400">
                    Optional extension request, pre-written in your voice, ready
                    to review and send.
                  </p>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
}
