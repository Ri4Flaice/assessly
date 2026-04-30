import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Tone = "neutral" | "primary" | "accent" | "warning" | "danger" | "success";

const tones: Record<Tone, string> = {
  neutral: "bg-primary-100 text-primary-600 border-primary-200",
  primary: "bg-accent-50 text-accent-700 border-accent-200",
  accent:  "bg-success-100 text-success-600 border-success-200",
  warning: "bg-warning-100 text-warning-500 border-warning-200",
  danger:  "bg-danger-100 text-danger-600 border-danger-200",
  success: "bg-success-100 text-success-600 border-success-200",
};

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: Tone;
};

export function Badge({ className, tone = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
