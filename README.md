# Ayna

Grooming and skincare progress tracker. Measures facial proportions from a photo
you take, turns them into a baseline, and builds a routine around what you can
actually change.

## Layout

| Path               | What it is                                        |
| ------------------ | ------------------------------------------------- |
| `apps/mobile`      | Expo SDK 57, expo-router, TypeScript               |
| `packages/shared`  | zod schemas — the app/API contract                 |
| `services/api`     | FastAPI: landmarks, metrics, scoring               |
| `supabase/`        | Postgres schema, RLS policies, storage buckets     |
| `docs/`            | architecture, compliance, roadmap                  |

## Getting started

```bash
nvm use                       # Node 22, pinned in .nvmrc
npm install

cp apps/mobile/.env.example apps/mobile/.env
cp services/api/.env.example services/api/.env
# fill both in — Supabase project ref, anon key, JWT secret

npm run mobile                # Expo dev server
npm run api                   # FastAPI on :8000
```

**Expo Go will not work.** VisionCamera, Skia, MMKV and RevenueCat are native
modules, so you need a development build:

```bash
npx eas build --profile development --platform ios
```

## Checks

```bash
npm run typecheck             # every workspace
npm run lint
cd services/api && ruff check . && pytest
```

## Before changing anything about photos, consent or scoring

Read `docs/compliance.md`. Several constraints in the schema and the onboarding
flow are legal requirements, not preferences.
