"use client";

import { useMemo } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { XCircle, AlertTriangle, Info, FileCode2 } from "lucide-react";
import type { CriterionScore } from "@/types";

// ── Карта языков → Prism-идентификаторы ──────────────────────────────────────

const PRISM_LANG: Record<string, string> = {
  python:     "python",
  typescript: "typescript",
  javascript: "javascript",
  java:       "java",
  csharp:     "csharp",
  cpp:        "cpp",
  c:          "c",
  go:         "go",
  rust:       "rust",
  kotlin:     "kotlin",
  swift:      "swift",
  php:        "php",
  ruby:       "ruby",
  sql:        "sql",
  html:       "markup",
};

// ── Типы ─────────────────────────────────────────────────────────────────────

type Severity = "error" | "warning" | "info";

type Annotation = {
  lines: number[];
  criterionName: string;
  comment: string;
  score: number;
  max: number;
  severity: Severity;
};

// ── Вспомогательные функции ───────────────────────────────────────────────────

function getSeverity(score: number, max: number): Severity {
  if (max === 0) return "info";
  const r = score / max;
  if (r < 0.5)  return "error";
  if (r < 0.75) return "warning";
  return "info";
}

function extractLineNumbers(text: string): number[] {
  const nums = new Set<number>();

  // Поддерживаемые паттерны: "строка 5", "строки 3-7", "line 5", "#5", "(line 12)"
  const patterns: RegExp[] = [
    /строк[аиу]?\s+(\d+)(?:\s*[-–—]\s*(\d+))?/gi,
    /lines?\s+(\d+)(?:\s*[-–—]\s*(\d+))?/gi,
    /#(\d+)(?:\s*[-–—]\s*#?(\d+))?/g,
    /\((\d+)\)/g,
  ];

  for (const pat of patterns) {
    for (const m of text.matchAll(pat)) {
      const start = parseInt(m[1] ?? "0");
      const end   = m[2] ? parseInt(m[2]) : start;
      if (start > 0 && start <= 10_000) {
        for (let i = start; i <= Math.min(end, start + 30); i++) nums.add(i);
      }
    }
  }

  return [...nums].sort((a, b) => a - b);
}

function buildAnnotations(criteriaScores: CriterionScore[]): Annotation[] {
  return criteriaScores.map((c) => ({
    lines:         extractLineNumbers(c.comment),
    criterionName: c.name,
    comment:       c.comment,
    score:         c.score,
    max:           c.max,
    severity:      getSeverity(c.score, c.max),
  }));
}

// ── Конфиг визуального оформления ────────────────────────────────────────────

const SEVERITY = {
  error: {
    icon:       <XCircle      className="h-3.5 w-3.5 shrink-0" />,
    iconClass:  "text-red-400",
    lineStyle:  { backgroundColor: "rgba(244,63,94,0.09)", borderLeft: "3px solid #f43f5e" },
    dotClass:   "bg-red-400",
    chipClass:  "bg-red-900/40 text-red-300 border border-red-700/40",
  },
  warning: {
    icon:       <AlertTriangle className="h-3.5 w-3.5 shrink-0" />,
    iconClass:  "text-amber-400",
    lineStyle:  { backgroundColor: "rgba(245,158,11,0.08)", borderLeft: "3px solid #f59e0b" },
    dotClass:   "bg-amber-400",
    chipClass:  "bg-amber-900/40 text-amber-300 border border-amber-700/40",
  },
  info: {
    icon:       <Info          className="h-3.5 w-3.5 shrink-0" />,
    iconClass:  "text-indigo-400",
    lineStyle:  { backgroundColor: "rgba(99,102,241,0.06)",  borderLeft: "3px solid #6366f1" },
    dotClass:   "bg-indigo-400",
    chipClass:  "bg-indigo-900/40 text-indigo-300 border border-indigo-700/40",
  },
} as const;

// ── Компонент ─────────────────────────────────────────────────────────────────

type Props = {
  code:          string;
  language:      string;
  fileName?:     string | null;
  criteriaScores: CriterionScore[];
};

export function CodeViewer({ code, language, fileName, criteriaScores }: Props) {
  const annotations = useMemo(() => buildAnnotations(criteriaScores), [criteriaScores]);

  // Карта: номер строки → наиболее серьёзная severity
  const lineMap = useMemo(() => {
    const order: Severity[] = ["error", "warning", "info"];
    const map = new Map<number, Severity>();

    for (const ann of annotations) {
      for (const ln of ann.lines) {
        const cur = map.get(ln);
        if (!cur || order.indexOf(ann.severity) < order.indexOf(cur)) {
          map.set(ln, ann.severity);
        }
      }
    }
    return map;
  }, [annotations]);

  const prismLang   = PRISM_LANG[language] ?? "text";
  const displayName = fileName ?? `untitled.${language}`;
  const totalLines  = code.split("\n").length;

  const errorCount   = annotations.filter((a) => a.severity === "error").length;
  const warningCount = annotations.filter((a) => a.severity === "warning").length;

  return (
    <div className="code-viewer overflow-hidden rounded-2xl border border-zinc-800 shadow-lg">
      <style>{`
        .code-viewer ::selection {
          background: rgba(139, 92, 246, 0.55);
          color: #fff;
        }
        .custom-scroll pre::-webkit-scrollbar {
          height: 8px;
          width: 8px;
        }
        .custom-scroll pre::-webkit-scrollbar-track {
          background: #18181b; /* zinc-900 */
        }
        .custom-scroll pre::-webkit-scrollbar-thumb {
          background: #3f3f46; /* zinc-700 */
          border-radius: 6px;
        }
        .custom-scroll pre::-webkit-scrollbar-thumb:hover {
          background: #52525b; /* zinc-600 */
        }
      `}</style>

      {/* ── Шапка редактора ─── */}
      <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900 px-4 py-2.5">
        <div className="flex items-center gap-2.5">
          {/* macOS-style dots */}
          <div className="flex gap-1.5">
            <span className="h-3 w-3 rounded-full bg-red-500/70" />
            <span className="h-3 w-3 rounded-full bg-amber-400/70" />
            <span className="h-3 w-3 rounded-full bg-emerald-500/70" />
          </div>
          <div className="ml-2 flex items-center gap-1.5">
            <FileCode2 className="h-3.5 w-3.5 text-zinc-500" />
            <span className="font-mono text-xs text-zinc-400">{displayName}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Счётчики ошибок */}
          {errorCount > 0 && (
            <span className="flex items-center gap-1 text-xs text-red-400">
              <XCircle className="h-3.5 w-3.5" />
              {errorCount}
            </span>
          )}
          {warningCount > 0 && (
            <span className="flex items-center gap-1 text-xs text-amber-400">
              <AlertTriangle className="h-3.5 w-3.5" />
              {warningCount}
            </span>
          )}
          <span className="rounded-md bg-zinc-800 px-2 py-0.5 font-mono text-xs text-zinc-400">
            {language}
          </span>
          <span className="text-xs text-zinc-600">{totalLines} строк</span>
        </div>
      </div>

      {/* ── Код ─── */}
      <div className="overflow-x-auto bg-zinc-950 custom-scroll">
        <SyntaxHighlighter
          language={prismLang}
          style={vscDarkPlus}
          showLineNumbers
          wrapLines
          lineProps={(lineNumber: number) => {
            const sev = lineMap.get(lineNumber);
            return {
              style: {
                display: "block",
                ...(sev ? SEVERITY[sev].lineStyle : {}),
              },
            };
          }}
          customStyle={{
            margin:          0,
            borderRadius:    0,
            background:      "transparent",
            fontSize:        "13px",
            lineHeight:      "1.65",
            padding:         "16px 0",
            maxHeight:       "480px",
            overflow:        "auto",
          }}
          lineNumberStyle={{
            minWidth:   "3.2em",
            paddingRight: "1.2em",
            color:      "#52525b",
            userSelect: "none",
          }}
          codeTagProps={{ style: { fontFamily: "'JetBrains Mono', 'Fira Code', monospace" } }}
        >
          {code}
        </SyntaxHighlighter>
      </div>

    </div>
  );
}
