"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, AlertCircle, RotateCcw } from "lucide-react";
import { TypeSelector } from "./TypeSelector";
import { CriteriaEditor } from "./CriteriaEditor";
import { FileDropzone } from "./FileDropzone";
import { Card, CardDescription, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Label, FieldError } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { submissionSchema, type SubmissionInput } from "@/lib/validation";
import { SUPPORTED_LANGUAGES, type AssignmentType } from "@/types";
import { getDeviceId } from "@/lib/device";
import { loadLastAssignment, saveLastAssignment } from "@/lib/lastForm";

const DEFAULT_CRITERIA = [
  { name: "Корректность", weight: 10, description: "Решает ли работа задачу" },
  { name: "Качество", weight: 7, description: "Стиль, читаемость, аккуратность" },
];

const CODE_ACCEPT =
  ".py,.js,.ts,.tsx,.jsx,.java,.cs,.cpp,.cc,.c,.h,.hpp,.go,.rs,.kt,.swift,.php,.rb,.sql,.html,.css,.txt,.md";
const TEXT_ACCEPT = ".txt,.md,.pdf,.docx";

export function SubmissionForm() {
  const router = useRouter();
  const [type, setType] = useState<AssignmentType>("code");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [autoFilled, setAutoFilled] = useState(false);

  // Флаг «первый рендер» чтобы не перетирать данные при SSR
  const mounted = useRef(false);

  const methods = useForm<SubmissionInput>({
    resolver: zodResolver(submissionSchema),
    defaultValues: {
      type: "code",
      title: "",
      description: "",
      language: "python",
      criteria: DEFAULT_CRITERIA,
      content: "",
    } as unknown as SubmissionInput,
    mode: "onBlur",
  });

  const { register, handleSubmit, setValue, control, formState, reset, watch } = methods;
  const errors = formState.errors as Record<string, { message?: string } | undefined>;

  // При смене типа — сбрасываем форму и подгружаем сохранённые данные
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
    }

    setAutoFilled(false);

    if (type === "code") {
      const saved = loadLastAssignment("code");
      reset({
        type: "code",
        title: saved?.title ?? "",
        description: saved?.description ?? "",
        language: saved?.language ?? "python",
        criteria: saved?.criteria ?? DEFAULT_CRITERIA,
        content: "",
      } as unknown as SubmissionInput);
      if (saved?.title) setAutoFilled(true);
    } else if (type === "essay") {
      const saved = loadLastAssignment("essay");
      reset({
        type: "essay",
        title: saved?.title ?? "",
        description: saved?.description ?? "",
        criteria: saved?.criteria ?? DEFAULT_CRITERIA,
        content: "",
      } as unknown as SubmissionInput);
      if (saved?.title) setAutoFilled(true);
    } else {
      reset({ type: "plagiarism", content: "" } as unknown as SubmissionInput);
    }
  }, [type, reset]);

  const contentValue = watch("content" as keyof SubmissionInput) as string | undefined;

  const onSubmit = async (data: SubmissionInput) => {
    setSubmitError(null);
    setSubmitting(true);

    // Сохраняем поля задания (не контент) перед отправкой
    if (data.type === "code") {
      saveLastAssignment("code", {
        title: data.title,
        description: data.description,
        language: data.language,
        criteria: data.criteria,
      });
    } else if (data.type === "essay") {
      saveLastAssignment("essay", {
        title: data.title,
        description: data.description,
        criteria: data.criteria,
      });
    }

    try {
      const deviceId = getDeviceId();
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, deviceId }),
      });
      if (!response.ok) {
        throw new Error("Не удалось отправить работу на проверку. Попробуйте ещё раз.");
      }
      const json = (await response.json()) as { id: string };
      router.push(`/result/${json.id}`);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Ошибка отправки");
      setSubmitting(false);
    }
  };

  const handleClearAutoFill = () => {
    setAutoFilled(false);
    if (type === "code") {
      reset({
        type: "code",
        title: "",
        description: "",
        language: "python",
        criteria: DEFAULT_CRITERIA,
        content: "",
      } as unknown as SubmissionInput);
    } else if (type === "essay") {
      reset({
        type: "essay",
        title: "",
        description: "",
        criteria: DEFAULT_CRITERIA,
        content: "",
      } as unknown as SubmissionInput);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Тип */}
        <Card>
          <CardTitle>Тип проверки</CardTitle>
          <CardDescription className="mt-0.5">
            Выберите что нужно проверить — поля формы подстроятся автоматически.
          </CardDescription>
          <div className="mt-4">
            <TypeSelector value={type} onChange={setType} />
          </div>
        </Card>

        {/* Автозаполнение — тихий баннер */}
        {autoFilled && type !== "plagiarism" && (
          <div className="flex items-center justify-between rounded-xl border border-accent-200 bg-accent-50 px-4 py-2.5 text-sm">
            <span className="text-accent-700">
              Заполнено из последней проверки этого типа
            </span>
            <button
              type="button"
              onClick={handleClearAutoFill}
              className="flex cursor-pointer items-center gap-1.5 text-xs text-accent-600 hover:text-accent-800"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Очистить
            </button>
          </div>
        )}

        {/* Условие задания */}
        {type !== "plagiarism" && (
          <Card>
            <CardTitle>Условие задания</CardTitle>
            <CardDescription className="mt-0.5">
              Что должен был сделать студент. ИИ оценивает работу относительно этого.
            </CardDescription>
            <div className="mt-4 space-y-4">
              <div>
                <Label htmlFor="title" required>Заголовок задания</Label>
                <Input
                  id="title"
                  placeholder={
                    type === "code"
                      ? "Реализовать функцию факториала"
                      : "Эссе на тему: роль ИИ в образовании"
                  }
                  {...register("title" as never)}
                />
                <FieldError message={errors.title?.message} />
              </div>

              <div className="custom-scroll">
                <style>{`
                  .custom-scroll textarea::-webkit-scrollbar {
                    height: 8px;
                    width: 8px;
                  }
                  .custom-scroll textarea::-webkit-scrollbar-track {
                    background: var(--color-surface); /* zinc-900 */
                    margin: 4px;
                  }
                  .custom-scroll textarea::-webkit-scrollbar-thumb {
                    background: #3f3f46; /* zinc-700 */
                    border-radius: 6px;
                  }
                  .custom-scroll textarea::-webkit-scrollbar-thumb:hover {
                    background: #52525b; /* zinc-600 */
                    cursor: pointer;
                  }
                `}</style>
                <Label htmlFor="description" required>Описание</Label>
                <Textarea
                  id="description"
                  rows={4}
                  placeholder={
                    type === "code"
                      ? "Напишите функцию, которая принимает число n и возвращает n!..."
                      : "Раскройте тему в 300-500 словах. Приведите минимум 2 аргумента..."
                  }
                  {...register("description" as never)}
                />
                <FieldError message={errors.description?.message} />
              </div>

              {type === "code" && (
                <div>
                  <Label htmlFor="language" required>Язык программирования</Label>
                  <Controller
                    name={"language" as never}
                    control={control as never}
                    render={({ field }) => (
                      <Select
                        id="language"
                        options={[...SUPPORTED_LANGUAGES]}
                        value={field.value as string}
                        onChange={field.onChange}
                      />
                    )}
                  />
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Критерии */}
        {type !== "plagiarism" && (
          <Card>
            <CardTitle>Критерии оценивания</CardTitle>
            <CardDescription className="mt-0.5">
              ИИ оценивает работу строго по этим критериям. Вес влияет на итоговую оценку.
            </CardDescription>
            <div className="mt-4">
              <CriteriaEditor type={type} />
            </div>
          </Card>
        )}

        {/* Контент */}
        <Card>
          <CardTitle>
            {type === "plagiarism" ? "Текст для проверки" : "Работа студента"}
          </CardTitle>
          <CardDescription className="mt-0.5">
            {type === "code"
              ? "Вставьте код или загрузите файл с исходным кодом."
              : type === "essay"
                ? "Вставьте текст эссе или загрузите файл."
                : "Вставьте текст или загрузите PDF / DOCX для проверки на плагиат."}
          </CardDescription>

          <div className="mt-4 space-y-3">
            <FileDropzone
              accept={type === "code" ? CODE_ACCEPT : TEXT_ACCEPT}
              hint={type === "code" ? "Файлы исходного кода" : "txt, md, pdf, docx — до 8 МБ"}
              onLoad={(text, fileName) => {
                setValue("content" as never, text as never, { shouldValidate: true });
                setValue("fileName" as never, fileName as never);
              }}
            />

            <div className="custom-scroll">
              <style>{`
                .custom-scroll textarea::-webkit-scrollbar {
                  height: 8px;
                  width: 8px;
                }
                .custom-scroll textarea::-webkit-scrollbar-track {
                  background: var(--color-surface); /* zinc-900 */
                  margin: 4px;
                }
                .custom-scroll textarea::-webkit-scrollbar-thumb {
                  background: #3f3f46; /* zinc-700 */
                  border-radius: 6px;
                }
                .custom-scroll textarea::-webkit-scrollbar-thumb:hover {
                  background: #52525b; /* zinc-600 */
                  cursor: pointer;
                }
              `}</style>
              <Label
                htmlFor="content"
                required
                hint={`${(contentValue ?? "").length} симв.`}
              >
                Содержимое
              </Label>
              <Textarea
                id="content"
                rows={type === "code" ? 12 : 10}
                className={type === "code" ? "font-mono text-xs" : ""}
                placeholder={
                  type === "code"
                    ? "def factorial(n):\n    ..."
                    : "Введите текст работы..."
                }
                {...register("content" as never)}
              />
              <FieldError message={errors.content?.message} />
            </div>
          </div>
        </Card>

        {submitError && (
          <div className="flex items-center gap-2 rounded-xl border border-danger-200 bg-danger-100 px-4 py-3 text-sm text-danger-600">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {submitError}
          </div>
        )}

        <div className="flex justify-end pt-1">
          <Button type="submit" size="lg" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Отправка...
              </>
            ) : (
              "Отправить на проверку"
            )}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
