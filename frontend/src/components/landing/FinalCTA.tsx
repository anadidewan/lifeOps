"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { GlassCard } from "./GlassCard";

export function FinalCTA() {
  return (
    <section id="cta" className="relative pb-24 pt-8 sm:pb-32">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
        >
          <div className="absolute inset-x-4 -z-10 h-full max-h-[320px] rounded-[2rem] bg-gradient-to-b from-violet-600/20 to-transparent blur-3xl sm:inset-x-auto sm:left-1/2 sm:w-[90%] sm:-translate-x-1/2" />
          <GlassCard className="relative overflow-hidden px-8 py-14 text-center sm:px-12 sm:py-16">
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-violet-500/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-indigo-600/20 blur-3xl" />
            <p className="relative text-xs font-semibold uppercase tracking-[0.25em] text-violet-300/90">
              Imagine your next semester
            </p>
            <h2 className="relative mt-4 text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-[2.75rem] md:leading-tight">
              Meet the AI agent built for academic survival
            </h2>
            <p className="relative mx-auto mt-5 max-w-xl text-base text-slate-400">
              Deadlines tracked. Inbox handled. Focus protected. LifeOS runs the
              background so you can think in full sentences again.
            </p>
            <div className="relative mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="#"
                className="inline-flex h-12 min-w-[200px] items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-8 text-sm font-semibold text-white shadow-[0_0_40px_-6px_rgba(139,92,246,0.65)] ring-1 ring-white/15 transition hover:brightness-110"
              >
                Start running student life smarter
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="#features"
                className="text-sm font-medium text-slate-400 underline-offset-4 transition hover:text-white hover:underline"
              >
                Explore capabilities
              </Link>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </section>
  );
}
