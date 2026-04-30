"use client";

import { Plus, Trash2 } from "lucide-react";
import { useFieldArray, useFormContext, type Control } from "react-hook-form";
import { Input, Label, FieldError } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { AssignmentType } from "@/types";

const PRESETS: Record<"code" | "essay", { name: string; weight: number; description?: string }[]> = {
  code: [
    { name: "Корректность", weight: 10, description: "Решает ли код задачу, обработка краевых случаев" },
    { name: "Читаемость", weight: 6, description: "Имена, структура, конвенции языка" },
    { name: "Производительность", weight: 5, description: "Сложность, лишние операции" },
    { name: "Безопасность", weight: 5, description: "Валидация, обработка ошибок, утечки" },
  ],
  essay: [
    { name: "Соответствие теме", weight: 10 },
    { name: "Структура", weight: 7 },
    { name: "Аргументация", weight: 9 },
    { name: "Грамотность", weight: 6 },
  ],
};

type FormShape = {
  type: AssignmentType;
  criteria: { name: string; weight: number; description?: string }[];
};

export function CriteriaEditor({ type }: { type: "code" | "essay" }) {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<FormShape>();

  const { fields, append, remove, replace } = useFieldArray({
    control: control as unknown as Control<FormShape>,
    name: "criteria",
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label hint={`${fields.length} / 12`}>Критерии оценивания</Label>
        <button
          type="button"
          onClick={() => replace(PRESETS[type])}
          className="cursor-pointer text-xs font-medium text-accent hover:text-accent-700"
        >
          Загрузить пресет
        </button>
      </div>

      <div className="space-y-2">
        {fields.map((field, index) => {
          const fieldErrors = errors.criteria?.[index];
          return (
            <div
              key={field.id}
              className="rounded-xl border border-border bg-surface-elevated/60 p-3"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
                <div className="flex-1">
                  <Input placeholder="Название критерия" {...register(`criteria.${index}.name`)} />
                  <FieldError message={fieldErrors?.name?.message} />
                </div>
                <div className="w-full sm:w-28">
                  <Input
                    type="number"
                    min={1}
                    max={10}
                    placeholder="Вес 1-10"
                    {...register(`criteria.${index}.weight`, { valueAsNumber: true })}
                  />
                  <FieldError message={fieldErrors?.weight?.message} />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="md"
                  onClick={() => remove(index)}
                  className="shrink-0 text-muted hover:text-danger-500"
                  aria-label="Удалить критерий"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-2">
                <Input
                  placeholder="Описание (опционально)"
                  {...register(`criteria.${index}.description`)}
                />
              </div>
            </div>
          );
        })}
      </div>

      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={() => append({ name: "", weight: 5, description: "" })}
        disabled={fields.length >= 12}
      >
        <Plus className="h-4 w-4" />
        Добавить критерий
      </Button>

      <FieldError message={errors.criteria?.message as string | undefined} />
    </div>
  );
}
