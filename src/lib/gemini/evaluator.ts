import { prisma } from "@/lib/db";
import type { CriterionInput } from "@/lib/validation";
import {
  buildCodePrompt,
  buildEssayPrompt,
  buildPlagiarismPrompt,
} from "./prompts";
import {
  codeEvaluationSchema,
  essayEvaluationSchema,
  plagiarismEvaluationSchema,
} from "./schemas";
import { GROQ_MODELS, getGroqClient, type GroqModel } from "./client";

type CallParams = {
  prompt: string;
  model: GroqModel;
};

async function callGroq({ prompt, model }: CallParams): Promise<{
  rawText: string;
  parsed: unknown;
}> {
  const client = getGroqClient();

  const completion = await client.chat.completions.create({
    model,
    temperature: 0.2,
    response_format: { type: "json_object" },
    messages: [{ role: "user", content: prompt }],
  });

  const text = completion.choices[0]?.message?.content;
  if (!text) throw new Error("Groq вернул пустой ответ");

  console.log("[Groq raw response]", text.slice(0, 800));

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("Не удалось распарсить JSON из ответа Groq");
  }

  return { rawText: text, parsed };
}

// ── Нормализация ответа ────────────────────────────────────────────────────────
// Llama-3 часто возвращает snake_case, альтернативные имена полей или
// оборачивает ответ в ключ-обёртку. Нормализуем всё это к нашей схеме.

function pick<T>(obj: Record<string, unknown>, keys: string[]): T | undefined {
  for (const k of keys) {
    if (obj[k] !== undefined) return obj[k] as T;
  }
  return undefined;
}

function unwrapRoot(raw: unknown): Record<string, unknown> {
  if (typeof raw !== "object" || raw === null) return {};
  const obj = raw as Record<string, unknown>;

  // Если ответ обёрнут в ключ ({"evaluation": {...}}, {"result": {...}} и т.д.)
  const wrappers = ["evaluation", "result", "response", "data", "output", "assessment"];
  for (const key of wrappers) {
    if (obj[key] && typeof obj[key] === "object" && !Array.isArray(obj[key])) {
      const inner = obj[key] as Record<string, unknown>;
      // Убеждаемся что внутри есть наши поля
      if (
        "totalScore" in inner ||
        "total_score" in inner ||
        "criteriaScores" in inner ||
        "criteria_scores" in inner ||
        "originalityScore" in inner ||
        "originality_score" in inner
      ) {
        return inner;
      }
    }
  }
  return obj;
}

function normalizeCriteriaItem(item: unknown): Record<string, unknown> {
  if (typeof item !== "object" || item === null) return {};
  const s = item as Record<string, unknown>;
  return {
    name: pick(s, ["name", "criterion", "criterion_name", "category", "criteria_name"]) ?? "—",
    score: pick(s, ["score", "points", "earned_points", "received_points", "achieved", "grade"]) ?? 0,
    max: pick(s, ["max", "maximum", "max_score", "max_points", "total_points", "out_of", "possible_points"]) ?? 10,
    comment: pick(s, ["comment", "feedback", "explanation", "rationale", "justification", "notes", "details"]) ?? "",
  };
}

function normalizeEvaluationResponse(raw: unknown): unknown {
  const obj = unwrapRoot(raw);
  const criteriaRaw = pick<unknown[]>(obj, ["criteriaScores", "criteria_scores", "criteria", "criterion_scores"]) ?? [];
  return {
    totalScore: pick(obj, ["totalScore", "total_score", "score", "final_score", "overall_score"]) ?? 0,
    criteriaScores: Array.isArray(criteriaRaw)
      ? criteriaRaw.map(normalizeCriteriaItem)
      : [],
    strengths: pick(obj, ["strengths", "strong_points", "positives", "pros"]) ?? [],
    weaknesses: pick(obj, ["weaknesses", "weak_points", "areas_for_improvement", "cons", "negatives"]) ?? [],
    suggestions: pick(obj, ["suggestions", "recommendations", "improvements", "tips"]) ?? [],
  };
}

function normalizePlagiarismResponse(raw: unknown): unknown {
  const obj = unwrapRoot(raw);
  const fragments = pick<unknown[]>(obj, [
    "suspiciousFragments",
    "suspicious_fragments",
    "suspicious_passages",
    "flagged_fragments",
    "plagiarized_fragments",
  ]) ?? [];
  return {
    originalityScore: pick(obj, ["originalityScore", "originality_score", "originality", "original_percentage"]) ?? 100,
    aiProbability: pick(obj, ["aiProbability", "ai_probability", "ai_generated_probability", "ai_score", "ai_likelihood"]) ?? 0,
    suspiciousFragments: Array.isArray(fragments)
      ? fragments.map((f) => {
          if (typeof f !== "object" || f === null) return { quote: "", reason: "" };
          const ff = f as Record<string, unknown>;
          return {
            quote: pick(ff, ["quote", "text", "fragment", "passage", "excerpt"]) ?? "",
            reason: pick(ff, ["reason", "explanation", "justification", "why", "note"]) ?? "",
          };
        })
      : [],
    verdict: pick(obj, ["verdict", "conclusion", "result", "judgment"]) ?? "review",
    summary: pick(obj, ["summary", "overview", "conclusion_text", "analysis_summary"]) ?? "",
  };
}

// ── Основной evaluator ─────────────────────────────────────────────────────────

type SubmissionRecord = {
  id: string;
  type: "code" | "essay" | "plagiarism";
  content: string;
  language?: string | null;
  title?: string | null;
  description?: string | null;
  criteria?: CriterionInput[] | null;
};

export async function evaluateSubmission(submissionId: string): Promise<void> {
  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: { assignment: true },
  });
  if (!submission) throw new Error(`Submission ${submissionId} не найден`);

  await prisma.submission.update({
    where: { id: submissionId },
    data: { status: "processing", errorMessage: null },
  });

  try {
    const a = submission.assignment;
    const type = a.type as "code" | "essay" | "plagiarism";
    const criteria = a.criteria as CriterionInput[] | null;

    const record: SubmissionRecord = {
      id: submission.id,
      type,
      content: submission.content,
      language: a.language,
      title: a.title,
      description: a.description,
      criteria,
    };

    const model: GroqModel =
      type === "plagiarism" ? GROQ_MODELS.fast : GROQ_MODELS.main;

    if (type === "code") {
      if (!record.language || !record.title || !record.description || !record.criteria) {
        throw new Error("Отсутствуют обязательные поля задания для типа 'code'");
      }
      const prompt = buildCodePrompt({
        language: record.language,
        title: record.title,
        description: record.description,
        criteria: record.criteria,
        content: record.content,
      });
      const { rawText, parsed } = await callGroq({ prompt, model });
      const normalized = normalizeEvaluationResponse(parsed);
      const result = codeEvaluationSchema.parse(normalized);

      await prisma.evaluation.create({
        data: {
          submissionId: submission.id,
          totalScore: result.totalScore,
          criteriaScores: result.criteriaScores,
          strengths: result.strengths,
          weaknesses: result.weaknesses,
          suggestions: result.suggestions,
          rawResponse: rawText,
          modelUsed: model,
        },
      });
    } else if (type === "essay") {
      if (!record.title || !record.description || !record.criteria) {
        throw new Error("Отсутствуют обязательные поля задания для типа 'essay'");
      }
      const prompt = buildEssayPrompt({
        title: record.title,
        description: record.description,
        criteria: record.criteria,
        content: record.content,
      });
      const { rawText, parsed } = await callGroq({ prompt, model });
      const normalized = normalizeEvaluationResponse(parsed);
      const result = essayEvaluationSchema.parse(normalized);

      await prisma.evaluation.create({
        data: {
          submissionId: submission.id,
          totalScore: result.totalScore,
          criteriaScores: result.criteriaScores,
          strengths: result.strengths,
          weaknesses: result.weaknesses,
          suggestions: result.suggestions,
          rawResponse: rawText,
          modelUsed: model,
        },
      });
    } else {
      const prompt = buildPlagiarismPrompt({ content: record.content });
      const { rawText, parsed } = await callGroq({ prompt, model });
      const normalized = normalizePlagiarismResponse(parsed);
      const result = plagiarismEvaluationSchema.parse(normalized);

      await prisma.evaluation.create({
        data: {
          submissionId: submission.id,
          originalityScore: result.originalityScore,
          aiProbability: result.aiProbability,
          suspiciousFragments: result.suspiciousFragments,
          plagiarismVerdict: result.verdict,
          plagiarismSummary: result.summary,
          rawResponse: rawText,
          modelUsed: model,
        },
      });
    }

    await prisma.submission.update({
      where: { id: submissionId },
      data: { status: "done" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Неизвестная ошибка";
    console.error(`[Evaluation failed] ${submissionId}:`, message);
    await prisma.submission.update({
      where: { id: submissionId },
      data: { status: "failed", errorMessage: message },
    });
  }
}

export function scheduleEvaluation(submissionId: string): void {
  void evaluateSubmission(submissionId).catch((error) => {
    console.error("Unhandled evaluation error:", error);
  });
}
