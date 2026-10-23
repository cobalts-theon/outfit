-- Dashboard-managed versioned policy. Application clients may only read active releases.
create table public.walking_policies (
  version text primary key check (version ~ '^[a-zA-Z0-9._-]{1,64}$'),
  active boolean not null default false,
  max_aqi integer not null check (max_aqi between 1 and 100),
  max_uv numeric not null check (max_uv between 1 and 6),
  max_rain_probability numeric not null check (max_rain_probability between 0 and 0.4),
  max_wind numeric not null check (max_wind between 1 and 8),
  max_gust numeric not null check (max_gust between 1 and 12),
  min_feels_like numeric not null check (min_feels_like between 15 and 25),
  max_feels_like numeric not null check (max_feels_like between 25 and 33),
  rationale text not null check (length(rationale) between 1 and 2000),
  created_at timestamptz not null default now(),
  check (min_feels_like < max_feels_like)
);
create unique index walking_policies_one_active on public.walking_policies (active) where active;
alter table public.walking_policies enable row level security;
revoke all on public.walking_policies from anon, authenticated;
grant select on public.walking_policies to anon, authenticated;
grant all on public.walking_policies to service_role;
create policy walking_policy_read on public.walking_policies for select to anon, authenticated using (active);
-- A release is immutable; publish a new version and switch active atomically.
create function public.protect_walking_policy_version() returns trigger
language plpgsql set search_path = '' as $$
begin
  if (to_jsonb(new) - 'active') is distinct from (to_jsonb(old) - 'active') then
    raise exception 'Create a new walking policy version instead of changing a release';
  end if;
  return new;
end;
$$;
revoke all on function public.protect_walking_policy_version() from public, anon, authenticated;
create trigger walking_policy_immutable before update on public.walking_policies
for each row execute function public.protect_walking_policy_version();
insert into public.walking_policies (version, active, max_aqi, max_uv, max_rain_probability, max_wind, max_gust, min_feels_like, max_feels_like, rationale)
values ('walking-v1', true, 100, 6, 0.4, 8, 12, 15, 33,
  'Conservative product preferences for light walking; not medical safety thresholds. US AQI scale, WHO UV protection guidance from UVI 3; other thresholds are product heuristics requiring user evaluation.');

create table public.activity_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  activity text not null default 'walking' check (activity = 'walking'),
  location_label text not null check (length(btrim(location_label)) between 1 and 100),
  latitude double precision not null check (latitude between -90 and 90),
  longitude double precision not null check (longitude between -180 and 180),
  time_zone text not null check (length(time_zone) between 1 and 100),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  policy_version text not null references public.walking_policies(version),
  reasons text[] not null check (cardinality(reasons) between 1 and 8),
  preparation text not null check (length(preparation) between 1 and 1000),
  status text not null default 'planned' check (status in ('planned', 'cancelled', 'completed')),
  feedback text check (feedback in ('helpful', 'not_suitable')),
  created_at timestamptz not null default now(),
  check (ends_at - starts_at in (interval '30 minutes', interval '60 minutes', interval '90 minutes')),
  unique (user_id, starts_at, latitude, longitude)
);
create index activity_plans_owner_start on public.activity_plans (user_id, starts_at desc);
create index activity_plans_policy on public.activity_plans (policy_version);
alter table public.activity_plans enable row level security;
revoke all on public.activity_plans from anon, authenticated;
grant select, insert, delete on public.activity_plans to authenticated;
grant update (status, feedback) on public.activity_plans to authenticated;
grant all on public.activity_plans to service_role;
create policy plans_select on public.activity_plans for select to authenticated using ((select auth.uid()) = user_id);
create policy plans_insert on public.activity_plans for insert to authenticated with check ((select auth.uid()) = user_id);
create policy plans_update on public.activity_plans for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy plans_delete on public.activity_plans for delete to authenticated using ((select auth.uid()) = user_id);
comment on table public.activity_plans is 'User-selected walking plans. Historical recommendations are snapshots, not current safety assurances. No automatic remote monitoring until sender infrastructure is configured.';
