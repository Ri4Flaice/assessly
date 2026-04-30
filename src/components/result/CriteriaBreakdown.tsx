import type { CriterionScore } from "@/types";

function barStyles(percent: number): { bar: string; score: string } {
  if (percent >= 0.7) return { bar: "bg-success", score: "text-success-600" };
  if (percent >= 0.4) return { bar: "bg-warning", score: "text-warning-500" };
  return { bar: "bg-danger", score: "text-danger-500" };
}

export function CriteriaBreakdown({ items }: { items: CriterionScore[] }) {
  if (items.length === 0) return null;
  return (
    <ul className="space-y-3">
      {items.map((item, i) => {
        const percent = item.max > 0 ? item.score / item.max : 0;
        const { bar, score } = barStyles(percent);
        return (
          <li key={i} className="rounded-xl border border-border bg-surface-elevated/50 p-4">
            <div className="flex items-baseline justify-between gap-2">
              <p className="text-sm font-semibold text-primary-800">{item.name}</p>
              <p className={`font-display text-sm font-bold tabular-nums ${score}`}>
                {item.score} / {item.max}
              </p>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-primary-100">
              <div
                className={`h-full rounded-full transition-all duration-700 ${bar}`}
                style={{ width: `${Math.max(2, Math.round(percent * 100))}%` }}
              />
            </div>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-primary-600">
              {item.comment}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
