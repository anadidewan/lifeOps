import { Sparkles } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-[#02040c]/80 py-12 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-4 sm:flex-row sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 text-slate-300">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.06] ring-1 ring-white/10">
            <Sparkles className="h-4 w-4 text-violet-400" strokeWidth={1.75} />
          </span>
          <span className="text-sm font-semibold">LifeOS</span>
        </Link>
        <p className="text-center text-xs text-slate-500 sm:text-right">
          © {new Date().getFullYear()} LifeOS · Autonomous AI Student Agent ·
          Hackathon demo
        </p>
      </div>
    </footer>
  );
}
