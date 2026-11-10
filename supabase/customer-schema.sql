-- Run after schema.sql and admin-schema.sql. Customer-owned data is private.
create table if not exists public.prakruthi_customer_profiles (
 user_id uuid primary key references auth.users(id) on delete cascade,
 display_name text not null default '' check(char_length(display_name)<=100),
 phone text not null default '' check(char_length(phone)<=30),
 address text not null default '' check(char_length(address)<=1000),
 created_at timestamptz not null default now()
);
create table if not exists public.prakruthi_wishlist_items (
 user_id uuid not null references auth.users(id) on delete cascade,
 product_id text not null references public.prakruthi_products(id) on delete cascade,
 created_at timestamptz not null default now(),
 primary key(user_id,product_id)
);
create table if not exists public.prakruthi_cart_items (
 user_id uuid not null references auth.users(id) on delete cascade,
 product_id text not null references public.prakruthi_products(id) on delete cascade,
 quantity integer not null check(quantity between 1 and 100),
 primary key(user_id,product_id)
);
-- No prices stored in carts: place_order always calculates current catalog prices.
create table if not exists public.prakruthi_business_enquiries (
 id uuid primary key default gen_random_uuid(),
 created_at timestamptz not null default now(),
 business_name text not null check(char_length(business_name) between 1 and 200),
 contact_person text not null check(char_length(contact_person) between 1 and 100),
 email text not null check(char_length(email) between 3 and 200),
 phone text not null check(char_length(phone) between 1 and 30),
 business_type text not null check(business_type in ('Retailer','Wholesaler','Distributor','Aquarium Service Provider','Online Store','Other')),
 interested_products text[] not null default '{}' check(cardinality(interested_products)<=20),
 message text not null check(char_length(message) between 10 and 4000),
 status text not null default 'new' check(status in ('new','contacted','closed'))
);
create table if not exists public.prakruthi_site_pages (
 slug text primary key check(slug ~ '^[a-z0-9-]{1,100}$'),
 title text not null check(char_length(title) between 1 and 200),
 content jsonb not null default '{}' check(jsonb_typeof(content)='object'),
 published boolean not null default false
);
-- Public business information only; never put credentials or private data here.
create table if not exists public.prakruthi_site_settings (
 key text primary key check(char_length(key) between 1 and 100),
 value jsonb not null
);
alter table public.prakruthi_customer_profiles enable row level security;
alter table public.prakruthi_wishlist_items enable row level security;
alter table public.prakruthi_cart_items enable row level security;
alter table public.prakruthi_business_enquiries enable row level security;
alter table public.prakruthi_site_pages enable row level security;
alter table public.prakruthi_site_settings enable row level security;
revoke all on public.prakruthi_customer_profiles,public.prakruthi_wishlist_items,public.prakruthi_cart_items,public.prakruthi_business_enquiries,public.prakruthi_site_pages,public.prakruthi_site_settings from anon,authenticated;
grant select,insert,update,delete on public.prakruthi_customer_profiles,public.prakruthi_wishlist_items,public.prakruthi_cart_items to authenticated;
drop policy if exists "Own profile" on public.prakruthi_customer_profiles;
create policy "Own profile" on public.prakruthi_customer_profiles for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
drop policy if exists "Own wishlist" on public.prakruthi_wishlist_items;
create policy "Own wishlist" on public.prakruthi_wishlist_items for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
drop policy if exists "Own cart" on public.prakruthi_cart_items;
create policy "Own cart" on public.prakruthi_cart_items for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
grant insert(business_name,contact_person,email,phone,business_type,interested_products,message) on public.prakruthi_business_enquiries to anon,authenticated;
grant select,update on public.prakruthi_business_enquiries to authenticated;
drop policy if exists "Submit business enquiry" on public.prakruthi_business_enquiries;
create policy "Submit business enquiry" on public.prakruthi_business_enquiries for insert to anon,authenticated with check(status='new');
drop policy if exists "Admin read business enquiries" on public.prakruthi_business_enquiries;
create policy "Admin read business enquiries" on public.prakruthi_business_enquiries for select to authenticated using(public.prakruthi_is_store_admin());
drop policy if exists "Admin update business enquiries" on public.prakruthi_business_enquiries;
create policy "Admin update business enquiries" on public.prakruthi_business_enquiries for update to authenticated using(public.prakruthi_is_store_admin()) with check(public.prakruthi_is_store_admin());
grant select on public.prakruthi_enquiries to authenticated;
drop policy if exists "Admin read contact enquiries" on public.prakruthi_enquiries;
create policy "Admin read contact enquiries" on public.prakruthi_enquiries for select to authenticated using(public.prakruthi_is_store_admin());
grant select on public.prakruthi_site_pages,public.prakruthi_site_settings to anon,authenticated;
grant insert,update,delete on public.prakruthi_site_pages,public.prakruthi_site_settings to authenticated;
drop policy if exists "Read published pages" on public.prakruthi_site_pages;
create policy "Read published pages" on public.prakruthi_site_pages for select using(published or public.prakruthi_is_store_admin());
drop policy if exists "Admin manage pages" on public.prakruthi_site_pages;
create policy "Admin manage pages" on public.prakruthi_site_pages for all to authenticated using(public.prakruthi_is_store_admin()) with check(public.prakruthi_is_store_admin());
drop policy if exists "Read public settings" on public.prakruthi_site_settings;
create policy "Read public settings" on public.prakruthi_site_settings for select using(true);
drop policy if exists "Admin manage settings" on public.prakruthi_site_settings;
create policy "Admin manage settings" on public.prakruthi_site_settings for all to authenticated using(public.prakruthi_is_store_admin()) with check(public.prakruthi_is_store_admin());
