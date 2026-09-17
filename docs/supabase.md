# Supabase: setup, operations, and what happens at scale

## Decisions taken

**Region: Frankfurt (eu-central-1).** Chosen 2026-09-17 and not changeable after
the project is created. Keeping the data inside the EU collapses the KVKK
cross-border question into a single jurisdiction rather than layering a transfer
justification on top of it — see `docs/compliance.md`.

**Plan: Free to begin with.** Enough for Faz 1 and Faz 2: 500 MB of database and
50k monthly active users, neither of which we approach in development.

**Upgrade to Pro before real users exist.** Two reasons, and the first is not
about capacity: the Free plan has no backups, and `consent_events` is evidence —
a consent log that cannot be restored is not much of a log. The Free plan also
pauses a project after a week of inactivity.

## Creating the project

You need to do this part; it needs the account and the billing details.

1. supabase.com → New project. Region **Frankfurt (eu-central-1)**. Save the
   database password somewhere safe — it is shown once.
2. Project Settings → API. Take the **project ref**, the **anon key** and the
   **service role key**.
3. Project Settings → API → JWT Settings. Take the **JWT secret**.

Then, locally:

```bash
export SUPABASE_PROJECT_REF=<ref>
export SUPABASE_ACCESS_TOKEN=<personal access token>   # supabase.com/dashboard/account/tokens

supabase link --project-ref "$SUPABASE_PROJECT_REF"
supabase db push          # applies every migration in supabase/migrations
```

Fill in the two env files — neither is committed:

```
apps/mobile/.env
  EXPO_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
  EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon key>

services/api/.env
  SUPABASE_URL=https://<ref>.supabase.co
  SUPABASE_SERVICE_ROLE_KEY=<service role key>
  SUPABASE_JWT_SECRET=<jwt secret>
```

The anon key is meant to be public — RLS is what protects the data, which is why
`supabase/tests/rls.sql` exists and asserts it. **The service role key bypasses
RLS entirely.** It belongs only on the server, never in the app, never in a
`EXPO_PUBLIC_*` variable.

## Verifying after linking

```bash
supabase db push
psql "$DATABASE_URL" < supabase/tests/rls.sql     # nine assertions, silence means pass
```

Run the RLS suite against the real project once. The policies carry the consent
and quota rules, and a migration that applied cleanly is not the same thing as
policies that behave.

## Development without the cloud project

The whole stack runs locally, including auth:

```bash
supabase start
supabase db reset                                  # re-applies every migration
docker exec -i supabase_db_ayna psql -U postgres -d postgres < supabase/tests/rls.sql
```

## What happens at a million users

Measured rather than guessed. Row sizes come from the real schema:

| | bytes |
| --- | --- |
| One measurement row | 76 |
| All 16 metrics as a single JSONB | 558 |
| One daily-log row | 72 |

At 1M registered users with 20% monthly active — a realistic consumer ratio:

| Item | Working | Monthly |
| --- | --- | --- |
| Pro base | | $25 |
| **Monthly active users** | (200k − 100k) × $0.00325 | **$325** |
| Compute XL, 4 vCPU / 16 GB | | $210 |
| Database storage | ~36 GB/year → (36 − 8) × $0.125 | ~$3.50 |
| Egress | ~10 GB/month against 250 GB included | $0 |
| | | **~$565** |

At 1M *monthly active* users the MAU line becomes $2,925 and the total lands
around $3,400.

**The important number is the one that is missing.** We store no photographs. An
app in this category moving 1M users × 12 photos a year at 2 MB carries **24 TB a
year** — roughly $3,000 a month in storage alone, growing every year, before
egress. We pay about three dollars and fifty cents, because the images never
leave the phone.

The on-device decision was taken for KVKK reasons. This is its second effect.

For scale, measured against revenue: 1M monthly active users converting at 2% on
a $6.99 week is roughly $560k a month. Infrastructure is under one percent of it.

## What actually needs attention

**Connection pooling.** The FastAPI service must connect through Supavisor in
transaction mode, not directly. Micro allows 60 direct connections against 200
pooled, and direct connections are the first thing to break under load.

**`daily_logs` is the row-count driver.** At that scale it grows by roughly 219M
rows a year. The index it needs — `(user_id, log_date desc)` — exists. Partition
by month before the table, not the storage bill, becomes the problem.

**Storage shape for measurements.** Normalised rows cost about 2.2 KB per scan
against 558 bytes as one JSONB. That is four gigabytes a year, or fifty cents a
month, so it does not justify a schema change — and normalised rows stay
queryable for the norms work in `docs/norms.md`.

**Read replicas** are available on Supabase if read load ever justifies them. It
will not for a long time: the app reads a user's own handful of rows.
