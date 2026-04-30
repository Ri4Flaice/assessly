import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { scheduleEvaluation } from "@/lib/gemini/evaluator";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const original = await prisma.submission.findUnique({
    where: { id },
    include: { assignment: true },
  });

  if (!original) {
    return NextResponse.json({ error: "Не найдено" }, { status: 404 });
  }

  if (original.status !== "failed") {
    return NextResponse.json(
      { error: "Повторная отправка доступна только для упавших проверок" },
      { status: 400 },
    );
  }

  // Клонируем задание и создаём новый submission с теми же данными
  const assignment = await prisma.assignment.create({
    data: {
      type: original.assignment.type,
      title: original.assignment.title,
      description: original.assignment.description,
      language: original.assignment.language,
      criteria: original.assignment.criteria ?? Prisma.DbNull,
    },
  });

  const submission = await prisma.submission.create({
    data: {
      assignmentId: assignment.id,
      content: original.content,
      fileName: original.fileName,
      deviceId: original.deviceId,
      status: "pending",
    },
  });

  scheduleEvaluation(submission.id);

  return NextResponse.json({ id: submission.id }, { status: 201 });
}
