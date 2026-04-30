import { ShieldCheck, ShieldAlert, ShieldX, Quote } from "lucide-react";
import { Card, CardTitle, CardDescription } from "@/components/ui/Card";
import { ScoreCard } from "./ScoreCard";
import type { PlagiarismEvaluation, PlagiarismVerdict } from "@/types";

const VERDICT: Record<
  PlagiarismVerdict,
  { label: string; style: string; icon: React.ReactNode }
> = {
  clean: {
    label: "Оригинальный текст",
    style: "bg-success-100 text-success-600 border-success-200",
    icon: <ShieldCheck className="h-4 w-4" />,
  },
  review: {
    label: "Требует проверки",
    style: "bg-warning-100 text-warning-500 border-warning-200",
    icon: <ShieldAlert className="h-4 w-4" />,
  },
  plagiarism: {
    label: "Подозрение на плагиат",
    style: "bg-danger-100 text-danger-600 border-danger-200",
    icon: <ShieldX className="h-4 w-4" />,
  },
};

export function PlagiarismReport({ data }: { data: PlagiarismEvaluation }) {
  const v = VERDICT[data.verdict];
  return (
    <div className="space-y-5">
      <Card>
        <div className="flex flex-col items-center gap-8 sm:flex-row sm:justify-around">
          <ScoreCard score={data.originalityScore} label="Оригинальность" />
          <ScoreCard
            score={100 - data.aiProbability}
            label={`Не AI  (AI: ${Math.round(data.aiProbability)}%)`}
          />
          <div className="flex flex-col items-center gap-2">
            <span
              className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold ${v.style}`}
            >
              {v.icon}
              {v.label}
            </span>
          </div>
        </div>
      </Card>

      <Card>
        <CardTitle>Заключение</CardTitle>
        <CardDescription className="mt-3 text-sm leading-relaxed text-primary-700">
          {data.summary}
        </CardDescription>
      </Card>

      {data.suspiciousFragments.length > 0 && (
        <Card>
          <CardTitle>Подозрительные фрагменты</CardTitle>
          <CardDescription className="mt-0.5">
            Цитаты из работы с пояснением, почему они вызвали сомнения.
          </CardDescription>
          <ul className="mt-4 space-y-3">
            {data.suspiciousFragments.map((f, i) => (
              <li key={i} className="rounded-xl border border-warning-200 bg-warning-100/50 p-4">
                <div className="flex items-start gap-2">
                  <Quote className="mt-0.5 h-4 w-4 shrink-0 text-warning-500" />
                  <p className="text-sm italic text-primary-700">«{f.quote}»</p>
                </div>
                <p className="mt-2 text-sm text-muted">{f.reason}</p>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
