import { cn } from "@/lib/cn";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "mx-auto max-w-3xl",
        align === "center" && "text-center",
        className
      )}
    >
      {eyebrow ? (
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-violet-400/90">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-[2.5rem] md:leading-tight">
        {title}
      </h2>
      {subtitle ? (
        <p className="mt-4 text-pretty text-base leading-relaxed text-slate-400 sm:text-lg">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
