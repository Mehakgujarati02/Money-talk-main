import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Props {
  eyebrow: string;
  value: ReactNode;
  hint?: string;
  variant?: "default" | "filled";
  className?: string;
}

export function StatCard({ eyebrow, value, hint, variant = "default", className }: Props) {
  const filled = variant === "filled";
  return (
    <div
      className={cn(
        "card-soft relative overflow-hidden p-5",
        filled && "border-transparent",
        className,
      )}
      style={
        filled
          ? {
              background:
                "linear-gradient(140deg, oklch(0.42 0.16 285) 0%, oklch(0.32 0.16 290) 100%)",
              color: "var(--color-secondary-foreground)",
              boxShadow:
                "0 18px 0 -10px var(--color-primary), 0 22px 40px -24px oklch(0.36 0.16 285 / 60%)",
            }
          : undefined
      }
    >
      <div
        className={cn(
          "chip mb-3 w-fit",
          filled
            ? "bg-[var(--color-primary)] text-[var(--color-primary-foreground)]"
            : "bg-[var(--color-primary)]/12 text-[var(--color-primary)]",
        )}
      >
        {eyebrow}
      </div>
      <div className="font-display text-4xl font-black leading-none">{value}</div>
      {hint ? (
        <div
          className={cn(
            "mt-2 text-xs",
            filled ? "text-white/80" : "text-muted-foreground",
          )}
        >
          {hint}
        </div>
      ) : null}
    </div>
  );
}
