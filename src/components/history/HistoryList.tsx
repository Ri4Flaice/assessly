"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Code2, FileText, ShieldCheck, Loader2 } from "lucide-react";
import { Card, CardDescription, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { getDeviceId } from "@/lib/device";
import type { SubmissionPayload } from "@/lib/serializers";

const ICON = {
  code: <Code2 className="h-4 w-4" />,
  essay: <FileText className="h-4 w-4" />,
  plagiarism: <ShieldCheck className="h-4 w-4" />,
} as const;

const STATUS: Record<string, { label: string; tone: "primary" | "success" | "warning" | "danger" }> = {
  pending:    { label: "В очереди",     tone: "primary" },
  processing: { label: "Проверяется",   tone: "primary" },
  done:       { label: "Готово",        tone: "success" },
  failed:     { label: "Ошибка",        tone: "danger" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function HistoryList() {
  const [deviceId, setDeviceId] = useState<string>("");

  useEffect(() => {
    // Чтение localStorage возможно только на клиенте
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDeviceId(getDeviceId());
  }, []);

  const { data, isLoading, error } = useQuery({
    queryKey: ["history", deviceId],
    queryFn: async () => {
      const res = await fetch(`/api/submissions?deviceId=${encodeURIComponent(deviceId)}`);
      if (!res.ok) throw new Error();
      return (await res.json()) as { submissions: SubmissionPayload[] };
    },
    enabled: !!deviceId,
  });

  if (!deviceId || isLoading) {
    return (
      <Card className="flex items-center gap-3 py-4">
        <Loader2 className="h-5 w-5 animate-spin text-accent" />
        <p className="text-sm text-muted">Загружаем историю…</p>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-danger-200">
        <p className="text-sm text-danger-500">Не удалось загрузить историю. Попробуйте обновить страницу.</p>
      </Card>
    );
  }

  const items = data?.submissions ?? [];

  if (items.length === 0) {
    return (
      <Card>
        <CardTitle>Здесь пока пусто</CardTitle>
        <CardDescription className="mt-1.5">
          Отправьте первую работу на проверку — она появится в этом списке.
        </CardDescription>
        <div className="mt-4">
          <Link
            href="/submit"
            className="glow-accent inline-flex cursor-pointer items-center gap-2 rounded-xl bg-brand-gradient px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
          >
            Перейти к форме
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <ul className="space-y-2">
      {items.map((s) => {
        const status = STATUS[s.status] ?? STATUS.pending;
        const score =
          s.evaluation?.kind === "code-essay"
            ? `${Math.round(s.evaluation.totalScore)} / 100`
            : s.evaluation?.kind === "plagiarism"
              ? `${Math.round(s.evaluation.originalityScore)}% оригинальности`
              : "—";

        return (
          <li key={s.id}>
            <Link href={`/result/${s.id}`}>
              <Card className="cursor-pointer transition-all duration-200 hover:border-primary-300 hover:shadow-md">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-accent-50 text-accent">
                    {ICON[s.assignment.type]}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-primary-900">
                      {s.assignment.title ?? "Проверка на плагиат"}
                    </p>
                    <p className="text-xs text-muted">{formatDate(s.createdAt)}</p>
                  </div>
                  <Badge tone={status.tone}>{status.label}</Badge>
                  <p className="font-display text-sm font-bold text-primary-800">{score}</p>
                  <ArrowRight className="h-4 w-4 text-muted" />
                </div>
              </Card>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
