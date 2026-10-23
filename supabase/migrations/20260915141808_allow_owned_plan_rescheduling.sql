grant update (starts_at, ends_at, policy_version, preparation, reasons, checked_items, reminder_enabled, baseline_risks, baseline_status) on public.activity_plans to authenticated;

-- Home needs the nearest planned activity, including plans without reminders.
create index activity_plans_next_planned on public.activity_plans (user_id, starts_at) where status = 'planned';
