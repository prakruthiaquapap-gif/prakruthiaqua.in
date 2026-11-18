-- ============================================================================
-- Prakruthi Aqua — website customer accounts (shared login with the dealer portal)
-- Run once in Supabase → SQL Editor (safe to re-run). Dealer tables are NOT touched.
--
-- Why: the website and the dealer portal use the same Supabase project, so they share
-- ONE login list (auth.users) — one email = one login. A dealer who already registered
-- signs in here with the same email + password. Who is a *website customer* is tracked
-- in public.prakruthi_customer_profiles; who is a *dealer* stays in the dealer tables.
-- ============================================================================

-- 1. Extra columns so the profile table is a usable website-customer list.
alter table public.prakruthi_customer_profiles
  add column if not exists email text,
  add column if not exists source text not null default 'website',
  add column if not exists last_seen_at timestamptz;
create index if not exists prakruthi_customer_profiles_email_idx on public.prakruthi_customer_profiles(lower(email));

-- 2. Called by the website right after every sign-in / registration.
--    Creates the customer profile the first time, then just refreshes it.
create or replace function public.prakruthi_touch_customer_profile() returns void
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); mail text; full_name text;
begin
  if uid is null then return; end if;
  select u.email, coalesce(u.raw_user_meta_data->>'full_name', '') into mail, full_name from auth.users u where u.id = uid;
  insert into public.prakruthi_customer_profiles(user_id, display_name, email, source, last_seen_at)
  values (uid, left(full_name, 100), mail, 'website', now())
  on conflict (user_id) do update
    set email = excluded.email,
        display_name = case when public.prakruthi_customer_profiles.display_name = '' then excluded.display_name else public.prakruthi_customer_profiles.display_name end,
        last_seen_at = now();
end;$$;
revoke all on function public.prakruthi_touch_customer_profile() from public;
grant execute on function public.prakruthi_touch_customer_profile() to authenticated;

-- 3. Website admins can see the customer list (customers still see only their own row).
drop policy if exists "Admins read customer profiles" on public.prakruthi_customer_profiles;
create policy "Admins read customer profiles" on public.prakruthi_customer_profiles
  for select to authenticated using (public.prakruthi_is_store_admin());

-- 4. Handy admin query — every website customer, newest first:
--    select display_name, email, phone, created_at, last_seen_at
--    from public.prakruthi_customer_profiles order by created_at desc;
