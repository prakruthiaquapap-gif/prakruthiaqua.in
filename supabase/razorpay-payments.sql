-- ============================================================================
-- Prakruthi Aqua — Razorpay online payments
-- Run once in Supabase → SQL Editor (safe to re-run).
-- ============================================================================

-- 1. Payment columns on orders --------------------------------------------------
alter table public.prakruthi_orders
  add column if not exists user_id uuid references auth.users(id) on delete set null,
  add column if not exists payment_method text not null default 'offline',
  add column if not exists amount_paise bigint,
  add column if not exists currency text not null default 'INR',
  add column if not exists razorpay_order_id text,
  add column if not exists razorpay_payment_id text,
  add column if not exists razorpay_signature text,
  add column if not exists payment_mode text,            -- upi / card / netbanking / wallet (from Razorpay)
  add column if not exists paid_at timestamptz,
  add column if not exists payment_error text,
  add column if not exists payment_updated_at timestamptz;

alter table public.prakruthi_orders drop constraint if exists prakruthi_orders_payment_method_check;
alter table public.prakruthi_orders add constraint prakruthi_orders_payment_method_check
  check (payment_method in ('offline', 'razorpay'));

-- Allow the in-between states used while a customer is paying.
alter table public.prakruthi_orders drop constraint if exists prakruthi_orders_payment_status_check;
alter table public.prakruthi_orders add constraint prakruthi_orders_payment_status_check
  check (payment_status in ('unpaid', 'pending', 'paid', 'failed', 'refunded'));

create unique index if not exists prakruthi_orders_razorpay_order_uidx
  on public.prakruthi_orders(razorpay_order_id) where razorpay_order_id is not null;
create unique index if not exists prakruthi_orders_razorpay_payment_uidx
  on public.prakruthi_orders(razorpay_payment_id) where razorpay_payment_id is not null;
create index if not exists prakruthi_orders_user_idx on public.prakruthi_orders(user_id);
create index if not exists prakruthi_orders_payment_status_idx on public.prakruthi_orders(payment_status);

-- Customers may read their own orders (e.g. an order history page). Admin policy is unchanged.
drop policy if exists "Customers read own orders" on public.prakruthi_orders;
create policy "Customers read own orders" on public.prakruthi_orders
  for select to authenticated using (user_id = auth.uid());

-- 2. Payment audit log ----------------------------------------------------------
-- Every create / verify / status check / webhook is recorded. Written only by the
-- Edge Functions (service role); store admins can read it.
create table if not exists public.prakruthi_payment_events (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  order_id text references public.prakruthi_orders(id) on delete set null,
  razorpay_order_id text,
  razorpay_payment_id text,
  event text not null,
  source text not null check (source in ('checkout', 'status', 'webhook')),
  webhook_event_id text unique,
  payload jsonb not null default '{}'::jsonb
);
create index if not exists prakruthi_payment_events_order_idx on public.prakruthi_payment_events(order_id, created_at desc);
alter table public.prakruthi_payment_events enable row level security;
revoke all on public.prakruthi_payment_events from anon, authenticated;
grant select on public.prakruthi_payment_events to authenticated;
drop policy if exists "Admins read payment events" on public.prakruthi_payment_events;
create policy "Admins read payment events" on public.prakruthi_payment_events
  for select to authenticated using (public.prakruthi_is_store_admin());

-- 3. Place-order function: records the signed-in customer, payment method and
--    the exact amount in paise, and returns the order id for payment.
create or replace function public.prakruthi_place_order(p_customer jsonb, p_items jsonb) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  requested jsonb; prod public.prakruthi_products%rowtype; qty integer;
  snapshot jsonb := '[]'::jsonb; subtotal numeric(12,2) := 0;
  new_id text; number text; method text;
begin
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
  if method = 'razorpay' and auth.uid() is null then raise exception 'Please sign in to pay online'; end if;

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

  insert into public.prakruthi_orders(customer_name,email,phone,address,notes,total,items,status,payment_status,source,user_id,payment_method,amount_paise,currency)
  values (trim(p_customer->>'name'), trim(p_customer->>'email'), trim(p_customer->>'phone'), trim(p_customer->>'address'),
          coalesce(p_customer->>'notes',''), subtotal, snapshot, 'pending', 'unpaid', 'website-checkout',
          auth.uid(), method, round(subtotal * 100)::bigint, 'INR')
  returning id, order_number into new_id, number;

  return jsonb_build_object('id', new_id, 'order_number', number, 'total', subtotal, 'amount_paise', round(subtotal * 100)::bigint);
end;$$;
revoke all on function public.prakruthi_place_order(jsonb,jsonb) from public;
grant execute on function public.prakruthi_place_order(jsonb,jsonb) to anon, authenticated;
