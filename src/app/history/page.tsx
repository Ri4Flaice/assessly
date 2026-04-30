import { HistoryList } from "@/components/history/HistoryList";

export const metadata = {
  title: "История проверок — Assessly",
};

export default function HistoryPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold text-primary-900">
          История проверок
        </h1>
        <p className="mt-2 text-muted">
          Все ваши проверки, которые были сделаны с помощью Assessly
        </p>
      </div>
      <HistoryList />
    </div>
  );
}
