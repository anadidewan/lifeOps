"use client";

import { Cloud, Cpu, RefreshCw, Shield, Sparkles } from "lucide-react";
import { AnimatedSection } from "./AnimatedSection";
import { GlassCard } from "./GlassCard";
import { SectionHeading } from "./SectionHeading";

const pillars = [
  {
    icon: Cpu,
    title: "Scalable AI reasoning",
    desc: "Built on Google Cloud and Vertex AI with Gemini-class models for planning and language.",
  },
  {
    icon: RefreshCw,
    title: "Real-time sync",
    desc: "Background automation keeps calendars, tasks, and drafts aligned as your week shifts.",
  },
  {
    icon: Sparkles,
    title: "Long-context understanding",
    desc: "Syllabi, threads, and transcripts stay in view so decisions are never naively short-term.",
  },
  {
    icon: Shield,
    title: "Enterprise-minded safety",
    desc: "High-level design ready for least-privilege access and audit-friendly agent actions.",
  },
];

export function CloudSection() {
  return (
    <AnimatedSection id="cloud" className="py-24 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Platform"
          title="Powered by modern cloud AI, without the buzzword soup"
          subtitle="Google Cloud, Vertex AI, and Gemini come together for reliable reasoning, tool use, and natural language, presented here as a calm, premium surface."
        />
        <div className="mt-12 flex flex-wrap items-center justify-center gap-3 text-xs font-medium text-slate-500">
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5">
            Google Cloud
          </span>
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5">
            Vertex AI
          </span>
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5">
            Gemini
          </span>
        </div>
        <div className="mt-14 grid gap-5 sm:grid-cols-2">
          {pillars.map((p) => (
            <GlassCard key={p.title} className="flex gap-5 p-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/15 to-violet-600/10 ring-1 ring-white/10">
                <p.icon className="h-5 w-5 text-blue-300" strokeWidth={1.75} />
              </div>
              <div>
                <h3 className="font-semibold text-white">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                  {p.desc}
                </p>
              </div>
            </GlassCard>
          ))}
        </div>
        <div className="mt-10 flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-xs text-slate-500">
            <Cloud className="h-3.5 w-3.5 text-slate-400" />
            Designed for resilient, horizontally scalable agent workloads
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
}
