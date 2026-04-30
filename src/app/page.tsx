import Link from "next/link";
import { ArrowRight, Code2, FileText, ShieldCheck } from "lucide-react";

export default function HomePage() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────── */}
      <section className="border-b border-border bg-surface">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
          <div className="flex flex-col items-center text-center">
            {/* Pill */}
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-accent-200 bg-accent-50 px-4 py-1.5 text-xs font-semibold text-accent-700">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              Объективно оценим
            </div>

            {/* Заголовок */}
            <h1 className="max-w-3xl font-display text-5xl font-bold leading-tight tracking-tight text-primary-900 sm:text-6xl lg:text-7xl">
              Проверка работ без
              <br />
              <span className="text-brand-gradient">компромиссов</span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-primary-500">
              Assessly разбирает код, эссе и тексты. Выдаёт оценку по вашим критериям —
              с цитатами, номерами строк и конкретными рекомендациями.
            </p>

            {/* CTA */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/submit"
                className="glow-accent inline-flex cursor-pointer items-center gap-2 rounded-xl bg-brand-gradient px-7 py-3.5 text-base font-semibold text-white transition-opacity hover:opacity-90"
              >
                Проверить работу
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/history"
                className="inline-flex cursor-pointer items-center rounded-xl border border-border bg-surface px-7 py-3.5 text-base font-semibold text-primary-700 transition hover:border-primary-300 hover:bg-surface-elevated"
              >
                Мои проверки
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-12 text-center">
          <h2 className="font-display text-3xl font-bold text-primary-900">
            Три режима проверки
          </h2>
          <p className="mt-3 text-primary-500">
            Каждый режим — отдельная роль ИИ, специализированный промпт и собственный результат.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          <FeatureCard
            icon={<Code2 className="h-5 w-5" />}
            iconStyle="bg-accent-50 text-accent"
            title="Программный код"
            description="15+ языков. Корректность, читаемость, производительность, безопасность. Ссылки на конкретные строки кода."
            items={["Корректность и баги", "Стиль и читаемость", "Безопасность"]}
          />
          <FeatureCard
            icon={<FileText className="h-5 w-5" />}
            iconStyle="bg-primary-100 text-primary-600"
            title="Эссе и текст"
            description="Оценка структуры, аргументации и грамотности. Каждое замечание подкреплено цитатой из работы."
            items={["Структура и логика", "Аргументация", "Грамотность"]}
          />
          <FeatureCard
            icon={<ShieldCheck className="h-5 w-5" />}
            iconStyle="bg-success-100 text-success-600"
            title="Антиплагиат"
            description="Поиск AI-генерации и заимствований. Подозрительные фрагменты с подробными пояснениями."
            items={["AI-генерация", "Заимствования", "Оригинальность"]}
            highlight
          />
        </div>
      </section>
    </>
  );
}

function FeatureCard({
  icon,
  iconStyle,
  title,
  description,
  items,
  highlight,
}: {
  icon: React.ReactNode;
  iconStyle: string;
  title: string;
  description: string;
  items: string[];
  highlight?: boolean;
}) {
  return (
    <div
      className={`surface-card flex flex-col rounded-2xl p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${highlight ? "border-accent-200 ring-1 ring-accent-200/50" : ""}`}
    >
      <div className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl ${iconStyle}`}>
        {icon}
      </div>
      <h3 className="font-display text-base font-semibold text-primary-900">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">{description}</p>
      <ul className="mt-4 space-y-1.5">
        {items.map((item) => (
          <li key={item} className="flex items-center gap-2 text-xs text-primary-600">
            <span className="h-1 w-1 rounded-full bg-accent" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
