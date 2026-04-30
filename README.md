# Assessly

Веб-приложение для автоматической проверки студенческих работ с помощью ИИ.

Поддерживает три типа проверок:

- **Код** — ревью программного кода (корректность, стиль, производительность, безопасность).
- **Эссе** — оценка структуры, аргументации, грамотности и оригинальности текста.
- **Антиплагиат** — определение AI-сгенерированного и заимствованного контента.

## Стек

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS v4
- Prisma + SQLite (готово к миграции на PostgreSQL)
- Groq API
- React Hook Form + Zod, TanStack Query

## Запуск

```bash
npm install
cp .env.example .env.local        # затем заполнить Groq
npm run db:push                    # создать SQLite-схему
npm run dev                        # http://localhost:3000
```

## Скрипты

- `npm run dev` — dev-сервер с Turbopack
- `npm run build` — продакшн-сборка
- `npm run start` — запуск продакшн-сборки
- `npm run lint` — ESLint
- `npm run typecheck` — проверка типов
- `npm run db:push` — применить схему Prisma к БД
- `npm run db:studio` — Prisma Studio
