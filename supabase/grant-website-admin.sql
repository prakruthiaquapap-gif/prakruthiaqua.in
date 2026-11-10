-- Run AFTER full-setup.sql, in the Supabase SQL Editor only.
-- First create your account in Authentication > Users > Add user.
-- Replace the email below with that account's actual email.
-- This grants WEBSITE admin access only; dealer tables are not changed.
do $$
declare
  admin_email text := 'REPLACE_WITH_YOUR_ADMIN_EMAIL';
  admin_id uuid;
begin
  if admin_email = 'REPLACE_WITH_YOUR_ADMIN_EMAIL' then
    raise exception 'Replace REPLACE_WITH_YOUR_ADMIN_EMAIL with your existing Auth user email.';
  end if;
  select id into admin_id from auth.users where lower(email)=lower(trim(admin_email));
  if admin_id is null then
    raise exception 'Account not found. Create it in Supabase Authentication > Users first.';
  end if;
  insert into public.prakruthi_admin_members(user_id) values(admin_id)
  on conflict(user_id) do nothing;
end;
$$;
