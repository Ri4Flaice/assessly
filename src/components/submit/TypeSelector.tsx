"use client";

import { Code2, FileText, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AssignmentType } from "@/types";

const options: {
  value: AssignmentType;
  label: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    value: "code",
    label: "Код",
    description: "Ревью по критериям",
    icon: <Code2 className="h-4 w-4" />,
  },
  {
    value: "essay",
    label: "Эссе",
    description: "Оценка текстовой работы",
    icon: <FileText className="h-4 w-4" />,
  },
  {
    value: "plagiarism",
    label: "Антиплагиат",
    description: "Поиск AI и заимствований",
    icon: <ShieldCheck className="h-4 w-4" />,
  },
];

type Props = {
  value: AssignmentType;
  onChange: (v: AssignmentType) => void;
};

export function TypeSelector({ value, onChange }: Props) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "flex cursor-pointer flex-col items-start gap-2 rounded-xl border p-4 text-left transition-all duration-200",
              active
                ? "border-accent/40 bg-accent-50 shadow-sm ring-1 ring-accent/20"
                : "border-border bg-surface hover:border-primary-300 hover:bg-surface-elevated",
            )}
          >
            <span
              className={cn(
                "inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
                active
                  ? "bg-brand-gradient text-white"
                  : "bg-primary-100 text-primary-600",
              )}
            >
              {opt.icon}
            </span>
            <span
              className={cn(
                "font-display text-sm font-semibold",
                active ? "text-accent-700" : "text-primary-800",
              )}
            >
              {opt.label}
            </span>
            <span className="text-xs text-muted">{opt.description}</span>
          </button>
        );
      })}
    </div>
  );
}
