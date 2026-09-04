create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table public.notification_preferences (
  user_id uuid primary key references auth.users (id) on delete cascade,
  notifications_enabled boolean not null default false,
  rain_enabled boolean not null default true,
  environmental_risk_enabled boolean not null default true,
  primary_action_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.notification_preferences is
  'Authenticated user preferences for the recommendation notification categories implemented by the mobile app.';
comment on column public.notification_preferences.notifications_enabled is
  'Account-level opt-in; operating-system permission remains device-local.';
comment on column public.notification_preferences.rain_enabled is
  'Current or near-term rain and laundry-protection notifications.';
comment on column public.notification_preferences.environmental_risk_enabled is
  'Highest warning or danger weather, UV, AQI, or heat risk notification.';
comment on column public.notification_preferences.primary_action_enabled is
  'Primary attention-level recommendation notification.';

create or replace function private.set_notification_preferences_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $function$
begin
  new.updated_at = now();
  return new;
end;
$function$;

revoke execute on function private.set_notification_preferences_updated_at()
  from public, anon, authenticated;

create trigger notification_preferences_set_updated_at
before update on public.notification_preferences
for each row execute function private.set_notification_preferences_updated_at();

alter table public.notification_preferences enable row level security;

revoke all on table public.notification_preferences from anon, authenticated;
grant select, insert, update on table public.notification_preferences to authenticated;
grant all on table public.notification_preferences to service_role;

create policy notification_preferences_select_own
  on public.notification_preferences for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy notification_preferences_insert_own
  on public.notification_preferences for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy notification_preferences_update_own
  on public.notification_preferences for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
