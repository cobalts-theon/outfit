-- MCP-derived baseline for project xmubbpkaezlgtvxaxofg (weather).
--
-- The official `supabase db pull` workflow was not available in this
-- environment. This migration intentionally mirrors the existing public
-- schema and is idempotent so it can be recorded against the existing remote
-- database without recreating or deleting data.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id),
  full_name text,
  avatar_url text,
  created_at timestamptz default now()
);

create table if not exists public.recommendation_rules (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  temp_min numeric,
  temp_max numeric,
  humidity_min numeric,
  humidity_max numeric,
  uv_min numeric,
  uv_max numeric,
  aqi_min numeric,
  aqi_max numeric,
  weather_condition text,
  clothing_suggestion text not null,
  health_advice text,
  icon_key text,
  priority integer default 0,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.recommendation_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id),
  rule_id uuid references public.recommendation_rules (id),
  location_name text,
  latitude numeric,
  longitude numeric,
  temperature numeric,
  humidity numeric,
  uv_index numeric,
  aqi numeric,
  weather_condition text,
  created_at timestamptz default now(),
  feedback smallint,
  feedback_at timestamptz
);

create table if not exists public.saved_locations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id),
  label text not null,
  latitude numeric not null,
  longitude numeric not null,
  is_default boolean default false,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;
alter table public.recommendation_rules enable row level security;
alter table public.recommendation_logs enable row level security;
alter table public.saved_locations enable row level security;

do $baseline_policies$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'profiles'
      and policyname = 'Users can view own profile'
  ) then
    create policy "Users can view own profile"
      on public.profiles for select
      using (auth.uid() = id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'profiles'
      and policyname = 'Users can update own profile'
  ) then
    create policy "Users can update own profile"
      on public.profiles for update
      using (auth.uid() = id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'recommendation_logs'
      and policyname = 'Users can view own logs'
  ) then
    create policy "Users can view own logs"
      on public.recommendation_logs for select
      using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'recommendation_logs'
      and policyname = 'Users can insert own logs'
  ) then
    create policy "Users can insert own logs"
      on public.recommendation_logs for insert
      with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'recommendation_rules'
      and policyname = 'Anyone authenticated can read rules'
  ) then
    create policy "Anyone authenticated can read rules"
      on public.recommendation_rules for select
      using (auth.role() = 'authenticated');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'recommendation_rules'
      and policyname = 'Authenticated can manage rules'
  ) then
    create policy "Authenticated can manage rules"
      on public.recommendation_rules for all
      using (auth.role() = 'authenticated');
  end if;
end
$baseline_policies$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $function$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$function$;

do $baseline_trigger$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgrelid = 'auth.users'::regclass
      and tgname = 'on_auth_user_created'
      and not tgisinternal
  ) then
    create trigger on_auth_user_created
      after insert on auth.users
      for each row execute function public.handle_new_user();
  end if;
end
$baseline_trigger$;

grant all on table public.profiles to anon, authenticated, service_role;
grant all on table public.recommendation_rules to anon, authenticated, service_role;
grant all on table public.recommendation_logs to anon, authenticated, service_role;
grant all on table public.saved_locations to anon, authenticated, service_role;
