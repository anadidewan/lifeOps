import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

type GlassCardProps = {
  children: ReactNode;
  className?: string;
  glow?: "violet" | "blue" | "none";
};

const glowRing: Record<NonNullable<GlassCardProps["glow"]>, string> = {
  violet:
    "shadow-[0_0_40px_-10px_rgba(139,92,246,0.35),inset_0_1px_0_rgba(255,255,255,0.06)]",
  blue: "shadow-[0_0_40px_-10px_rgba(59,130,246,0.3),inset_0_1px_0_rgba(255,255,255,0.06)]",
  none: "",
};

export function GlassCard({ children, className, glow = "violet" }: GlassCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl",
        glowRing[glow],
        className
      )}
    >
      {children}
    </div>
  );
}
