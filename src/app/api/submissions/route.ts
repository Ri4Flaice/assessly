import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { submissionSchema } from "@/lib/validation";
import { scheduleEvaluation } from "@/lib/gemini/evaluator";
import { serializeSubmission } from "@/lib/serializers";

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Некорректный JSON" }, { status: 400 });
  }

  let input;
  try {
    input = submissionSchema.parse(json);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Ошибка валидации", issues: error.flatten() },
        { status: 422 },
      );
    }
    throw error;
  }

  const assignment = await prisma.assignment.create({
    data: {
      type: input.type,
      title: input.type === "plagiarism" ? null : input.title,
      description: input.type === "plagiarism" ? null : input.description,
      language: input.type === "code" ? input.language : null,
      criteria:
        input.type === "plagiarism" ? Prisma.DbNull : input.criteria,
    },
  });

  const submission = await prisma.submission.create({
    data: {
      assignmentId: assignment.id,
      content: input.content,
      fileName: input.fileName ?? null,
      deviceId: input.deviceId ?? null,
      status: "pending",
    },
  });

  scheduleEvaluation(submission.id);

  return NextResponse.json({ id: submission.id }, { status: 201 });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const deviceId = searchParams.get("deviceId");
  const limit = Math.min(Number(searchParams.get("limit")) || 30, 100);

  const submissions = await prisma.submission.findMany({
    where: deviceId ? { deviceId } : undefined,
    include: { assignment: true, evaluation: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return NextResponse.json({
    submissions: submissions.map(serializeSubmission),
  });
}
