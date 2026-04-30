import { z } from "zod";

const criterionSchema = z.object({
  name: z.string().min(1, "Укажите название критерия").max(80),
  weight: z.coerce.number().int().min(1).max(10),
  description: z.string().max(300).optional().or(z.literal("")),
});

const criteriaArraySchema = z
  .array(criterionSchema)
  .min(1, "Добавьте хотя бы один критерий")
  .max(12, "Слишком много критериев");

const baseSubmission = {
  deviceId: z.string().min(1).max(64).optional(),
  fileName: z.string().max(200).optional(),
};

export const codeSubmissionSchema = z.object({
  type: z.literal("code"),
  title: z.string().min(2, "Минимум 2 символа").max(120),
  description: z.string().min(10, "Опишите задание подробнее").max(4000),
  language: z.string().min(1),
  criteria: criteriaArraySchema,
  content: z.string().min(5, "Загрузите код").max(200_000),
  ...baseSubmission,
});

export const essaySubmissionSchema = z.object({
  type: z.literal("essay"),
  title: z.string().min(2).max(120),
  description: z.string().min(10).max(4000),
  criteria: criteriaArraySchema,
  content: z.string().min(50, "Эссе слишком короткое").max(200_000),
  ...baseSubmission,
});

export const plagiarismSubmissionSchema = z.object({
  type: z.literal("plagiarism"),
  content: z.string().min(50, "Минимум 50 символов для проверки").max(200_000),
  ...baseSubmission,
});

export const submissionSchema = z.discriminatedUnion("type", [
  codeSubmissionSchema,
  essaySubmissionSchema,
  plagiarismSubmissionSchema,
]);

export type SubmissionInput = z.infer<typeof submissionSchema>;
export type CodeSubmissionInput = z.infer<typeof codeSubmissionSchema>;
export type EssaySubmissionInput = z.infer<typeof essaySubmissionSchema>;
export type PlagiarismSubmissionInput = z.infer<typeof plagiarismSubmissionSchema>;
export type CriterionInput = z.infer<typeof criterionSchema>;
