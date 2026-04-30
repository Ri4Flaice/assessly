import { cn } from "@/lib/utils";

type Props = {
  score: number;
  label?: string;
  size?: number;
};

function colorForScore(score: number): { stroke: string; text: string; bg: string } {
  if (score >= 70) return { stroke: "#10b981", text: "text-success-600", bg: "bg-success-100" };
  if (score >= 40) return { stroke: "#f59e0b", text: "text-warning-500", bg: "bg-warning-100" };
  return { stroke: "#ef4444", text: "text-danger-500", bg: "bg-danger-100" };
}

export function ScoreCard({ score, label = "Итоговая оценка", size = 180 }: Props) {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const { stroke, text, bg } = colorForScore(clamped);
  const radius = size / 2 - 14;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - clamped / 100);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e2e8f0"
            strokeWidth={10}
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={stroke}
            strokeWidth={10}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            fill="none"
            style={{ transition: "stroke-dashoffset 0.7s cubic-bezier(0.4,0,0.2,1)" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("font-display text-4xl font-bold tabular-nums", text)}>
            {clamped}
          </span>
          <span className="text-xs text-muted">/ 100</span>
        </div>
      </div>
      <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", bg, text)}>
        {label}
      </span>
    </div>
  );
}
