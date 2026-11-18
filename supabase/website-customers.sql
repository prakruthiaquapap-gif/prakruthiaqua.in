-- ============================================================================
-- Prakruthi Aqua — separate WEBSITE customer accounts (own register table)
-- Run in Supabase → SQL Editor AFTER supabase/razorpay-payments.sql. Safe to re-run.
--
-- Website customers are stored here, NOT in Supabase Auth (auth.users), so the same
-- email can register on the website even if it is already used on the dealer portal.
-- Dealer tables and dealer logins are not touched.
-- Passwords are stored only as scrypt hashes, created by the website server (/api/auth).
-- ============================================================================

create table if not exists public.prakruthi_website_customers (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  full_name text not null check (char_length(full_name) between 1 and 100),
  email text not null check (char_length(email) between 3 and 200 and email = lower(email)),
  phone text not null default '' check (char_length(phone) <= 30),
  password_hash text not null,
  status text not null default 'active' check (status in ('active', 'blocked')),
  failed_logins integer not null default 0,
  locked_until timestamptz,
  last_login_at timestamptz
);
create unique index if not exists prakruthi_website_customers_email_uidx on public.prakruthi_website_customers(email);

-- Only the website server (service role) reads/writes this table. Admins may view
-- customer details, but never the password hash.
alter table public.prakruthi_website_customers enable row level security;
revoke all on public.prakruthi_website_customers from anon, authenticated;
grant select (id, created_at, full_name, email, phone, status, last_login_at) on public.prakruthi_website_customers to authenticated;
drop policy if exists "Admins read website customers" on public.prakruthi_website_customers;
create policy "Admins read website customers" on public.prakruthi_website_customers
  for select to authenticated using (public.prakruthi_is_store_admin());

-- Orders belong to a website customer.
alter table public.prakruthi_orders
  add column if not exists customer_id uuid references public.prakruthi_website_customers(id) on delete set null;
create index if not exists prakruthi_orders_customer_idx on public.prakruthi_orders(customer_id);

-- Server-only order placement for a signed-in website customer. Prices come from the
-- catalog, never from the browser. Callable only with the service role (website server).
create or replace function public.prakruthi_place_customer_order(p_customer_id uuid, p_customer jsonb, p_items jsonb) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  requested jsonb; prod public.prakruthi_products%rowtype; qty integer;
  snapshot jsonb := '[]'::jsonb; subtotal numeric(12,2) := 0;
  new_id text; number text; method text;
begin
  if not exists (select 1 from public.prakruthi_website_customers where id = p_customer_id and status = 'active') then
    raise exception 'Please sign in to place an order';
  end if;
  if jsonb_typeof(p_customer) <> 'object' or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) not between 1 and 50 then
    raise exception 'Invalid order details';
  end if;
  if coalesce(char_length(trim(p_customer->>'name')),0) not between 1 and 100
     or coalesce(char_length(p_customer->>'email'),0) not between 3 and 200
     or coalesce(p_customer->>'email','') !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
     or coalesce(char_length(p_customer->>'phone'),0) not between 1 and 30
     or coalesce(char_length(p_customer->>'address'),0) not between 10 and 1000
     or coalesce(char_length(p_customer->>'notes'),0) > 2000 then
    raise exception 'Please check customer details';
  end if;
  method := coalesce(nullif(p_customer->>'payment_method',''), 'offline');
  if method not in ('offline','razorpay') then raise exception 'Invalid payment method'; end if;

  for requested in select value from jsonb_array_elements(p_items) loop
    if coalesce(requested->>'quantity','') !~ '^[0-9]{1,2}$' then raise exception 'Invalid quantity'; end if;
    qty := (requested->>'quantity')::integer;
    if qty not between 1 and 20 then raise exception 'Choose between 1 and 20 of each product'; end if;
    if exists (select 1 from jsonb_array_elements(snapshot) x where x->>'slug' = requested->>'slug') then raise exception 'Duplicate product in order'; end if;
    select p.* into prod from public.prakruthi_products p
      join public.prakruthi_categories c on c.name = p.category
      where p.slug = requested->>'slug' and p.active and c.active;
    if not found then raise exception 'A product is no longer available'; end if;
    snapshot := snapshot || jsonb_build_array(jsonb_build_object('slug',prod.slug,'name',prod.name,'price',prod.price,'quantity',qty));
    subtotal := subtotal + (prod.price * qty);
  end loop;
  if subtotal <= 0 then raise exception 'Order total must be above zero'; end if;
  if subtotal > 10000000 then raise exception 'Please contact us for large orders'; end if;

  insert into public.prakruthi_orders(customer_name,email,phone,address,notes,total,items,status,payment_status,source,customer_id,payment_method,amount_paise,currency)
  values (trim(p_customer->>'name'), trim(p_customer->>'email'), trim(p_customer->>'phone'), trim(p_customer->>'address'),
          coalesce(p_customer->>'notes',''), subtotal, snapshot, 'pending', 'unpaid', 'website-checkout',
          p_customer_id, method, round(subtotal * 100)::bigint, 'INR')
  returning id, order_number into new_id, number;

  return jsonb_build_object('id', new_id, 'order_number', number, 'total', subtotal, 'amount_paise', round(subtotal * 100)::bigint);
end;$$;
revoke all on function public.prakruthi_place_customer_order(uuid, jsonb, jsonb) from public, anon, authenticated;
grant execute on function public.prakruthi_place_customer_order(uuid, jsonb, jsonb) to service_role;

-- See your website customers:
--   select full_name, email, phone, created_at, last_login_at from public.prakruthi_website_customers order by created_at desc;
