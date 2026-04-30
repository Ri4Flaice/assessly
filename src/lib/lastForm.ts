// Сохраняет и загружает поля задания (не контент работы) из localStorage.
// Ключи раздельные по типу, чтобы пресеты кода и эссе не перемешивались.

const STORAGE_KEYS = {
  code: "assessly:last-code",
  essay: "assessly:last-essay",
} as const;

export type SavedAssignment = {
  title: string;
  description: string;
  language?: string;
  criteria: { name: string; weight: number; description?: string }[];
};

export function saveLastAssignment(
  type: "code" | "essay",
  data: SavedAssignment,
): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS[type], JSON.stringify(data));
  } catch {
    // localStorage может быть заблокирован в приватном режиме
  }
}

export function loadLastAssignment(
  type: "code" | "essay",
): SavedAssignment | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS[type]);
    if (!raw) return null;
    return JSON.parse(raw) as SavedAssignment;
  } catch {
    return null;
  }
}
