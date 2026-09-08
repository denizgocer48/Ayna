-- Ayna initial schema.
--
-- Design rules enforced here:
--   1. Every user-owned table has RLS on and a policy keyed to auth.uid().
--   2. Raw scan images live in Storage, never in Postgres, and are deleted once
--      metrics are extracted (see services/api DELETE_IMAGE_AFTER_ANALYSIS).
--   3. Consent is an append-only event log, not a boolean column — we must be
--      able to prove when consent was given and withdrawn.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

create type sex as enum ('male', 'female', 'prefer_not_to_say');

create type scan_status as enum (
  'pending', 'processing', 'complete', 'failed', 'rejected_quality'
);

create type score_band as enum ('low', 'mid', 'high', 'elite');

create type pose as enum ('front', 'side');

create type consent_action as enum ('granted', 'withdrawn');

create type metric_unit as enum ('deg', 'ratio', 'index');

-- ---------------------------------------------------------------------------
-- Profiles
-- ---------------------------------------------------------------------------

create table profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  display_name text check (char_length(display_name) <= 60),
  -- Birth year rather than full birth date: enough to pick a normalisation
  -- band, less personal data held.
  birth_year int not null check (birth_year between 1900 and extract(year from now())),
  sex sex not null,
  goals text[] not null default '{}' check (array_length(goals, 1) is null or array_length(goals, 1) <= 4),
  locale text not null default 'tr-TR',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Ayna is 18+. Enforced in the database so no client or service can bypass it.
alter table profiles add constraint profiles_adults_only
  check (extract(year from now()) - birth_year >= 18);

alter table profiles enable row level security;

create policy "profiles are self-service"
  on profiles for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Consent log (append-only)
-- ---------------------------------------------------------------------------

create table consent_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  action consent_action not null,
  -- Which consent text the user actually saw.
  consent_version text not null,
  occurred_at timestamptz not null default now(),
  ip_hash text,
  user_agent text
);

create index consent_events_user_idx on consent_events (user_id, occurred_at desc);

alter table consent_events enable row level security;

create policy "users read their own consent history"
  on consent_events for select
  using (auth.uid() = user_id);

create policy "users append their own consent events"
  on consent_events for insert
  with check (auth.uid() = user_id);

-- Deliberately no update or delete policy: this log is evidence.

create or replace function has_active_biometric_consent(target_user uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select action = 'granted'
      from consent_events
      where user_id = target_user
      order by occurred_at desc
      limit 1
    ),
    false
  );
$$;

-- ---------------------------------------------------------------------------
-- Reference distributions
-- ---------------------------------------------------------------------------

-- A raw measurement is meaningless without the population it is compared to.
-- Norms live in a table so they can be re-fitted without shipping a release.
create table metric_norms (
  metric_key text not null,
  sex sex not null,
  age_min int not null,
  age_max int not null,
  mean double precision not null,
  stddev double precision not null check (stddev > 0),
  -- Some metrics are best near a target, not maximal (e.g. facial thirds
  -- balance): 'optimal' folds the z-score, 'higher'/'lower' do not.
  direction text not null default 'optimal' check (direction in ('higher', 'lower', 'optimal')),
  source text,
  primary key (metric_key, sex, age_min, age_max)
);

alter table metric_norms enable row level security;

create policy "norms are readable by any authenticated user"
  on metric_norms for select
  to authenticated
  using (true);

-- ---------------------------------------------------------------------------
-- Scans
-- ---------------------------------------------------------------------------

create table scans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  status scan_status not null default 'pending',
  pose pose not null default 'front',
  -- Storage object path. Nulled out once analysis is done and the object is
  -- deleted, unless the user pinned the photo to their progress timeline.
  image_path text,
  image_retained boolean not null default false,
  quality jsonb not null,
  engine_version text,
  failure_reason text,
  captured_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create index scans_user_idx on scans (user_id, captured_at desc);
create index scans_status_idx on scans (status) where status in ('pending', 'processing');

alter table scans enable row level security;

create policy "users read their own scans"
  on scans for select
  using (auth.uid() = user_id);

-- Insert requires live consent. This is the database-level backstop for the
-- consent check the API also performs.
create policy "users create their own scans with consent"
  on scans for insert
  with check (auth.uid() = user_id and has_active_biometric_consent(auth.uid()));

create policy "users delete their own scans"
  on scans for delete
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Scores and metrics
-- ---------------------------------------------------------------------------

create table scores (
  scan_id uuid primary key references scans (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  overall double precision not null check (overall between 0 and 100),
  band score_band not null,
  sub_scores jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index scores_user_idx on scores (user_id, created_at desc);

alter table scores enable row level security;

create policy "users read their own scores"
  on scores for select
  using (auth.uid() = user_id);

create table scan_metrics (
  scan_id uuid not null references scans (id) on delete cascade,
  metric_key text not null,
  raw_value double precision not null,
  unit metric_unit not null,
  percentile double precision not null check (percentile between 0 and 100),
  z_score double precision not null,
  primary key (scan_id, metric_key)
);

alter table scan_metrics enable row level security;

create policy "users read metrics for their own scans"
  on scan_metrics for select
  using (
    exists (
      select 1 from scans
      where scans.id = scan_metrics.scan_id and scans.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- Routines
-- ---------------------------------------------------------------------------

create table routines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  -- The scan this routine was generated from, so advice stays traceable.
  source_scan_id uuid references scans (id) on delete set null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create unique index routines_one_active_per_user
  on routines (user_id) where is_active;

alter table routines enable row level security;

create policy "users manage their own routines"
  on routines for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table routine_items (
  id uuid primary key default gen_random_uuid(),
  routine_id uuid not null references routines (id) on delete cascade,
  title text not null,
  body text,
  category text not null,
  effort text not null check (effort in ('daily', 'weekly', 'one_off')),
  horizon_weeks int not null check (horizon_weeks > 0),
  -- Which metrics produced this item. Never show unattributed advice.
  driven_by text[] not null default '{}',
  sort_order int not null default 0
);

create index routine_items_routine_idx on routine_items (routine_id, sort_order);

alter table routine_items enable row level security;

create policy "users read items of their own routines"
  on routine_items for select
  using (
    exists (
      select 1 from routines
      where routines.id = routine_items.routine_id and routines.user_id = auth.uid()
    )
  );

create table daily_logs (
  user_id uuid not null references auth.users (id) on delete cascade,
  routine_item_id uuid not null references routine_items (id) on delete cascade,
  log_date date not null,
  completed boolean not null default true,
  created_at timestamptz not null default now(),
  primary key (user_id, routine_item_id, log_date)
);

create index daily_logs_user_date_idx on daily_logs (user_id, log_date desc);

alter table daily_logs enable row level security;

create policy "users manage their own logs"
  on daily_logs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Subscriptions (mirror of RevenueCat, written by webhook with service role)
-- ---------------------------------------------------------------------------

create table subscriptions (
  user_id uuid primary key references auth.users (id) on delete cascade,
  entitlement text not null,
  is_active boolean not null default false,
  product_id text,
  store text check (store in ('app_store', 'play_store', 'stripe', 'promotional')),
  period_end timestamptz,
  updated_at timestamptz not null default now()
);

alter table subscriptions enable row level security;

create policy "users read their own subscription"
  on subscriptions for select
  using (auth.uid() = user_id);

-- No user-facing write policy: entitlements are set by the RevenueCat webhook
-- using the service role key. A client that can grant itself entitlements is a
-- client that never pays.

-- ---------------------------------------------------------------------------
-- Deletion requests
-- ---------------------------------------------------------------------------

create table deletion_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  requested_at timestamptz not null default now(),
  completed_at timestamptz,
  scope text not null default 'all' check (scope in ('all', 'scans_only'))
);

alter table deletion_requests enable row level security;

create policy "users manage their own deletion requests"
  on deletion_requests for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Storage
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('scans', 'scans', false, 10485760, array['image/jpeg', 'image/png', 'image/heic'])
on conflict (id) do nothing;

-- Objects are namespaced by user id: scans/<user_id>/<scan_id>.jpg
create policy "users upload into their own scan folder"
  on storage.objects for insert
  with check (
    bucket_id = 'scans'
    and (storage.foldername(name))[1] = auth.uid()::text
    and has_active_biometric_consent(auth.uid())
  );

create policy "users read their own scan objects"
  on storage.objects for select
  using (bucket_id = 'scans' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "users delete their own scan objects"
  on storage.objects for delete
  using (bucket_id = 'scans' and (storage.foldername(name))[1] = auth.uid()::text);

-- ---------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------

create or replace function touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_touch_updated_at
  before update on profiles
  for each row execute function touch_updated_at();
