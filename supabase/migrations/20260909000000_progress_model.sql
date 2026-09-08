-- Replace percentile scoring with progress against the user's own baseline.
--
-- Why: docs/norms.md records that roughly a third of the metrics have no
-- published reference distribution, and that nothing validates our landmark
-- source against the anthropometric literature. A percentile could not be
-- grounded. Progress against the user's own first scan needs no reference
-- population at all, and it is the comparison that matters to them.
--
-- What goes: the scores table, the metric_norms table, and the percentile and
-- z-score columns. What stays: the raw measurements, which are the durable
-- asset — a stored measurement outlives any scoring scheme layered over it.

-- Scores were entirely derived from percentiles. Nothing here survives.
drop table if exists scores;

-- Norms exist to turn a measurement into a percentile. With no percentile,
-- there is nothing for them to do. Reintroduce with the data, not before.
drop table if exists metric_norms;

alter table scan_metrics rename to scan_measurements;
alter table scan_measurements rename column raw_value to value;
alter table scan_measurements drop column percentile;
alter table scan_measurements drop column z_score;
alter table scan_measurements drop column reachable_percentile;

alter policy "users read metrics for their own scans" on scan_measurements
  rename to "users read measurements for their own scans";

-- expected_impact was the share of a *score gap* an item would close. With no
-- score there is no gap to apportion.
alter table routine_items drop column expected_impact;

-- The user's baseline is simply their earliest completed scan. Deriving it
-- rather than storing it means it cannot drift out of sync with the scans.
create or replace function baseline_scan_id(target_user uuid)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id
  from scans
  where user_id = target_user and status = 'complete'
  order by captured_at asc
  limit 1;
$$;

comment on function baseline_scan_id is
  'The user''s earliest completed scan. Every progress comparison is made against this.';
