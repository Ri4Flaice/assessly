// Стабильный device id для истории без авторизации.
// Хранится в localStorage. На SSR возвращает пустую строку — обращение только в эффектах.

const KEY = "assessly:device-id";

export function getDeviceId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = (crypto.randomUUID?.() ?? `dev-${Math.random().toString(36).slice(2)}`).slice(
      0,
      64,
    );
    localStorage.setItem(KEY, id);
  }
  return id;
}
