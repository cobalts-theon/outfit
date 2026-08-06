-- Harden the existing schema without adding future-facing tables or changing
-- the recommendation_rules data model.

-- Abort before making changes if existing data would violate the constraints.
do $preflight$
begin
  if exists (
    select 1
    from public.saved_locations
    where btrim(label) = ''
       or char_length(label) > 100
       or latitude not between -90 and 90
       or longitude not between -180 and 180
  ) then
    raise exception 'saved_locations contains rows that violate hardening constraints';
  end if;

  if exists (
    select 1
    from public.saved_locations
    where is_default is true
    group by user_id
    having count(*) > 1
  ) then
    raise exception 'saved_locations contains more than one default per user';
  end if;

  if exists (
    select 1
    from public.recommendation_rules
    where (temp_min is not null and temp_max is not null and temp_min > temp_max)
       or (humidity_min is not null and humidity_min not between 0 and 100)
       or (humidity_max is not null and humidity_max not between 0 and 100)
       or (humidity_min is not null and humidity_max is not null and humidity_min > humidity_max)
       or (uv_min is not null and uv_min < 0)
       or (uv_max is not null and uv_max < 0)
       or (uv_min is not null and uv_max is not null and uv_min > uv_max)
       or (aqi_min is not null and aqi_min < 0)
       or (aqi_max is not null and aqi_max < 0)
       or (aqi_min is not null and aqi_max is not null and aqi_min > aqi_max)
       or (priority is not null and priority < 0)
  ) then
    raise exception 'recommendation_rules contains rows that violate hardening constraints';
  end if;

  if exists (
    select 1
    from public.recommendation_logs
    where (latitude is not null and latitude not between -90 and 90)
       or (longitude is not null and longitude not between -180 and 180)
       or (humidity is not null and humidity not between 0 and 100)
       or (uv_index is not null and uv_index < 0)
       or (aqi is not null and aqi < 0)
       or (feedback is not null and feedback not in (-1, 1))
  ) then
    raise exception 'recommendation_logs contains rows that violate hardening constraints';
  end if;
end
$preflight$;

-- User-owned rows are removed with the auth user. Historical logs retain their
-- record when a recommendation rule is deleted.
do $foreign_keys$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.profiles'::regclass
      and conname = 'profiles_id_fkey'
      and pg_get_constraintdef(oid) like '%ON DELETE CASCADE%'
  ) then
    alter table public.profiles drop constraint if exists profiles_id_fkey;
    alter table public.profiles
      add constraint profiles_id_fkey
      foreign key (id) references auth.users (id) on delete cascade;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.saved_locations'::regclass
      and conname = 'saved_locations_user_id_fkey'
      and pg_get_constraintdef(oid) like '%ON DELETE CASCADE%'
  ) then
    alter table public.saved_locations drop constraint if exists saved_locations_user_id_fkey;
    alter table public.saved_locations
      add constraint saved_locations_user_id_fkey
      foreign key (user_id) references auth.users (id) on delete cascade;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.recommendation_logs'::regclass
      and conname = 'recommendation_logs_user_id_fkey'
      and pg_get_constraintdef(oid) like '%ON DELETE CASCADE%'
  ) then
    alter table public.recommendation_logs drop constraint if exists recommendation_logs_user_id_fkey;
    alter table public.recommendation_logs
      add constraint recommendation_logs_user_id_fkey
      foreign key (user_id) references auth.users (id) on delete cascade;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.recommendation_logs'::regclass
      and conname = 'recommendation_logs_rule_id_fkey'
      and pg_get_constraintdef(oid) like '%ON DELETE SET NULL%'
  ) then
    alter table public.recommendation_logs drop constraint if exists recommendation_logs_rule_id_fkey;
    alter table public.recommendation_logs
      add constraint recommendation_logs_rule_id_fkey
      foreign key (rule_id) references public.recommendation_rules (id) on delete set null;
  end if;
end
$foreign_keys$;

do $checks$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.saved_locations'::regclass
      and conname = 'saved_locations_label_length_check'
  ) then
    alter table public.saved_locations
      add constraint saved_locations_label_length_check
      check (char_length(btrim(label)) between 1 and 100);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.saved_locations'::regclass
      and conname = 'saved_locations_latitude_check'
  ) then
    alter table public.saved_locations
      add constraint saved_locations_latitude_check
      check (latitude between -90 and 90);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.saved_locations'::regclass
      and conname = 'saved_locations_longitude_check'
  ) then
    alter table public.saved_locations
      add constraint saved_locations_longitude_check
      check (longitude between -180 and 180);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.recommendation_rules'::regclass
      and conname = 'recommendation_rules_ranges_check'
  ) then
    alter table public.recommendation_rules
      add constraint recommendation_rules_ranges_check
      check (
        (temp_min is null or temp_max is null or temp_min <= temp_max)
        and (humidity_min is null or humidity_min between 0 and 100)
        and (humidity_max is null or humidity_max between 0 and 100)
        and (humidity_min is null or humidity_max is null or humidity_min <= humidity_max)
        and (uv_min is null or uv_min >= 0)
        and (uv_max is null or uv_max >= 0)
        and (uv_min is null or uv_max is null or uv_min <= uv_max)
        and (aqi_min is null or aqi_min >= 0)
        and (aqi_max is null or aqi_max >= 0)
        and (aqi_min is null or aqi_max is null or aqi_min <= aqi_max)
        and (priority is null or priority >= 0)
      );
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.recommendation_logs'::regclass
      and conname = 'recommendation_logs_measurements_check'
  ) then
    alter table public.recommendation_logs
      add constraint recommendation_logs_measurements_check
      check (
        (latitude is null or latitude between -90 and 90)
        and (longitude is null or longitude between -180 and 180)
        and (humidity is null or humidity between 0 and 100)
        and (uv_index is null or uv_index >= 0)
        and (aqi is null or aqi >= 0)
        and (feedback is null or feedback in (-1, 1))
      );
  end if;
end
$checks$;

create index if not exists saved_locations_user_id_idx
  on public.saved_locations (user_id);

create unique index if not exists saved_locations_one_default_per_user_idx
  on public.saved_locations (user_id)
  where is_default is true;

create index if not exists recommendation_logs_user_created_at_idx
  on public.recommendation_logs (user_id, created_at desc);

create index if not exists recommendation_logs_rule_id_idx
  on public.recommendation_logs (rule_id);

create index if not exists recommendation_rules_active_priority_idx
  on public.recommendation_rules (priority desc)
  where is_active is true;

-- Use a fixed search path and fully qualified objects. The function remains a
-- security definer because the auth trigger must insert through profiles RLS.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$function$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;
grant execute on function public.handle_new_user() to service_role;

alter table public.profiles enable row level security;
alter table public.saved_locations enable row level security;
alter table public.recommendation_logs enable row level security;
alter table public.recommendation_rules enable row level security;

-- Remove inherited broad table privileges, then grant only operations required
-- by clients. RLS remains the row-level authorization boundary.
revoke all on table public.profiles from anon, authenticated;
revoke all on table public.saved_locations from anon, authenticated;
revoke all on table public.recommendation_logs from anon, authenticated;
revoke all on table public.recommendation_rules from anon, authenticated;

grant select, update on table public.profiles to authenticated;
grant select, insert, update, delete on table public.saved_locations to authenticated;
grant select, insert on table public.recommendation_logs to authenticated;
grant update (feedback, feedback_at) on table public.recommendation_logs to authenticated;
grant select, insert, update, delete on table public.recommendation_rules to authenticated;

grant all on table public.profiles to service_role;
grant all on table public.saved_locations to service_role;
grant all on table public.recommendation_logs to service_role;
grant all on table public.recommendation_rules to service_role;

drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Users can view own logs" on public.recommendation_logs;
drop policy if exists "Users can insert own logs" on public.recommendation_logs;
drop policy if exists "Anyone authenticated can read rules" on public.recommendation_rules;
drop policy if exists "Authenticated can manage rules" on public.recommendation_rules;

drop policy if exists profiles_select_own on public.profiles;
drop policy if exists profiles_update_own on public.profiles;
drop policy if exists saved_locations_select_own on public.saved_locations;
drop policy if exists saved_locations_insert_own on public.saved_locations;
drop policy if exists saved_locations_update_own on public.saved_locations;
drop policy if exists saved_locations_delete_own on public.saved_locations;
drop policy if exists recommendation_logs_select_own on public.recommendation_logs;
drop policy if exists recommendation_logs_insert_own on public.recommendation_logs;
drop policy if exists recommendation_logs_update_own on public.recommendation_logs;
drop policy if exists recommendation_rules_select_active on public.recommendation_rules;
drop policy if exists recommendation_rules_admin_select on public.recommendation_rules;
drop policy if exists recommendation_rules_admin_insert on public.recommendation_rules;
drop policy if exists recommendation_rules_admin_update on public.recommendation_rules;
drop policy if exists recommendation_rules_admin_delete on public.recommendation_rules;

create policy profiles_select_own
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

create policy profiles_update_own
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy saved_locations_select_own
  on public.saved_locations for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy saved_locations_insert_own
  on public.saved_locations for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy saved_locations_update_own
  on public.saved_locations for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy saved_locations_delete_own
  on public.saved_locations for delete
  to authenticated
  using ((select auth.uid()) = user_id);

create policy recommendation_logs_select_own
  on public.recommendation_logs for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy recommendation_logs_insert_own
  on public.recommendation_logs for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy recommendation_logs_update_own
  on public.recommendation_logs for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy recommendation_rules_select_active
  on public.recommendation_rules for select
  to authenticated
  using (is_active is true);

create policy recommendation_rules_admin_select
  on public.recommendation_rules for select
  to authenticated
  using (
    ((select auth.jwt()) -> 'app_metadata' ->> 'app_role') = 'admin'
  );

create policy recommendation_rules_admin_insert
  on public.recommendation_rules for insert
  to authenticated
  with check (
    ((select auth.jwt()) -> 'app_metadata' ->> 'app_role') = 'admin'
  );

create policy recommendation_rules_admin_update
  on public.recommendation_rules for update
  to authenticated
  using (
    ((select auth.jwt()) -> 'app_metadata' ->> 'app_role') = 'admin'
  )
  with check (
    ((select auth.jwt()) -> 'app_metadata' ->> 'app_role') = 'admin'
  );

create policy recommendation_rules_admin_delete
  on public.recommendation_rules for delete
  to authenticated
  using (
    ((select auth.jwt()) -> 'app_metadata' ->> 'app_role') = 'admin'
  );
