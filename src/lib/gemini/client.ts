import Groq from "groq-sdk";

let cached: Groq | null = null;

export function getGroqClient(): Groq {
  if (cached) return cached;
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GROQ_API_KEY не задан. Добавьте его в .env.local (получить бесплатно: https://console.groq.com/keys).",
    );
  }
  cached = new Groq({ apiKey });
  return cached;
}

// llama-3.3-70b-versatile — лучшее качество для сложных кейсов (код, эссе).
// llama-3.1-8b-instant — очень быстрый, хорош для антиплагиата.
export const GROQ_MODELS = {
  main: "llama-3.3-70b-versatile",
  fast: "llama-3.1-8b-instant",
} as const;

export type GroqModel = (typeof GROQ_MODELS)[keyof typeof GROQ_MODELS];
