-- RLS behaviour tests.
--
-- These policies carry the product's consent and quota enforcement, so they are
-- tested as behaviour rather than reviewed by eye. Run against a local stack:
--
--   supabase start
--   docker exec -i supabase_db_ayna psql -U postgres -d postgres < supabase/tests/rls.sql
--
-- Any failure raises and aborts. Silence means every assertion passed.

begin;

-- Two users. u2 exists only to prove one user cannot see another's data.
insert into auth.users (id, email, aud, role)
values
  ('11111111-1111-1111-1111-111111111111', 'u1@test.local', 'authenticated', 'authenticated'),
  ('22222222-2222-2222-2222-222222222222', 'u2@test.local', 'authenticated', 'authenticated');

insert into profiles (user_id, birth_year, sex)
values
  ('11111111-1111-1111-1111-111111111111', 1995, 'male'),
  ('22222222-2222-2222-2222-222222222222', 1990, 'female');

create or replace function act_as(user_id uuid) returns void language plpgsql as $$
begin
  perform set_config('role', 'authenticated', true);
  perform set_config('request.jwt.claims',
    json_build_object('sub', user_id::text, 'role', 'authenticated')::text, true);
end;
$$;

create or replace function assert_fails(statement text, label text) returns void
language plpgsql as $$
begin
  execute statement;
  raise exception 'FAIL: % — statement was allowed but should have been blocked', label;
exception
  when insufficient_privilege or check_violation then
    raise notice 'ok: % correctly blocked', label;
end;
$$;

-- 1. The adults-only constraint is a database rule, not a client convention.
do $$
begin
  perform assert_fails(
    format('insert into profiles (user_id, birth_year, sex) values (%L, %s, %L)',
           '33333333-3333-3333-3333-333333333333', extract(year from now())::int - 15, 'male'),
    'under-18 profile');
end $$;

-- 2. No consent on file means no scan. This is the core safety property.
select act_as('11111111-1111-1111-1111-111111111111');

do $$
begin
  if has_active_biometric_consent('11111111-1111-1111-1111-111111111111') then
    raise exception 'FAIL: consent reported active before any consent event';
  end if;
  perform assert_fails(
    format('insert into scans (user_id) values (%L)', '11111111-1111-1111-1111-111111111111'),
    'scan without consent');
end $$;

-- 3. With consent, the first scan is allowed — the free scan.
insert into consent_events (user_id, action, consent_version)
values ('11111111-1111-1111-1111-111111111111', 'granted', '2026-09-08.v1');

insert into scans (id, user_id, status)
values ('aaaaaaaa-0000-0000-0000-000000000001',
        '11111111-1111-1111-1111-111111111111', 'complete');

-- 4. The second scan is blocked: quota is one free scan without an entitlement.
do $$
begin
  if can_start_scan('11111111-1111-1111-1111-111111111111') then
    raise exception 'FAIL: quota allowed a second scan with no subscription';
  end if;
  perform assert_fails(
    format('insert into scans (user_id) values (%L)', '11111111-1111-1111-1111-111111111111'),
    'second scan without entitlement');
end $$;

-- 5. An active subscription lifts the quota.
reset role;
insert into subscriptions (user_id, entitlement, is_active, period_end)
values ('11111111-1111-1111-1111-111111111111', 'plus', true, now() + interval '30 days');

select act_as('11111111-1111-1111-1111-111111111111');
insert into scans (id, user_id, status)
values ('aaaaaaaa-0000-0000-0000-000000000002',
        '11111111-1111-1111-1111-111111111111', 'pending');

-- 6. An expired subscription does not.
reset role;
update subscriptions set period_end = now() - interval '1 day'
where user_id = '11111111-1111-1111-1111-111111111111';

select act_as('11111111-1111-1111-1111-111111111111');
do $$
begin
  if can_start_scan('11111111-1111-1111-1111-111111111111') then
    raise exception 'FAIL: an expired subscription still lifted the quota';
  end if;
end $$;

-- 7. One user cannot read another's scans.
select act_as('22222222-2222-2222-2222-222222222222');
do $$
declare visible int;
begin
  select count(*) into visible from scans;
  if visible <> 0 then
    raise exception 'FAIL: u2 can see % of u1''s scans', visible;
  end if;
end $$;

-- 8. Withdrawing consent stops further scans. The log is append-only, so
--    withdrawal is a new event rather than a deletion.
reset role;
update subscriptions set is_active = false
where user_id = '11111111-1111-1111-1111-111111111111';

insert into consent_events (user_id, action, consent_version)
values ('11111111-1111-1111-1111-111111111111', 'withdrawn', '2026-09-08.v1');

do $$
begin
  if has_active_biometric_consent('11111111-1111-1111-1111-111111111111') then
    raise exception 'FAIL: consent still active after withdrawal';
  end if;
end $$;

-- 9. Consent history cannot be rewritten — it is evidence.
select act_as('11111111-1111-1111-1111-111111111111');
do $$
declare removed int;
begin
  delete from consent_events where user_id = '11111111-1111-1111-1111-111111111111';
  get diagnostics removed = row_count;
  if removed <> 0 then
    raise exception 'FAIL: a user deleted % of their own consent events', removed;
  end if;
end $$;

reset role;
do $$ begin raise notice 'ALL RLS ASSERTIONS PASSED'; end $$;

rollback;
