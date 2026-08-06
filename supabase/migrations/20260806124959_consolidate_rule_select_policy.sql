-- Resolve the performance advisor's multiple-permissive-policies warning while
-- preserving active-rule access for users and full rule access for admins.

drop policy if exists recommendation_rules_select_active
  on public.recommendation_rules;

drop policy if exists recommendation_rules_admin_select
  on public.recommendation_rules;

drop policy if exists recommendation_rules_select_authorized
  on public.recommendation_rules;

create policy recommendation_rules_select_authorized
  on public.recommendation_rules for select
  to authenticated
  using (
    is_active is true
    or ((select auth.jwt()) -> 'app_metadata' ->> 'app_role') = 'admin'
  );
