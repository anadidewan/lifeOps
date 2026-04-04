"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const links = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#dashboard", label: "Preview" },
  { href: "#cloud", label: "Platform" },
];

export function Navbar({ className }: { className?: string }) {
  const pathname = usePathname();
  const onDashboard = pathname === "/dashboard";

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "fixed left-0 right-0 top-0 z-50 border-b border-white/[0.07] bg-[#030512]/72 backdrop-blur-2xl backdrop-saturate-150",
        className
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        <div className="flex shrink-0 items-center gap-4 sm:gap-5">
          <Link
            href="/"
            className="flex items-center gap-2.5 text-white transition-opacity hover:opacity-95"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/35 to-indigo-600/28 ring-1 ring-white/12 shadow-[0_0_28px_-6px_rgba(139,92,246,0.55)]">
              <Sparkles className="h-4 w-4 text-violet-200" strokeWidth={1.75} />
            </span>
            <span className="text-lg font-semibold tracking-tight">LifeOS</span>
          </Link>
          <motion.div whileHover={{ y: -1 }} transition={{ type: "spring", stiffness: 420, damping: 28 }}>
            <Link
              href="/dashboard"
              className={cn(
                "text-[13px] font-medium transition-colors",
                onDashboard ? "text-white" : "text-slate-400 hover:text-white"
              )}
            >
              Dashboard
            </Link>
          </motion.div>
        </div>

        <nav className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-9 md:flex">
          {links.map((l) => (
            <motion.a
              key={l.href}
              href={l.href}
              className="text-[13px] font-medium text-slate-400 transition-colors hover:text-white"
              whileHover={{ y: -1 }}
              transition={{ type: "spring", stiffness: 420, damping: 28 }}
            >
              {l.label}
            </motion.a>
          ))}
        </nav>

        <div className="ml-auto flex shrink-0 items-center md:ml-0">
          <Link
            href="/auth"
            className={cn(
              "relative overflow-hidden rounded-full px-[1.15rem] py-2.5 text-[13px] font-semibold text-white",
              "bg-gradient-to-r from-violet-600 via-violet-500 to-indigo-600",
              "shadow-[0_0_32px_-4px_rgba(139,92,246,0.7),0_8px_24px_-12px_rgba(99,102,241,0.45),inset_0_1px_0_rgba(255,255,255,0.14)]",
              "ring-1 ring-white/15 transition-[filter,transform,box-shadow] duration-200 hover:brightness-[1.08] hover:shadow-[0_0_40px_-4px_rgba(139,92,246,0.85)] active:scale-[0.98]"
            )}
          >
            <span className="relative z-10">Get Started</span>
            <span
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-transparent via-white/[0.06] to-white/[0.12]"
              aria-hidden
            />
          </Link>
        </div>
      </div>
    </motion.header>
  );
}
