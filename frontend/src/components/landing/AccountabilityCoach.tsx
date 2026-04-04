"use client";

import { motion } from "framer-motion";
import { MessageCircle, TrendingUp } from "lucide-react";
import { AnimatedSection } from "./AnimatedSection";
import { GlassCard } from "./GlassCard";
import { SectionHeading } from "./SectionHeading";

const quotes = [
  {
    text: "You planned 2 hours, completed 40 min. Retry this evening?",
    tag: "Gentle recovery",
  },
  {
    text: "Your consistency improved 18% this week.",
    tag: "Momentum",
  },
  {
    text: "You focus better after 8 PM on Tuesdays.",
    tag: "Pattern",
  },
];

export function AccountabilityCoach() {
  return (
    <AnimatedSection className="py-24 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Accountability"
          title="An AI coach that sounds human, not robotic"
          subtitle="Short, specific feedback grounded in your behavior. Built to help you rebound, not shame you."
        />
        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {quotes.map((q, i) => (
            <motion.div
              key={q.text}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.45 }}
            >
              <GlassCard className="h-full p-6">
                <div className="mb-4 flex items-center justify-between">
                  <span className="rounded-full bg-violet-500/15 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-violet-200">
                    {q.tag}
                  </span>
                  <MessageCircle className="h-4 w-4 text-slate-500" />
                </div>
                <p className="text-base font-medium leading-relaxed text-slate-200">
                  “{q.text}”
                </p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-10"
        >
          <GlassCard glow="blue" className="flex flex-col items-center gap-4 p-8 text-center sm:flex-row sm:text-left">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/25 to-indigo-600/20 ring-1 ring-white/10">
              <TrendingUp className="h-6 w-6 text-violet-200" />
            </div>
            <div>
              <p className="text-lg font-semibold text-white">
                Pomodoro-aware rhythm · smart nudges · weekly consistency score
              </p>
              <p className="mt-2 max-w-2xl text-sm text-slate-400">
                LifeOS aligns nudges with how you actually work, so the system
                feels like a teammate that learns, not a nagging widget.
              </p>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </AnimatedSection>
  );
}
