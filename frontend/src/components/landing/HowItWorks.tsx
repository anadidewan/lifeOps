"use client";

import { motion } from "framer-motion";
import { Brain, Eye, Repeat, Zap } from "lucide-react";
import { AnimatedSection } from "./AnimatedSection";
import { SectionHeading } from "./SectionHeading";
import { cn } from "@/lib/cn";

const steps = [
  {
    icon: Eye,
    title: "Observe",
    copy: "Ingest syllabi, email, calendar, meetings, and device signals into one coherent view.",
  },
  {
    icon: Brain,
    title: "Reason",
    copy: "Models workload, priorities, and your patterns to forecast what breaks first.",
  },
  {
    icon: Zap,
    title: "Act",
    copy: "Schedules work, drafts outreach, and creates reminders, without waiting to be asked.",
  },
  {
    icon: Repeat,
    title: "Learn",
    copy: "Improves plans over time as it understands how you focus, slip, and recover.",
  },
];

export function HowItWorks() {
  return (
    <AnimatedSection id="how-it-works" className="py-24 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Agent loop"
          title="Observe → Reason → Act → Learn"
          subtitle="The same loop modern AI systems use, applied to coursework, communication, and time."
        />
        <div className="relative mt-20">
          <div className="absolute left-[8%] right-[8%] top-[52%] hidden h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent lg:block" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="relative"
              >
                <div
                  className={cn(
                    "rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-6 backdrop-blur-xl",
                    "shadow-[0_0_40px_-12px_rgba(99,102,241,0.35)]"
                  )}
                >
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/15 ring-1 ring-violet-400/30">
                    <step.icon className="h-5 w-5 text-violet-200" strokeWidth={1.75} />
                  </div>
                  <div className="mb-2 flex items-baseline gap-2">
                    <span className="text-xs font-bold text-violet-400/90">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="text-lg font-semibold text-white">{step.title}</h3>
                  </div>
                  <p className="text-sm leading-relaxed text-slate-400">{step.copy}</p>
                </div>
                {i < steps.length - 1 ? (
                  <div
                    className="my-4 flex justify-center lg:hidden"
                    aria-hidden
                  >
                    <div className="h-8 w-px bg-gradient-to-b from-violet-500/50 to-transparent" />
                  </div>
                ) : null}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
}
