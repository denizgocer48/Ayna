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

# Database and RLS, against a local stack
supabase start
docker exec -i supabase_db_ayna psql -U postgres -d postgres < supabase/tests/rls.sql
```

The RLS script asserts the consent and quota rules as behaviour. Silence means
every assertion passed; any failure raises and aborts.

## Picking up the project

Start with `docs/README.md`, which indexes the rest. `docs/handoff.md` has the
current status, environment traps, what is real versus placeholder, and the next
task in order.

## Before changing anything about photos, consent or scoring

Read `docs/compliance.md`. Several constraints in the schema and the onboarding
flow are legal requirements, not preferences.

## MCP servers

`.mcp.json` is committed and this repo is public, so it holds no credentials —
it reads them from the environment. Export these in your shell profile before
starting Claude Code:

```bash
export SUPABASE_PROJECT_REF=your-project-ref
export SUPABASE_ACCESS_TOKEN=sbp_...   # never commit this
```

A Supabase personal access token grants access to every project on the account.
If one is ever committed, revoke it at supabase.com/dashboard/account/tokens
rather than trying to rewrite history.
