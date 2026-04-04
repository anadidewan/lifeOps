"use client";

import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
} from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  Cpu,
  Mail,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, type MouseEvent } from "react";
import { GlassCard } from "./GlassCard";
import { cn } from "@/lib/cn";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-28 pb-20 sm:pt-32 sm:pb-28 lg:pt-36 lg:pb-32">
      <div className="mx-auto grid max-w-6xl gap-14 px-4 sm:gap-16 sm:px-6 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:gap-12 lg:px-8">
        <div className="mx-auto max-w-xl text-center lg:mx-0 lg:max-w-none lg:text-left">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-500/28 bg-violet-500/[0.09] px-3.5 py-1.5 text-xs font-medium text-violet-100/95 shadow-[0_0_24px_-8px_rgba(139,92,246,0.4)]"
          >
            <Cpu className="h-3.5 w-3.5 text-violet-300" strokeWidth={2} />
            Autonomous AI for academic life
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.52, delay: 0.04, ease: [0.22, 1, 0.36, 1] }}
            className="text-balance text-[2.15rem] font-semibold leading-[1.1] tracking-[-0.02em] text-white sm:text-5xl sm:leading-[1.08] lg:text-[3.1rem] lg:leading-[1.06]"
          >
            Your autonomous AI operating system{" "}
            <span className="bg-gradient-to-r from-violet-200 via-indigo-200 to-cyan-100 bg-clip-text text-transparent">
              for student life
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.52, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto mt-7 max-w-lg text-[1.0625rem] leading-[1.65] text-slate-400 sm:text-lg sm:leading-relaxed lg:mx-0"
          >
            LifeOS observes your syllabi, calendar, and behavior, then reasons,
            plans, and acts like a proactive academic collaborator. Predict risk
            before failure and run your semester on autopilot.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.52, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
            className="mt-11 flex flex-col items-stretch gap-3.5 sm:flex-row sm:justify-center sm:gap-4 lg:justify-start"
          >
            <motion.div
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.985 }}
              transition={{ type: "spring", stiffness: 380, damping: 22 }}
              className="inline-flex sm:inline-flex"
            >
              <Link
                href="#cta"
                className={cn(
                  "inline-flex h-[3.15rem] min-w-[11.5rem] items-center justify-center gap-2 rounded-full px-8 text-sm font-semibold text-white",
                  "bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600",
                  "shadow-[0_0_40px_-6px_rgba(99,102,241,0.75),0_12px_32px_-16px_rgba(139,92,246,0.5),inset_0_1px_0_rgba(255,255,255,0.15)]",
                  "ring-1 ring-white/15 transition-[filter,box-shadow] duration-300 hover:brightness-[1.06] hover:shadow-[0_0_48px_-4px_rgba(139,92,246,0.85)]"
                )}
              >
                Start running student life smarter
                <ArrowRight className="h-4 w-4 opacity-95" strokeWidth={2} />
              </Link>
            </motion.div>
            <motion.div
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.985 }}
              transition={{ type: "spring", stiffness: 380, damping: 22 }}
              className="inline-flex sm:inline-flex"
            >
              <Link
                href="#how-it-works"
                className={cn(
                  "inline-flex h-[3.15rem] items-center justify-center rounded-full border border-white/[0.14] bg-white/[0.045] px-8 text-sm font-semibold text-slate-100",
                  "shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_8px_28px_-18px_rgba(0,0,0,0.5)]",
                  "backdrop-blur-xl transition-[border-color,background-color,box-shadow] duration-300",
                  "hover:border-white/22 hover:bg-white/[0.08] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_12px_36px_-16px_rgba(99,102,241,0.15)]"
                )}
              >
                See how the agent works
              </Link>
            </motion.div>
          </motion.div>
        </div>

        <div className="relative mx-auto w-full max-w-lg lg:mx-0 lg:max-w-none">
          <HeroDashboard />
        </div>
      </div>
    </section>
  );
}

function HeroDashboard() {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotateX = useSpring(0, { stiffness: 100, damping: 22 });
  const rotateY = useSpring(0, { stiffness: 100, damping: 22 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    mx.set(r.width * 0.52);
    my.set(r.height * 0.32);
  }, [mx, my]);

  const handleMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    rotateY.set(px * 5.5);
    rotateX.set(-py * 4.5);
    mx.set(e.clientX - r.left);
    my.set(e.clientY - r.top);
  };

  const handleLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
    const el = ref.current;
    if (el) {
      const r = el.getBoundingClientRect();
      mx.set(r.width * 0.52);
      my.set(r.height * 0.32);
    }
  };

  const spotlight = useMotionTemplate`radial-gradient(460px circle at ${mx}px ${my}px, rgba(139,92,246,0.16), transparent 58%)`;

  return (
    <div className="relative w-full max-w-[min(100%,520px)] lg:ml-auto lg:max-w-[560px]">
      <div
        className="pointer-events-none absolute -inset-10 rounded-[2.75rem] bg-gradient-to-br from-violet-600/28 via-indigo-600/14 to-blue-600/22 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -inset-4 rounded-[2rem] bg-gradient-to-tl from-violet-500/12 to-transparent opacity-80 blur-2xl"
        aria-hidden
      />
      <div className="relative [perspective:1400px]" style={{ transformStyle: "preserve-3d" }}>
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="will-change-transform"
        >
          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 28, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.75, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
            style={{
              transformStyle: "preserve-3d",
              rotateX,
              rotateY,
            }}
            onMouseMove={handleMove}
            onMouseLeave={handleLeave}
            className="relative cursor-default"
          >
            <motion.div
              className={cn(
                "relative rounded-[1.4rem] p-[1px]",
                "bg-gradient-to-br from-white/25 via-white/[0.08] to-white/[0.03]",
                "shadow-[0_32px_90px_-28px_rgba(0,0,0,0.75),0_0_0_1px_rgba(255,255,255,0.07)_inset,0_1px_0_rgba(255,255,255,0.1)_inset]"
              )}
              style={{ transform: "translateZ(12px)" }}
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
                <motion.div
                  className="pointer-events-none absolute inset-0 opacity-90 mix-blend-screen"
                  style={{ background: spotlight }}
                />
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />

                <div className="relative border-b border-white/[0.06] bg-white/[0.04] px-4 py-3.5 backdrop-blur-sm sm:px-5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-red-400/85 shadow-[0_0_8px_rgba(248,113,113,0.45)]" />
                        <span className="h-2.5 w-2.5 rounded-full bg-amber-400/85 shadow-[0_0_8px_rgba(251,191,36,0.35)]" />
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/85 shadow-[0_0_8px_rgba(52,211,153,0.4)]" />
                      </div>
                      <span className="text-[11px] font-medium tracking-wide text-slate-400">
                        Good evening, Saksham
                      </span>
                    </div>
                    <span className="rounded-full bg-emerald-500/18 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-200/95 ring-1 ring-emerald-400/28 shadow-[0_0_16px_-6px_rgba(52,211,153,0.45)]">
                      AI Status: Analyzing
                    </span>
                  </div>
                </div>

                <div className="relative grid gap-4 p-4 sm:gap-5 sm:p-5">
                  <div>
                    <div className="mb-2.5 flex items-center justify-between">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                        PLAN
                      </span>
                      <span className="text-[10px] text-slate-600">3 due today • 1 at risk</span>
                    </div>
                    <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                      {days.map((d, i) => (
                        <div key={d} className="text-center">
                          <span className="text-[9px] font-medium text-slate-600">{d}</span>
                          <div className="mt-1.5 min-h-[72px] rounded-lg border border-white/[0.07] bg-white/[0.025] p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:min-h-[84px]">
                            {i === 1 && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.94 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.65, duration: 0.35 }}
                                className="mb-1 rounded-md bg-gradient-to-br from-violet-500/50 to-indigo-600/38 px-1 py-1 text-[8px] font-medium leading-tight text-white ring-1 ring-white/12 shadow-[0_4px_16px_-4px_rgba(139,92,246,0.45)]"
                              >
                                Mon: Econ (2h)
                              </motion.div>
                            )}
                            {i === 3 && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.94 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.75, duration: 0.35 }}
                                className="rounded-md bg-gradient-to-br from-blue-500/45 to-cyan-600/28 px-1 py-1 text-[8px] font-medium text-blue-50 ring-1 ring-white/10 shadow-[0_4px_16px_-4px_rgba(59,130,246,0.35)]"
                              >
                                Tue: DB (3h)
                              </motion.div>
                            )}
                            {i === 4 && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.94 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.85, duration: 0.35 }}
                                className="mt-1 rounded-md bg-white/[0.07] px-1 py-0.5 text-[7px] text-slate-400 ring-1 ring-white/[0.05]"
                              >
                                Wed: Review
                              </motion.div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <GlassCard
                      glow="none"
                      className="border-amber-500/22 bg-gradient-to-br from-amber-500/[0.1] to-transparent p-3.5 shadow-[0_0_36px_-14px_rgba(245,158,11,0.4),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl"
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/22 ring-1 ring-amber-400/35 shadow-[0_0_20px_-8px_rgba(245,158,11,0.5)]">
                          <AlertTriangle className="h-4 w-4 text-amber-200" strokeWidth={2} />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-100/95">
                            Database Project
                          </p>
                          <p className="mt-1 text-xs font-medium leading-snug text-amber-50/95">
                            High risk 20% done • 2 days left Actions: Adjust Plan Draft Email
                          </p>
                        </div>
                      </div>
                    </GlassCard>

                    <div className="rounded-xl border border-violet-500/28 bg-gradient-to-br from-violet-500/[0.14] to-indigo-600/[0.07] p-3.5 shadow-[0_0_36px_-12px_rgba(139,92,246,0.45),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-3.5 w-3.5 text-violet-200" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-violet-100/95">
                          AI SUGGESTIONS
                        </span>
                      </div>
                      <p className="mt-2 text-xs leading-relaxed text-slate-100/95">
                        Start DB earlier Move Econ to evening Reduce Thursday load
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-white/[0.09] bg-white/[0.035] p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_8px_28px_-20px_rgba(0,0,0,0.35)] backdrop-blur-xl">
                      <div className="flex items-center gap-2 text-slate-500">
                        <Mail className="h-3.5 w-3.5 text-violet-300/90" />
                        <span className="text-[10px] font-semibold uppercase tracking-wider">
                          EMAIL
                        </span>
                      </div>
                      <p className="mt-2 truncate text-[10px] text-slate-500">Subject: Extension Request</p>
                      <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-slate-400">
                        Preview: Dear Professor...
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="rounded-md bg-violet-500/22 px-2 py-0.5 text-[9px] font-medium text-violet-100 ring-1 ring-violet-400/20">
                          Tone: professional
                        </span>
                        <span className="rounded-md bg-white/[0.06] px-2 py-0.5 text-[9px] text-slate-500 ring-1 ring-white/[0.06]">
                          Auto
                        </span>
                      </div>
                    </div>

                    <div className="rounded-xl border border-white/[0.09] bg-white/[0.035] p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_8px_28px_-20px_rgba(0,0,0,0.35)] backdrop-blur-xl">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                          PROGRESS
                        </span>
                        <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400">
                          <TrendingUp className="h-3 w-3" />
                          +12% consistency
                        </span>
                      </div>
                      <div className="flex h-14 items-end justify-between gap-1 px-0.5">
                        {[40, 65, 45, 80, 55, 90, 72].map((h, idx) => (
                          <div
                            key={idx}
                            className="flex h-14 min-w-0 flex-1 flex-col justify-end"
                          >
                            <motion.div
                              className="w-full rounded-t-sm bg-gradient-to-t from-violet-600/95 to-indigo-400/75 shadow-[0_-4px_16px_-4px_rgba(139,92,246,0.35)]"
                              initial={{ height: 0 }}
                              animate={{ height: Math.round((h / 100) * 52) }}
                              transition={{
                                duration: 0.75,
                                delay: 0.35 + idx * 0.055,
                                ease: [0.22, 1, 0.36, 1],
                              }}
                            />
                          </div>
                        ))}
                      </div>
                      <p className="mt-2 text-[9px] text-slate-600">6h studied Best focus: 8-11 PM Drop after 40 min</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
