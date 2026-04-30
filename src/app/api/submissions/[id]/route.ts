import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { serializeSubmission } from "@/lib/serializers";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const submission = await prisma.submission.findUnique({
    where: { id },
    include: { assignment: true, evaluation: true },
  });

  if (!submission) {
    return NextResponse.json({ error: "Не найдено" }, { status: 404 });
  }

  return NextResponse.json(serializeSubmission(submission));
}
