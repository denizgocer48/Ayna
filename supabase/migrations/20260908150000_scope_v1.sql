-- V1 scope: side-profile capture, skin analysis, the reachable-score
-- projection, and the one-free-scan quota.

-- ---------------------------------------------------------------------------
-- A scan now holds one or two images (front required, side optional)
-- ---------------------------------------------------------------------------

create table scan_images (
  scan_id uuid not null references scans (id) on delete cascade,
  pose pose not null,
  -- Nulled out once the object is deleted post-analysis.
  image_path text,
  image_retained boolean not null default false,
  quality jsonb not null,
  primary key (scan_id, pose)
);

alter table scan_images enable row level security;

create policy "users read images of their own scans"
  on scan_images for select
  using (
    exists (
      select 1 from scans
      where scans.id = scan_images.scan_id and scans.user_id = auth.uid()
    )
  );

create policy "users attach images to their own scans"
  on scan_images for insert
  with check (
    exists (
      select 1 from scans
      where scans.id = scan_images.scan_id and scans.user_id = auth.uid()
    )
  );

-- The per-image columns move to scan_images; a scan no longer has one photo.
alter table scans drop column image_path;
alter table scans drop column image_retained;
alter table scans drop column quality;
alter table scans drop column pose;

-- How much assessable skin the segmentation model actually saw. A low value
-- means the skin sub-score should be shown with a caveat, or not at all.
alter table scans add column skin_coverage double precision
  check (skin_coverage is null or skin_coverage between 0 and 1);

-- ---------------------------------------------------------------------------
-- Reachable projection
-- ---------------------------------------------------------------------------

-- Where the score lands if every non-fixed metric reaches its realistic target.
-- Stored rather than recomputed so a historical scan keeps the projection the
-- user actually saw, even after the gain caps are retuned.
alter table scores add column reachable double precision
  check (reachable between 0 and 100);

alter table scores add constraint scores_reachable_not_below_overall
  check (reachable is null or reachable >= overall);

alter table scan_metrics add column reachable_percentile double precision
  check (reachable_percentile is null or reachable_percentile between 0 and 100);

-- Which share of the score gap an item is expected to close, 0-1. Drives the
-- ordering of the routine: highest impact per unit of effort first.
alter table routine_items add column expected_impact double precision not null default 0
  check (expected_impact between 0 and 1);

-- ---------------------------------------------------------------------------
-- One free scan, then the paywall
-- ---------------------------------------------------------------------------

create or replace function has_active_subscription(target_user uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select is_active and (period_end is null or period_end > now())
      from subscriptions
      where user_id = target_user
    ),
    false
  );
$$;

create or replace function can_start_scan(target_user uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  -- The first scan is free so the user sees a real baseline before being asked
  -- to pay. Everything after it requires an active entitlement.
  select has_active_biometric_consent(target_user)
     and (
       has_active_subscription(target_user)
       or (select count(*) from scans where user_id = target_user) < 1
     );
$$;

drop policy "users create their own scans with consent" on scans;

create policy "users create scans within their quota"
  on scans for insert
  with check (auth.uid() = user_id and can_start_scan(auth.uid()));

-- Storage uploads follow the same quota: no point accepting an image for a scan
-- the user is not allowed to start.
drop policy "users upload into their own scan folder" on storage.objects;

create policy "users upload into their own scan folder"
  on storage.objects for insert
  with check (
    bucket_id = 'scans'
    and (storage.foldername(name))[1] = auth.uid()::text
    and can_start_scan(auth.uid())
  );
