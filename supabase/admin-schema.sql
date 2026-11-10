-- Run after schema.sql, then seed.sql. Only the project owner should run this file.
create table if not exists public.prakruthi_admin_members (
 user_id uuid primary key references auth.users(id) on delete cascade,
 created_at timestamptz not null default now()
);
alter table public.prakruthi_admin_members enable row level security;
revoke all on public.prakruthi_admin_members from anon, authenticated;
grant select on public.prakruthi_admin_members to authenticated;
drop policy if exists "Read own admin membership" on public.prakruthi_admin_members;
create policy "Read own admin membership" on public.prakruthi_admin_members for select to authenticated using (user_id=auth.uid());
create or replace function public.prakruthi_is_store_admin() returns boolean language sql stable security definer set search_path=public as $$
 select exists(select 1 from public.prakruthi_admin_members where user_id=auth.uid());
$$;
revoke all on function public.prakruthi_is_store_admin() from public;
grant execute on function public.prakruthi_is_store_admin() to anon,authenticated;
create table if not exists public.prakruthi_categories (
 id text primary key default gen_random_uuid()::text,
 name text unique not null check(char_length(name) between 1 and 100),
 active boolean not null default true,
 position integer not null default 0 check(position>=0)
);
create table if not exists public.prakruthi_products (
 id text primary key default gen_random_uuid()::text,
 created_at timestamptz not null default now(),
 slug text unique not null check(slug ~ '^[a-zA-Z0-9-]{1,180}$'),
 name text not null check(char_length(name) between 1 and 200),
 category text not null references public.prakruthi_categories(name) on update cascade on delete restrict,
 price numeric(12,2) not null check(price>=0 and price<=10000000),
 image text not null check(image ~ '^https://' or image ~ '^/images/'),
 url text not null default '' check(url='' or url ~ '^https://' or url ~ '^/[^/]'),
 description text not null default '' check(char_length(description)<=4000),
 stock integer not null default 0 check(stock>=0),
 active boolean not null default true,
 featured boolean not null default false
);
create table if not exists public.prakruthi_banners (
 id text primary key default gen_random_uuid()::text,
 label text not null check(char_length(label) between 1 and 80),
 eyebrow text not null check(char_length(eyebrow) between 1 and 150),
 title text not null check(char_length(title) between 1 and 100),
 accent text not null check(char_length(accent) between 1 and 100),
 description text not null check(char_length(description) between 1 and 500),
 image text not null check(image ~ '^https://' or image ~ '^/images/'),
 alt text not null check(char_length(alt) between 1 and 200),
 href text not null check(href ~ '^https://' or href ~ '^/[^/]'),
 product text not null default '',
 "productName" text not null default '',
 "productImage" text not null default '',
 active boolean not null default true,
 position integer not null default 0 check(position>=0)
);
create table if not exists public.prakruthi_orders (
 id text primary key default gen_random_uuid()::text,
 order_number text not null unique default ('PA-'||upper(substr(gen_random_uuid()::text,1,8))),
 created_at timestamptz not null default now(),
 customer_name text not null check(char_length(customer_name) between 1 and 100),
 email text not null check(char_length(email) between 3 and 200),
 phone text not null check(char_length(phone) between 1 and 30),
 address text not null check(char_length(address) between 10 and 1000),
 notes text not null default '' check(char_length(notes)<=2000),
 status text not null default 'pending' check(status in ('pending','confirmed','processing','shipped','delivered','cancelled')),
 payment_status text not null default 'unpaid' check(payment_status in ('unpaid','paid','refunded')),
 total numeric(12,2) not null check(total>=0),
 items jsonb not null check(jsonb_typeof(items)='array' and jsonb_array_length(items) between 1 and 50),
 source text not null default 'website-checkout' check(source in ('website-checkout','admin-manual'))
);
create index if not exists prakruthi_orders_created_at_idx on public.prakruthi_orders(created_at desc);
create index if not exists prakruthi_orders_status_idx on public.prakruthi_orders(status);
alter table public.prakruthi_categories enable row level security;
alter table public.prakruthi_products enable row level security;
alter table public.prakruthi_banners enable row level security;
alter table public.prakruthi_orders enable row level security;
revoke all on public.prakruthi_categories,public.prakruthi_products,public.prakruthi_banners,public.prakruthi_orders from anon,authenticated;
grant select on public.prakruthi_categories,public.prakruthi_products,public.prakruthi_banners to anon,authenticated;
grant insert,update,delete on public.prakruthi_categories,public.prakruthi_products,public.prakruthi_banners to authenticated;
grant select,insert,update on public.prakruthi_orders to authenticated;
drop policy if exists "Catalog categories read" on public.prakruthi_categories;
create policy "Catalog categories read" on public.prakruthi_categories for select using(active or public.prakruthi_is_store_admin());
drop policy if exists "Admin categories write" on public.prakruthi_categories;
create policy "Admin categories write" on public.prakruthi_categories for all to authenticated using(public.prakruthi_is_store_admin()) with check(public.prakruthi_is_store_admin());
drop policy if exists "Catalog products read" on public.prakruthi_products;
create policy "Catalog products read" on public.prakruthi_products for select using((active and exists(select 1 from public.prakruthi_categories c where c.name=category and c.active)) or public.prakruthi_is_store_admin());
drop policy if exists "Admin products write" on public.prakruthi_products;
create policy "Admin products write" on public.prakruthi_products for all to authenticated using(public.prakruthi_is_store_admin()) with check(public.prakruthi_is_store_admin());
drop policy if exists "Catalog banners read" on public.prakruthi_banners;
create policy "Catalog banners read" on public.prakruthi_banners for select using(active or public.prakruthi_is_store_admin());
drop policy if exists "Admin banners write" on public.prakruthi_banners;
create policy "Admin banners write" on public.prakruthi_banners for all to authenticated using(public.prakruthi_is_store_admin()) with check(public.prakruthi_is_store_admin());
drop policy if exists "Admins manage orders" on public.prakruthi_orders;
create policy "Admins manage orders" on public.prakruthi_orders for all to authenticated using(public.prakruthi_is_store_admin()) with check(public.prakruthi_is_store_admin());
-- Guests cannot SELECT or INSERT order rows directly. This transaction calculates
-- current prices from published products and creates a pending, unpaid order.
create or replace function public.prakruthi_place_order(p_customer jsonb,p_items jsonb) returns jsonb
language plpgsql security definer set search_path=public as $$
declare requested jsonb; prod public.prakruthi_products%rowtype; qty integer; snapshot jsonb:='[]'::jsonb; subtotal numeric(12,2):=0; number text;
begin
 if jsonb_typeof(p_customer)<>'object' or jsonb_typeof(p_items)<>'array' or jsonb_array_length(p_items) not between 1 and 50 then raise exception 'Invalid order details'; end if;
 if coalesce(char_length(trim(p_customer->>'name')),0) not between 1 and 100 or coalesce(char_length(p_customer->>'email'),0) not between 3 and 200 or coalesce(p_customer->>'email','') !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' or coalesce(char_length(p_customer->>'phone'),0) not between 1 and 30 or coalesce(char_length(p_customer->>'address'),0) not between 10 and 1000 or coalesce(char_length(p_customer->>'notes'),0)>2000 then raise exception 'Please check customer details'; end if;
 for requested in select value from jsonb_array_elements(p_items) loop
  if coalesce(requested->>'quantity','') !~ '^[0-9]{1,2}$' then raise exception 'Invalid quantity'; end if;
  qty:=(requested->>'quantity')::integer;
  if qty not between 1 and 20 then raise exception 'Choose between 1 and 20 of each product'; end if;
  if exists(select 1 from jsonb_array_elements(snapshot) x where x->>'slug'=requested->>'slug') then raise exception 'Duplicate product in order'; end if;
  select p.* into prod from public.prakruthi_products p join public.prakruthi_categories c on c.name=p.category where p.slug=requested->>'slug' and p.active and c.active;
  if not found then raise exception 'A product is no longer available'; end if;
  snapshot:=snapshot||jsonb_build_array(jsonb_build_object('slug',prod.slug,'name',prod.name,'price',prod.price,'quantity',qty));
  subtotal:=subtotal+(prod.price*qty);
 end loop;
 if subtotal>10000000 then raise exception 'Please contact us for large orders'; end if;
 insert into public.prakruthi_orders(customer_name,email,phone,address,notes,total,items,status,payment_status,source)
 values(trim(p_customer->>'name'),trim(p_customer->>'email'),trim(p_customer->>'phone'),trim(p_customer->>'address'),coalesce(p_customer->>'notes',''),subtotal,snapshot,'pending','unpaid','website-checkout') returning order_number into number;
 return jsonb_build_object('order_number',number,'total',subtotal);
end;$$;
revoke all on function public.prakruthi_place_order(jsonb,jsonb) from public;
grant execute on function public.prakruthi_place_order(jsonb,jsonb) to anon,authenticated;
-- Product images are public; only store admins may upload or change files.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('prakruthi-catalog-media','prakruthi-catalog-media',true,5242880,array['image/jpeg','image/png','image/webp','image/gif']) on conflict(id) do nothing;
drop policy if exists "Prakruthi Public catalog images" on storage.objects;
create policy "Prakruthi Public catalog images" on storage.objects for select using(bucket_id='prakruthi-catalog-media');
drop policy if exists "Prakruthi Admin catalog uploads" on storage.objects;
create policy "Prakruthi Admin catalog uploads" on storage.objects for insert to authenticated with check(bucket_id='prakruthi-catalog-media' and public.prakruthi_is_store_admin());
drop policy if exists "Prakruthi Admin catalog updates" on storage.objects;
create policy "Prakruthi Admin catalog updates" on storage.objects for update to authenticated using(bucket_id='prakruthi-catalog-media' and public.prakruthi_is_store_admin()) with check(bucket_id='prakruthi-catalog-media' and public.prakruthi_is_store_admin());
drop policy if exists "Prakruthi Admin catalog deletes" on storage.objects;
create policy "Prakruthi Admin catalog deletes" on storage.objects for delete to authenticated using(bucket_id='prakruthi-catalog-media' and public.prakruthi_is_store_admin());
