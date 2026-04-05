"use client";

import { motion } from "framer-motion";
import {
  AlertTriangle,
  BarChart3,
  Brain,
  CalendarClock,
  Mail,
  Sparkles,
} from "lucide-react";
import { AnimatedSection } from "./AnimatedSection";
import { GlassCard } from "./GlassCard";
import { SectionHeading } from "./SectionHeading";
import { cn } from "@/lib/cn";

const capabilityHoverEase = [0.22, 1, 0.36, 1] as const;
const capabilityHoverDuration = 0.35;

const features = [
  {
    icon: CalendarClock,
    title: "Autonomous Academic Planner",
    desc: "Extracts deadlines from syllabi and builds your semester roadmap plus adaptive weekly study plans.",
  },
  {
    icon: Brain,
    title: "Smart Study Scheduler",
    desc: "Dynamically shifts study blocks by workload, course difficulty, and how you actually behave.",
  },
  {
    icon: Mail,
    title: "Automatic Email Generation",
    desc: "Drafts polished emails to professors for extensions or clarifications, before small issues snowball.",
  },
  {
    icon: Sparkles,
    title: "Behavior-Aware Intelligence",
    desc: "Reads screen-time and app patterns to surface distraction and procrastination, without judgment.",
  },
  {
    icon: AlertTriangle,
    title: "Deadline Risk Detection",
    desc: "Predicts missed deadlines early, with clear reasons and concrete recovery paths.",
  },
  {
    icon: BarChart3,
    title: "Weekly Performance Reports",
    desc: "Productivity insights, completed work, and targeted improvements every week.",
  },
];

export function Features() {
  return (
    <AnimatedSection id="features" className="py-24 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Capabilities"
          title="Everything your semester needs, wired into one autonomous agent"
          subtitle="Not another checklist. LifeOS predicts, plans, and acts across your data so school runs itself more calmly."
        />
        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              className="group relative h-full"
              whileHover={{ y: -6, scale: 1.012 }}
              transition={{
                duration: capabilityHoverDuration,
                ease: capabilityHoverEase,
              }}
            >
              <div
                className="pointer-events-none absolute -inset-1 z-0 rounded-2xl bg-gradient-to-r from-violet-600/25 via-indigo-600/15 to-blue-600/20 opacity-70 blur-xl transition-opacity duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:opacity-100"
                aria-hidden
              />
              <GlassCard
                glow={i % 2 === 0 ? "violet" : "blue"}
                className={cn(
                  "relative z-10 h-full p-5",
                  "transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                  "group-hover:border-violet-400/35 group-hover:bg-white/[0.06]",
                  "group-hover:shadow-[0_32px_80px_-32px_rgba(0,0,0,0.65),0_0_48px_-12px_rgba(139,92,246,0.22),inset_0_1px_0_rgba(255,255,255,0.08)]"
                )}
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-indigo-600/10 ring-1 ring-white/10">
                  <f.icon
                    className="h-5 w-5 text-violet-300"
                    strokeWidth={1.75}
                  />
                </div>
                <h3 className="text-base font-semibold text-white">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                  {f.desc}
                </p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </AnimatedSection>
  );
}
