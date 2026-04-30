import { ResultView } from "@/components/result/ResultView";

export const metadata = {
  title: "Результат проверки — Assessly",
};

export default async function ResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="mb-6 font-display text-3xl font-bold text-primary-900">
        Результат проверки
      </h1>
      <ResultView id={id} />
    </div>
  );
}
