"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { Card, CardDescription, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ScoreCard } from "./ScoreCard";
import { CriteriaBreakdown } from "./CriteriaBreakdown";
import { FeedbackSection } from "./FeedbackSection";
import { PlagiarismReport } from "./PlagiarismReport";
import { CodeViewer } from "./CodeViewer";
import type { SubmissionPayload } from "@/lib/serializers";

const TYPE_LABELS = { code: "Код", essay: "Эссе", plagiarism: "Антиплагиат" } as const;

async function fetchSubmission(id: string): Promise<SubmissionPayload> {
  const res = await fetch(`/api/submissions/${id}`);
  if (!res.ok) throw new Error();
  return (await res.json()) as SubmissionPayload;
}

function ProcessingCard({ status }: { status: string }) {
  return (
    <Card>
      <div className="flex flex-col items-center gap-5 py-10 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-50">
          <Loader2 className="h-6 w-6 animate-spin text-accent" />
        </div>
        <div>
          <CardTitle>Анализируем работу</CardTitle>
          <CardDescription className="mt-1.5 max-w-sm">
            ИИ изучает каждый аспект. Обычно 10–30 секунд. Страница обновится сама.
          </CardDescription>
        </div>
        <Badge tone="primary">
          {status === "pending" ? "В очереди" : "Идёт проверка"}
        </Badge>
      </div>
    </Card>
  );
}

function FailedCard({ submissionId }: { submissionId: string }) {
  const router = useRouter();
  const [retrying, setRetrying] = useState(false);

  const handleRetry = async () => {
    setRetrying(true);
    try {
      const res = await fetch(`/api/submissions/${submissionId}/retry`, { method: "POST" });
      if (!res.ok) throw new Error();
      const json = (await res.json()) as { id: string };
      router.push(`/result/${json.id}`);
    } catch {
      setRetrying(false);
    }
  };

  return (
    <Card className="border-danger-200 bg-danger-100/30">
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-danger-100">
            <AlertCircle className="h-4 w-4 text-danger-500" />
          </div>
          <div>
            <p className="font-semibold text-primary-900">Проверка не удалась</p>
            <p className="mt-0.5 text-sm text-muted">
              Что-то пошло не так на стороне ИИ. Ваша работа сохранена — попробуйте ещё раз.
            </p>
          </div>
        </div>
        <div>
          <Button size="sm" variant="secondary" onClick={handleRetry} disabled={retrying}>
            {retrying ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            {retrying ? "Отправляем..." : "Попробовать снова"}
          </Button>
        </div>
      </div>
    </Card>
  );
}

export function ResultView({ id }: { id: string }) {
  const { data, error, isLoading } = useQuery({
    queryKey: ["submission", id],
    queryFn: () => fetchSubmission(id),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === "done" || status === "failed") return false;
      return 1500;
    },
  });

  if (isLoading) {
    return (
      <Card className="flex items-center gap-3 py-4">
        <Loader2 className="h-5 w-5 animate-spin text-accent" />
        <p className="text-sm text-muted">Загружаем результат…</p>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className="border-danger-200 bg-danger-100/30">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-danger-500" />
          <p className="text-sm text-primary-700">
            Не удалось загрузить результат. Попробуйте обновить страницу.
          </p>
        </div>
      </Card>
    );
  }

  if (data.status === "pending" || data.status === "processing") {
    return <ProcessingCard status={data.status} />;
  }

  if (data.status === "failed") {
    return <FailedCard submissionId={data.id} />;
  }

  const evalData = data.evaluation;
  if (!evalData) return null;

  const typeLabel = TYPE_LABELS[data.assignment.type];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="primary">{typeLabel}</Badge>
        {data.assignment.language && <Badge>{data.assignment.language}</Badge>}
        {data.assignment.title && (
          <h2 className="ml-1 font-display text-xl font-semibold text-primary-900">
            {data.assignment.title}
          </h2>
        )}
      </div>

      {evalData.kind === "plagiarism" ? (
        <PlagiarismReport data={evalData} />
      ) : (
        <>
          <Card>
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:gap-10">
              <ScoreCard score={evalData.totalScore} />
              <div className="flex-1 text-center sm:text-left">
                <CardTitle>Итоговая оценка</CardTitle>
                <CardDescription className="mt-2">
                  Взвешенное среднее по всем критериям. Каждое замечание подкреплено
                  цитатой или ссылкой на конкретный фрагмент работы.
                </CardDescription>
              </div>
            </div>
          </Card>

          {/* Просмотр кода только для типа "code" */}
          {data.assignment.type === "code" && data.content && (
            <div>
              <p className="mb-3 text-sm font-semibold text-primary-800">
                Код с разметкой замечаний
              </p>
              <CodeViewer
                code={data.content}
                language={data.assignment.language ?? "text"}
                fileName={data.fileName}
                criteriaScores={evalData.criteriaScores}
              />
            </div>
          )}

          <Card>
            <CardTitle>Разбор по критериям</CardTitle>
            <div className="mt-4">
              <CriteriaBreakdown items={evalData.criteriaScores} />
            </div>
          </Card>

          <Card>
            <div className="grid gap-6 sm:grid-cols-2">
              <FeedbackSection variant="strengths" items={evalData.strengths} />
              <FeedbackSection variant="weaknesses" items={evalData.weaknesses} />
            </div>
          </Card>

          <Card>
            <FeedbackSection variant="suggestions" items={evalData.suggestions} />
          </Card>
        </>
      )}
    </div>
  );
}
