-- Prakruthi Aqua website ONLY: separate prakruthi_ tables.
-- Existing dealer/subdealer tables, policies and records are not modified.
-- Supabase Auth remains shared across applications in this project.
begin;

-- FILE: schema.sql
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


-- FILE: admin-schema.sql
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


-- FILE: customer-schema.sql
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


-- FILE: seed.sql
-- Existing website content. Run once after admin-schema.sql. Re-running does not overwrite edits.
insert into public.prakruthi_categories(id,name,position,active) values('category-0','Plant fertilizers',0,true) on conflict do nothing;
insert into public.prakruthi_categories(id,name,position,active) values('category-1','Fish foods',1,true) on conflict do nothing;
insert into public.prakruthi_categories(id,name,position,active) values('category-2','Fish medicines',2,true) on conflict do nothing;
insert into public.prakruthi_categories(id,name,position,active) values('category-3','Aquarium cleaners',3,true) on conflict do nothing;
insert into public.prakruthi_categories(id,name,position,active) values('category-4','Bird foods',4,true) on conflict do nothing;
insert into public.prakruthi_products(slug,name,price,image,url,category,id,active,featured,stock,description) values('macro-nutrients-CEJJs9','Macro Nutrients',225.0,'/images/macro-nutrients-CEJJs9.webp','https://shop.prakruthiaqua.in/product/macro-nutrients-CEJJs9','Plant fertilizers','macro-nutrients-CEJJs9',true,true,0,'') on conflict do nothing;
insert into public.prakruthi_products(slug,name,price,image,url,category,id,active,featured,stock,description) values('co2-cylinder-DTWufX','Co2 Cylinder',2385.0,'/images/co2-cylinder-DTWufX.webp','https://shop.prakruthiaqua.in/product/co2-cylinder-DTWufX','Plant fertilizers','co2-cylinder-DTWufX',true,false,0,'') on conflict do nothing;
insert into public.prakruthi_products(slug,name,price,image,url,category,id,active,featured,stock,description) values('red-parrot-Za9dnI','Red Parrot',162.0,'/images/red-parrot-Za9dnI.webp','https://shop.prakruthiaqua.in/product/red-parrot-Za9dnI','Fish foods','red-parrot-Za9dnI',true,false,0,'') on conflict do nothing;
insert into public.prakruthi_products(slug,name,price,image,url,category,id,active,featured,stock,description) values('methylene-blue-z6OTqd','Methylene Blue',90.0,'/images/methylene-blue-z6OTqd.webp','https://shop.prakruthiaqua.in/product/methylene-blue-z6OTqd','Fish medicines','methylene-blue-z6OTqd',true,false,0,'') on conflict do nothing;
insert into public.prakruthi_products(slug,name,price,image,url,category,id,active,featured,stock,description) values('water-conditioner-oTMjrX','Water Conditioner',108.0,'/images/water-conditioner-oTMjrX.webp','https://shop.prakruthiaqua.in/product/water-conditioner-oTMjrX','Fish medicines','water-conditioner-oTMjrX',true,true,0,'') on conflict do nothing;
insert into public.prakruthi_products(slug,name,price,image,url,category,id,active,featured,stock,description) values('bio-chemical-sponge-mat-Ex8ieh','Bio Chemical Sponge Mat',108.0,'/images/bio-chemical-sponge-mat-Ex8ieh.webp','https://shop.prakruthiaqua.in/product/bio-chemical-sponge-mat-Ex8ieh','Aquarium cleaners','bio-chemical-sponge-mat-Ex8ieh',true,false,0,'') on conflict do nothing;
insert into public.prakruthi_products(slug,name,price,image,url,category,id,active,featured,stock,description) values('micro-pellets-5WjXzk','Micro Pellets',200.0,'/images/micro-pellets-5WjXzk.webp','https://shop.prakruthiaqua.in/product/micro-pellets-5WjXzk','Fish foods','micro-pellets-5WjXzk',true,true,0,'') on conflict do nothing;
insert into public.prakruthi_products(slug,name,price,image,url,category,id,active,featured,stock,description) values('prakruthi-aqua-medicine-macro-nurtient-250-ml-GA1rPf','Micro Nutrient',315.0,'/images/prakruthi-aqua-medicine-macro-nurtient-250-ml-GA1rPf.webp','https://shop.prakruthiaqua.in/product/prakruthi-aqua-medicine-macro-nurtient-250-ml-GA1rPf','Plant fertilizers','prakruthi-aqua-medicine-macro-nurtient-250-ml-GA1rPf',true,false,0,'') on conflict do nothing;
insert into public.prakruthi_products(slug,name,price,image,url,category,id,active,featured,stock,description) values('prakruthi-aqua-fish-food-v2OG0E','Shrimp - E',135.0,'/images/prakruthi-aqua-fish-food-v2OG0E.webp','https://shop.prakruthiaqua.in/product/prakruthi-aqua-fish-food-v2OG0E','Fish foods','prakruthi-aqua-fish-food-v2OG0E',true,false,0,'') on conflict do nothing;
insert into public.prakruthi_products(slug,name,price,image,url,category,id,active,featured,stock,description) values('carnivorx-blood-worms-premium-nutrition-for-carnivorous-aquatic-life-7ngLtR','Blood Worms',100.0,'/images/carnivorx-blood-worms-premium-nutrition-for-carnivorous-aquatic-life-7ngLtR.webp','https://shop.prakruthiaqua.in/product/carnivorx-blood-worms-premium-nutrition-for-carnivorous-aquatic-life-7ngLtR','Fish foods','carnivorx-blood-worms-premium-nutrition-for-carnivorous-aquatic-life-7ngLtR',true,true,0,'') on conflict do nothing;
insert into public.prakruthi_products(slug,name,price,image,url,category,id,active,featured,stock,description) values('prakruthi-aqua-fish-food-tubifex-worms-9CZmr6','Tubifex Worms',45.0,'/images/prakruthi-aqua-fish-food-tubifex-worms-9CZmr6.webp','https://shop.prakruthiaqua.in/product/prakruthi-aqua-fish-food-tubifex-worms-9CZmr6','Fish foods','prakruthi-aqua-fish-food-tubifex-worms-9CZmr6',true,false,0,'') on conflict do nothing;
insert into public.prakruthi_products(slug,name,price,image,url,category,id,active,featured,stock,description) values('prakruthi-aqua-fish-food-micro-bits-9lPMJM','Micro Bits',225.0,'/images/prakruthi-aqua-fish-food-micro-bits-9lPMJM.webp','https://shop.prakruthiaqua.in/product/prakruthi-aqua-fish-food-micro-bits-9lPMJM','Fish foods','prakruthi-aqua-fish-food-micro-bits-9lPMJM',true,false,0,'') on conflict do nothing;
insert into public.prakruthi_products(slug,name,price,image,url,category,id,active,featured,stock,description) values('prakruthi-aqua-fish-food-micro-pellets-U5BTGC','Pretty Gold',180.0,'/images/prakruthi-aqua-fish-food-micro-pellets-U5BTGC.webp','https://shop.prakruthiaqua.in/product/prakruthi-aqua-fish-food-micro-pellets-U5BTGC','Fish foods','prakruthi-aqua-fish-food-micro-pellets-U5BTGC',true,false,0,'') on conflict do nothing;
insert into public.prakruthi_products(slug,name,price,image,url,category,id,active,featured,stock,description) values('prakruthi-aqua-medicine-anti-bacto-clear-BcGOoH','Anti Bacto Clear',89.98,'/images/prakruthi-aqua-medicine-anti-bacto-clear-BcGOoH.webp','https://shop.prakruthiaqua.in/product/prakruthi-aqua-medicine-anti-bacto-clear-BcGOoH','Fish medicines','prakruthi-aqua-medicine-anti-bacto-clear-BcGOoH',true,false,0,'') on conflict do nothing;
insert into public.prakruthi_products(slug,name,price,image,url,category,id,active,featured,stock,description) values('prakruthi-aqua-medicine-breath-easy-Nu8Tde','Breathe Easy',100.0,'/images/prakruthi-aqua-medicine-breath-easy-Nu8Tde.webp','https://shop.prakruthiaqua.in/product/prakruthi-aqua-medicine-breath-easy-Nu8Tde','Fish medicines','prakruthi-aqua-medicine-breath-easy-Nu8Tde',true,false,0,'') on conflict do nothing;
insert into public.prakruthi_products(slug,name,price,image,url,category,id,active,featured,stock,description) values('aquarium-cleaner-100-ml-HMJ3nY','Aqua Glass Cleaner',315.0,'/images/aquarium-cleaner-100-ml-HMJ3nY.webp','https://shop.prakruthiaqua.in/product/aquarium-cleaner-100-ml-HMJ3nY','Aquarium cleaners','aquarium-cleaner-100-ml-HMJ3nY',true,false,0,'') on conflict do nothing;
insert into public.prakruthi_products(slug,name,price,image,url,category,id,active,featured,stock,description) values('mix-seed-bird-food-Nkh1Xe','Mix Seed Bird Food',250.0,'/images/mix-seed-bird-food-Nkh1Xe.webp','https://shop.prakruthiaqua.in/product/mix-seed-bird-food-Nkh1Xe','Bird foods','mix-seed-bird-food-Nkh1Xe',true,false,0,'') on conflict do nothing;
insert into public.prakruthi_products(slug,name,price,image,url,category,id,active,featured,stock,description) values('birds-bites-sunflower-seed-bird-food-500gm-rZURwu','Birds Bites Sunflower Seed Bird Food - 500Gm',450.0,'/images/birds-bites-sunflower-seed-bird-food-500gm-rZURwu.webp','https://shop.prakruthiaqua.in/product/birds-bites-sunflower-seed-bird-food-500gm-rZURwu','Bird foods','birds-bites-sunflower-seed-bird-food-500gm-rZURwu',true,false,0,'') on conflict do nothing;
insert into public.prakruthi_banners("label","eyebrow","title","accent","description","image","alt","href","product","productName","productImage","id","active","position") values('Fish nutrition','NOURISH THEIR NATURE','A world of colour.','A little more life.','Discover pellets and freeze-dried favourites for the fish at the heart of your aquarium.','/images/aquarium.jpg','Colourful fish swimming through a spacious aquarium','/shop/?category=Fish%20foods','carnivorx-blood-worms-premium-nutrition-for-carnivorous-aquatic-life-7ngLtR','Blood Worms','/images/carnivorx-blood-worms-premium-nutrition-for-carnivorous-aquatic-life-7ngLtR.webp','nutrition',true,0) on conflict do nothing;
insert into public.prakruthi_banners("label","eyebrow","title","accent","description","image","alt","href","product","productName","productImage","id","active","position") values('Plant care','LET YOUR UNDERWATER GARDEN GROW','Rooted in nature.','Ready to flourish.','Explore plant nutrition and essentials for the beautiful underwater garden you’re growing.','/images/plants.jpg','Lush green aquatic plants in an underwater garden','/shop/?category=Plant%20fertilizers','macro-nutrients-CEJJs9','Macro Nutrients','/images/macro-nutrients-CEJJs9.webp','plants',true,1) on conflict do nothing;
insert into public.prakruthi_banners("label","eyebrow","title","accent","description","image","alt","href","product","productName","productImage","id","active","position") values('Water wellness','CARE BEYOND THE SURFACE','Find your balance.','See the beauty.','Care for the water that connects your whole aquarium. Discover your everyday water essentials.','/images/water.jpg','A peaceful underwater ecosystem','/shop/?category=Aquarium%20cleaners','water-conditioner-oTMjrX','Water Conditioner','/images/water-conditioner-oTMjrX.webp','water',true,2) on conflict do nothing;
insert into public.prakruthi_banners("label","eyebrow","title","accent","description","image","alt","href","product","productName","productImage","id","active","position") values('Fish wellbeing','FOR THE LIFE YOU LOVE','Small details.','Thoughtful care.','Find fish care products and connect with our team for help choosing what’s right for your aquarium.','/images/birds.jpg','Vibrant tropical fish swimming around aquarium coral','/shop/?category=Fish%20medicines','methylene-blue-z6OTqd','Methylene Blue','/images/methylene-blue-z6OTqd.webp','wellbeing',true,3) on conflict do nothing;
insert into public.prakruthi_banners("label","eyebrow","title","accent","description","image","alt","href","product","productName","productImage","id","active","position") values('Everyday essentials','A LITTLE CARE. A WORLD OF LIFE.','Your little world.','Our shared passion.','From everyday nutrition to aquarium essentials, bring a little more care to the world you love.','/images/aquarium-essentials.jpg','An orange goldfish with flowing fins against a dark background','/shop/','micro-pellets-5WjXzk','Micro Pellets','/images/micro-pellets-5WjXzk.webp','essentials',true,4) on conflict do nothing;

commit;
