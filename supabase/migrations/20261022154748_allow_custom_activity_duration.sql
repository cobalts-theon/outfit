-- Whole-minute activities from one minute to 24 hours; existing rows remain valid.
set local lock_timeout = '5s';
alter table public.activity_plans
  add constraint activity_plans_duration_minutes_check
  check (
    ends_at > starts_at
    and ends_at - starts_at <= interval '24 hours'
    and mod(extract(epoch from (ends_at - starts_at)), 60) = 0
  ) not valid;
alter table public.activity_plans
  validate constraint activity_plans_duration_minutes_check;
alter table public.activity_plans drop constraint activity_plans_check;
