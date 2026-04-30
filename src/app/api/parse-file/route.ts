import { NextResponse } from "next/server";

export const runtime = "nodejs";

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB

export async function POST(request: Request) {
  const fileType = request.headers.get("x-file-type");
  if (!fileType || !["pdf", "docx"].includes(fileType)) {
    return NextResponse.json({ error: "Неверный x-file-type" }, { status: 400 });
  }

  const buf = Buffer.from(await request.arrayBuffer());
  if (buf.byteLength > MAX_BYTES) {
    return NextResponse.json({ error: "Файл слишком большой (>8MB)" }, { status: 413 });
  }

  try {
    if (fileType === "pdf") {
      // Динамический импорт — pdf-parse тянет debug-mode при require
      const pdfParse = (await import("pdf-parse")).default;
      const data = await pdfParse(buf);
      return NextResponse.json({ text: data.text });
    }
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer: buf });
    return NextResponse.json({ text: result.value });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Ошибка парсинга";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
