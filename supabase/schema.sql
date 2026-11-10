-- Run in your Supabase SQL editor. Use only the anon/publishable key in the browser.
create table if not exists public.prakruthi_enquiries (
 id uuid primary key default gen_random_uuid(),
 created_at timestamptz not null default now(),
 name text not null check (char_length(name) between 1 and 100),
 email text not null check (char_length(email) between 3 and 200),
 phone text check (char_length(phone) <= 30),
 type text not null check (type in ('Product guidance','Business enquiry','Order support','General enquiry')),
 message text not null check (char_length(message) between 10 and 4000)
);
alter table public.prakruthi_enquiries enable row level security;
revoke all on public.prakruthi_enquiries from anon, authenticated;
grant insert (name,email,phone,type,message) on public.prakruthi_enquiries to anon, authenticated;
drop policy if exists "Visitors may submit enquiries" on public.prakruthi_enquiries;
create policy "Visitors may submit enquiries" on public.prakruthi_enquiries for insert to anon, authenticated with check (true);
-- Intentionally no client SELECT, UPDATE or DELETE policy. Review enquiries in the Supabase dashboard.
-- Enable Email OTP in Authentication > Providers, and set your Site URL and /account/ redirect URL.
-- For a public production launch, add rate limiting / CAPTCHA to enquiry submission.
