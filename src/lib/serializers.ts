import type {
  CriterionScore,
  SuspiciousFragment,
  CodeEssayEvaluation,
  PlagiarismEvaluation,
  PlagiarismVerdict,
  AssignmentType,
  Criterion,
  SubmissionStatus,
} from "@/types";

function parseJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

type SubmissionWithEval = {
  id: string;
  status: string;
  errorMessage: string | null;
  fileName: string | null;
  content: string;
  createdAt: Date;
  assignment: {
    id: string;
    title: string | null;
    description: string | null;
    type: string;
    language: string | null;
    criteria: string | null;
  };
  evaluation: {
    id: string;
    totalScore: number | null;
    criteriaScores: string | null;
    strengths: string | null;
    weaknesses: string | null;
    suggestions: string | null;
    originalityScore: number | null;
    aiProbability: number | null;
    suspiciousFragments: string | null;
    plagiarismVerdict: string | null;
    plagiarismSummary: string | null;
    modelUsed: string;
    createdAt: Date;
  } | null;
};

export type SubmissionPayload = {
  id: string;
  status: SubmissionStatus;
  errorMessage: string | null;
  createdAt: string;
  assignment: {
    id: string;
    type: AssignmentType;
    title: string | null;
    description: string | null;
    language: string | null;
    criteria: Criterion[] | null;
  };
  content: string;
  fileName: string | null;
  evaluation:
    | ({ id: string; modelUsed: string; createdAt: string } & (
        | ({ kind: "code-essay" } & CodeEssayEvaluation)
        | ({ kind: "plagiarism" } & PlagiarismEvaluation)
      ))
    | null;
};

export function serializeSubmission(s: SubmissionWithEval): SubmissionPayload {
  const type = s.assignment.type as AssignmentType;
  const criteria = parseJson<Criterion[] | null>(s.assignment.criteria, null);

  let evaluation: SubmissionPayload["evaluation"] = null;
  if (s.evaluation) {
    const e = s.evaluation;
    if (type === "plagiarism") {
      evaluation = {
        kind: "plagiarism",
        id: e.id,
        modelUsed: e.modelUsed,
        createdAt: e.createdAt.toISOString(),
        originalityScore: e.originalityScore ?? 0,
        aiProbability: e.aiProbability ?? 0,
        suspiciousFragments: parseJson<SuspiciousFragment[]>(e.suspiciousFragments, []),
        verdict: (e.plagiarismVerdict as PlagiarismVerdict) ?? "review",
        summary: e.plagiarismSummary ?? "",
      };
    } else {
      evaluation = {
        kind: "code-essay",
        id: e.id,
        modelUsed: e.modelUsed,
        createdAt: e.createdAt.toISOString(),
        totalScore: e.totalScore ?? 0,
        criteriaScores: parseJson<CriterionScore[]>(e.criteriaScores, []),
        strengths: parseJson<string[]>(e.strengths, []),
        weaknesses: parseJson<string[]>(e.weaknesses, []),
        suggestions: parseJson<string[]>(e.suggestions, []),
      };
    }
  }

  return {
    id: s.id,
    status: s.status as SubmissionStatus,
    errorMessage: s.errorMessage,
    createdAt: s.createdAt.toISOString(),
    assignment: {
      id: s.assignment.id,
      type,
      title: s.assignment.title,
      description: s.assignment.description,
      language: s.assignment.language,
      criteria,
    },
    content: s.content,
    fileName: s.fileName,
    evaluation,
  };
}
