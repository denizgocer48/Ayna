# Ayna — architecture

## Shape

```
apps/mobile          Expo (SDK 57) + expo-router + TypeScript
packages/shared      zod schemas — the contract between app and API
services/api         FastAPI: landmarks, metrics, scoring, recommendations
supabase/            Postgres schema, RLS policies, storage buckets
```

Supabase owns identity, data and file storage. The FastAPI service owns
analysis. They are separate because inference needs CPU/GPU time and long-lived
processes, which a Supabase Edge Function (Deno, short-lived) cannot provide.

## Request path for a scan

1. App runs the capture-quality gate on device (`features/scan/quality.ts`).
   A frame that fails never uploads.
2. App uploads the image to Storage at `scans/<user_id>/<scan_id>.jpg`.
   RLS allows the write only if the user has live biometric consent.
3. App calls `POST /scans` with the object path and the quality report.
4. API verifies the Supabase JWT, re-checks consent and quality, inserts the
   scan row as `pending`, enqueues a Celery job, returns `202` immediately.
5. Worker fetches the image with a signed URL, extracts landmarks, computes the
   deterministic metrics, normalises against `metric_norms`, writes `scores` and
   `scan_metrics`, deletes the source object, marks the scan `complete`.
6. App polls `GET /scans/{id}` and renders the result.

Analysis is queued rather than synchronous because it takes seconds. Holding
the HTTP request open ties up a worker and times out on poor mobile networks.

## Why scoring is not an LLM

The score has to be reproducible. Two photos of the same face in the same
session must produce nearly the same number, or the product loses credibility on
first use. Deterministic geometry gives that; a model asked to "rate this face"
does not.

The LLM's job is the *copy*: turning a metric table into a personalised routine.
It receives the metrics, never the image.

## Contract between app and API

`packages/shared` holds the zod schemas. `services/api/app/schemas.py` mirrors
them, and `tests/test_contract.py` fails CI when the two drift. Add a metric in
three places or not at all: the shared metric catalogue, the Python metric
implementation, and a `metric_norms` row.

## Native modules

VisionCamera, Skia, MMKV and RevenueCat are native modules, so **Expo Go will
not run this app**. Development needs an EAS development build:

```bash
npx eas build --profile development --platform ios
```
