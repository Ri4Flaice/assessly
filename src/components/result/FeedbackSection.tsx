import { Check, AlertTriangle, Lightbulb } from "lucide-react";

type Variant = "strengths" | "weaknesses" | "suggestions";

const config: Record<Variant, { title: string; icon: React.ReactNode; style: string; iconStyle: string }> = {
  strengths: {
    title: "Сильные стороны",
    icon: <Check className="h-3.5 w-3.5" />,
    style: "bg-success-100 text-success-600 border-success-200",
    iconStyle: "bg-success text-white",
  },
  weaknesses: {
    title: "Слабые стороны",
    icon: <AlertTriangle className="h-3.5 w-3.5" />,
    style: "bg-warning-100 text-warning-500 border-warning-200",
    iconStyle: "bg-warning text-white",
  },
  suggestions: {
    title: "Рекомендации",
    icon: <Lightbulb className="h-3.5 w-3.5" />,
    style: "bg-accent-50 text-accent-700 border-accent-200",
    iconStyle: "bg-accent text-white",
  },
};

export function FeedbackSection({ variant, items }: { variant: Variant; items: string[] }) {
  if (items.length === 0) return null;
  const c = config[variant];
  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <span className={`inline-flex h-6 w-6 items-center justify-center rounded-lg ${c.iconStyle}`}>
          {c.icon}
        </span>
        <p className="text-sm font-semibold text-primary-800">{c.title}</p>
      </div>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li
            key={i}
            className={`rounded-lg border px-3 py-2 text-sm leading-relaxed ${c.style}`}
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
