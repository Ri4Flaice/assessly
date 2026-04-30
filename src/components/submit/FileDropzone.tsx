"use client";

import { useRef, useState } from "react";
import { Upload, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  accept: string;
  onLoad: (text: string, fileName: string) => void;
  hint?: string;
};

export function FileDropzone({ accept, onLoad, hint }: Props) {
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setError(null);
    setLoading(true);
    try {
      const ext = file.name.toLowerCase().split(".").pop() ?? "";
      let text = "";
      if (ext === "pdf") {
        const buf = await file.arrayBuffer();
        const res = await fetch("/api/parse-file", {
          method: "POST",
          headers: { "x-file-type": "pdf", "x-file-name": file.name },
          body: buf,
        });
        if (!res.ok) throw new Error("Не удалось прочитать PDF");
        const json = (await res.json()) as { text: string };
        text = json.text;
      } else if (ext === "docx") {
        const buf = await file.arrayBuffer();
        const res = await fetch("/api/parse-file", {
          method: "POST",
          headers: { "x-file-type": "docx", "x-file-name": file.name },
          body: buf,
        });
        if (!res.ok) throw new Error("Не удалось прочитать DOCX");
        const json = (await res.json()) as { text: string };
        text = json.text;
      } else {
        text = await file.text();
      }
      setFileName(file.name);
      onLoad(text, file.name);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка чтения файла");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) =>
          (e.key === "Enter" || e.key === " ") && inputRef.current?.click()
        }
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const file = e.dataTransfer.files?.[0];
          if (file) void handleFile(file);
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-6 text-center transition-all duration-200",
          dragOver
            ? "border-accent bg-accent-50"
            : "border-border bg-surface hover:border-primary-300 hover:bg-surface-elevated",
        )}
      >
        {fileName ? (
          <>
            <FileText className="h-6 w-6 text-success" />
            <p className="text-sm font-medium text-primary-800">{fileName}</p>
            <p className="text-xs text-muted">Загружен. Нажмите, чтобы заменить.</p>
          </>
        ) : (
          <>
            <Upload className="h-6 w-6 text-muted" />
            <p className="text-sm font-medium text-primary-700">
              {loading ? "Чтение файла..." : "Перетащите или нажмите, чтобы выбрать"}
            </p>
            {hint && <p className="text-xs text-muted">{hint}</p>}
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
          }}
        />
      </div>
      {error && <p className="mt-2 text-xs text-danger-500">{error}</p>}
    </div>
  );
}
