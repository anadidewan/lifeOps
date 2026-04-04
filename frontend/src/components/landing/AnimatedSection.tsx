"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/cn";

type AnimatedSectionProps = HTMLMotionProps<"section"> & {
  children: React.ReactNode;
  delay?: number;
};

export function AnimatedSection({
  children,
  className,
  delay = 0,
  ...props
}: AnimatedSectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{
        duration: 0.65,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.section>
  );
}
