alter table public.activity_plans drop constraint activity_plans_activity_check;
alter table public.activity_plans add constraint activity_plans_activity_check check (activity in ('walking','running','commute','outing','shopping'));
alter table public.activity_plans drop constraint activity_plans_policy_version_fkey;
alter table public.activity_plans add column reminder_enabled boolean not null default false;
alter table public.activity_plans add column checked_items text[] not null default '{}';
alter table public.activity_plans add column baseline_risks text[] not null default '{}';
alter table public.activity_plans add column baseline_status text not null default 'unknown' check (baseline_status in ('suitable','caution','avoid','unknown'));
alter table public.activity_plans add constraint plan_checked_items_size check (cardinality(checked_items) <= 12);
alter table public.activity_plans add constraint plan_baseline_risks_size check (cardinality(baseline_risks) <= 12);
alter table public.activity_plans drop constraint activity_plans_user_id_starts_at_latitude_longitude_key;
alter table public.activity_plans add unique(user_id, activity, starts_at, latitude, longitude);
create table public.recommendation_feedback (
 user_id uuid not null references auth.users(id) on delete cascade,
 target_key text not null check (length(target_key) between 1 and 160),
 response text not null check (response in ('helpful','busy','dislike','inaccurate')),
 period text check (period in ('morning','noon','afternoon','evening','night')),
 minute_of_day integer check (minute_of_day between 0 and 1439),
 updated_at timestamptz not null default now(),
 primary key(user_id,target_key)
);
alter table public.recommendation_feedback enable row level security;
grant select,insert,update,delete on public.recommendation_feedback to authenticated;
revoke all on public.recommendation_feedback from anon;
create policy feedback_select on public.recommendation_feedback for select to authenticated using ((select auth.uid())=user_id);
create policy feedback_insert on public.recommendation_feedback for insert to authenticated with check ((select auth.uid())=user_id);
create policy feedback_update on public.recommendation_feedback for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy feedback_delete on public.recommendation_feedback for delete to authenticated using ((select auth.uid())=user_id);
create index activity_plans_reminder_upcoming on public.activity_plans(user_id,starts_at) where reminder_enabled and status='planned';
