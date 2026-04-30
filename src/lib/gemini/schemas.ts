import { z } from "zod";

// Zod-схемы ответа Gemini. Используются для structured output (responseSchema).
// Дублируется как JSON Schema для Gemini SDK через `toGeminiSchema` ниже.

export const codeEvaluationSchema = z.object({
  totalScore: z.number().min(0).max(100),
  criteriaScores: z
    .array(
      z.object({
        name: z.string(),
        score: z.number().min(0),
        max: z.number().min(1),
        comment: z.string(),
      }),
    )
    .min(1),
  strengths: z.array(z.string()).default([]),
  weaknesses: z.array(z.string()).default([]),
  suggestions: z.array(z.string()).default([]),
});

export const essayEvaluationSchema = codeEvaluationSchema; // структура совпадает

export const plagiarismEvaluationSchema = z.object({
  originalityScore: z.number().min(0).max(100),
  aiProbability: z.number().min(0).max(100),
  suspiciousFragments: z
    .array(
      z.object({
        quote: z.string(),
        reason: z.string(),
      }),
    )
    .default([]),
  verdict: z.enum(["clean", "review", "plagiarism"]),
  summary: z.string(),
});

export type CodeEvaluation = z.infer<typeof codeEvaluationSchema>;
export type EssayEvaluation = z.infer<typeof essayEvaluationSchema>;
export type PlagiarismEvaluationResult = z.infer<typeof plagiarismEvaluationSchema>;

// JSON Schema-эквиваленты для Gemini responseSchema.
// Gemini понимает подмножество OpenAPI: type, properties, required, items, enum.

export const geminiCodeEvaluationSchema = {
  type: "object",
  properties: {
    totalScore: { type: "number" },
    criteriaScores: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          score: { type: "number" },
          max: { type: "number" },
          comment: { type: "string" },
        },
        required: ["name", "score", "max", "comment"],
      },
    },
    strengths: { type: "array", items: { type: "string" } },
    weaknesses: { type: "array", items: { type: "string" } },
    suggestions: { type: "array", items: { type: "string" } },
  },
  required: ["totalScore", "criteriaScores", "strengths", "weaknesses", "suggestions"],
} as const;

export const geminiEssayEvaluationSchema = geminiCodeEvaluationSchema;

export const geminiPlagiarismEvaluationSchema = {
  type: "object",
  properties: {
    originalityScore: { type: "number" },
    aiProbability: { type: "number" },
    suspiciousFragments: {
      type: "array",
      items: {
        type: "object",
        properties: {
          quote: { type: "string" },
          reason: { type: "string" },
        },
        required: ["quote", "reason"],
      },
    },
    verdict: { type: "string", enum: ["clean", "review", "plagiarism"] },
    summary: { type: "string" },
  },
  required: [
    "originalityScore",
    "aiProbability",
    "suspiciousFragments",
    "verdict",
    "summary",
  ],
} as const;
