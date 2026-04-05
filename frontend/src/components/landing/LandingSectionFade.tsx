"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, type ReactNode } from "react";

type LandingSectionFadeProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Scroll-linked opacity for landing sections: soft fade as the section enters/leaves view.
 * Landing page only; keeps inner content and layout unchanged.
 */
export function LandingSectionFade({ children, className }: LandingSectionFadeProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.5, 0.8, 1], [0.52, 0.9, 1, 0.9, 0.5]);

  return (
    <motion.div
      ref={ref}
      style={{ opacity }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
