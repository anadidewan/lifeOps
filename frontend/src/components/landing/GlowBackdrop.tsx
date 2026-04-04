"use client";

import { cn } from "@/lib/cn";

type GlowBackdropProps = {
  className?: string;
};

export function GlowBackdrop({ className }: GlowBackdropProps) {
  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#030512]",
        className
      )}
      aria-hidden
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_-10%,rgba(124,58,237,0.22),transparent_55%)]" />
      <div className="absolute left-1/2 top-[-15%] h-[min(720px,80vh)] w-[min(1000px,120vw)] -translate-x-1/2 rounded-full bg-violet-600/[0.18] blur-[100px]" />
      <div className="absolute right-[-8%] top-[25%] h-[480px] w-[520px] rounded-full bg-indigo-600/[0.14] blur-[90px]" />
      <div className="absolute bottom-[-12%] left-[-5%] h-[420px] w-[640px] rounded-full bg-blue-600/[0.1] blur-[85px]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,rgba(3,5,18,0.4)_50%,#030512_100%)]" />
    </div>
  );
}
