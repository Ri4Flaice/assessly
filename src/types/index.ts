export type AssignmentType = "code" | "essay" | "plagiarism";

export type SubmissionStatus = "pending" | "processing" | "done" | "failed";

export type Criterion = {
  name: string;
  weight: number; // 1..10
  description?: string;
};

export type CriterionScore = {
  name: string;
  score: number;
  max: number;
  comment: string;
};

export type SuspiciousFragment = {
  quote: string;
  reason: string;
};

export type PlagiarismVerdict = "clean" | "review" | "plagiarism";

export type CodeEssayEvaluation = {
  totalScore: number;
  criteriaScores: CriterionScore[];
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
};

export type PlagiarismEvaluation = {
  originalityScore: number;
  aiProbability: number;
  suspiciousFragments: SuspiciousFragment[];
  verdict: PlagiarismVerdict;
  summary: string;
};

export const SUPPORTED_LANGUAGES = [
  { value: "python", label: "Python" },
  { value: "typescript", label: "TypeScript" },
  { value: "javascript", label: "JavaScript" },
  { value: "java", label: "Java" },
  { value: "csharp", label: "C#" },
  { value: "cpp", label: "C++" },
  { value: "c", label: "C" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "kotlin", label: "Kotlin" },
  { value: "swift", label: "Swift" },
  { value: "php", label: "PHP" },
  { value: "ruby", label: "Ruby" },
  { value: "sql", label: "SQL" },
  { value: "html", label: "HTML/CSS" },
  { value: "other", label: "Другой" },
] as const;

export type LanguageValue = (typeof SUPPORTED_LANGUAGES)[number]["value"];
