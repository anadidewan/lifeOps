"use client";

import { motion } from "framer-motion";
import {
  BookOpen,
  Calendar,
  Clock,
  Mail,
  MonitorSmartphone,
  Video,
} from "lucide-react";
import { AnimatedSection } from "./AnimatedSection";

const items = [
  { icon: BookOpen, label: "Syllabi" },
  { icon: Mail, label: "Gmail" },
  { icon: Calendar, label: "Calendar" },
  { icon: Video, label: "Zoom / Teams" },
  { icon: MonitorSmartphone, label: "Screen time" },
  { icon: Clock, label: "Tasks" },
];

export function TrustStrip() {
  return (
    <AnimatedSection className="border-y border-white/[0.05] bg-white/[0.02] py-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <p className="mb-8 text-center text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
          Connects to your academic stack
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6 sm:gap-x-14">
          {items.map(({ icon: Icon, label }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              className="flex items-center gap-2 text-slate-400"
            >
              <Icon className="h-4 w-4 text-violet-400/80" strokeWidth={1.75} />
              <span className="text-sm font-medium text-slate-300">{label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </AnimatedSection>
  );
}
