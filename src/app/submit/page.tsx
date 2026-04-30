import { SubmissionForm } from "@/components/submit/SubmissionForm";

export const metadata = {
  title: "Новая проверка — Assessly",
};

export default function SubmitPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-primary-900">
          Новая проверка
        </h1>
        <p className="mt-2 text-muted">
          Заполните форму — ИИ проанализирует работу и вернёт оценку с обратной связью.
        </p>
      </div>
      <SubmissionForm />
    </div>
  );
}
