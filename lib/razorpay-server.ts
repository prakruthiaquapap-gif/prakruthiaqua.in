// Server-only Razorpay + order logic. Imported only by app/api/razorpay route handlers,
// so RAZORPAY_KEY_SECRET and SUPABASE_SERVICE_ROLE_KEY never reach the browser.
import { createHmac, timingSafeEqual } from 'node:crypto';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export class PaymentError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}

type Source = 'checkout' | 'status' | 'webhook';
export type DbOrder = {
  id: string; order_number: string; user_id: string | null; customer_name: string; email: string; phone: string;
  status: string; payment_status: string; payment_method: string; total: number; amount_paise: number | null; currency: string | null;
  razorpay_order_id: string | null; razorpay_payment_id: string | null;
};
export type RzpPayment = { id: string; order_id: string; amount: number; currency: string; status: string; method?: string; error_description?: string | null };

function env() {
  const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '';
  const keySecret = process.env.RAZORPAY_KEY_SECRET || '';
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!keyId || !keySecret) throw new PaymentError('Online payments are not configured yet (Razorpay keys missing).', 503);
  if (!url || !serviceKey) throw new PaymentError('Online payments are not configured yet (Supabase service key missing).', 503);
  return { keyId, keySecret, url, serviceKey };
}

let admin: SupabaseClient | null = null;
export function db() {
  const { url, serviceKey } = env();
  admin ??= createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  return admin;
}
export const razorpayKeyId = () => env().keyId;

// ---------- Razorpay REST ----------
export async function rzp<T>(path: string, init: RequestInit = {}): Promise<T> {
  const { keyId, keySecret } = env();
  const res = await fetch(`https://api.razorpay.com/v1${path}`, {
    ...init,
    cache: 'no-store',
    headers: { Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`, 'Content-Type': 'application/json', ...(init.headers ?? {}) },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new PaymentError(body?.error?.description || `Razorpay request failed (${res.status})`, 502);
  return body as T;
}

export function hmacHex(secret: string, message: string) {
  return createHmac('sha256', secret).update(message).digest('hex');
}
export function safeEqual(a: string, b: string) {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}
export const verifyCheckoutSignature = (orderId: string, paymentId: string, signature: string) =>
  safeEqual(hmacHex(env().keySecret, `${orderId}|${paymentId}`), signature);

// ---------- Database ----------
export const amountOf = (o: DbOrder) => Number(o.amount_paise ?? Math.round(Number(o.total) * 100));
const now = () => new Date().toISOString();

export async function logEvent(o: Partial<DbOrder> | null, event: string, source: Source, payload: Record<string, unknown> = {}, webhookEventId?: string | null) {
  return db().from('prakruthi_payment_events').insert({
    order_id: o?.id ?? null,
    razorpay_order_id: o?.razorpay_order_id ?? (payload.razorpay_order_id as string | undefined) ?? null,
    razorpay_payment_id: (payload.razorpay_payment_id as string | undefined) ?? null,
    event, source, payload, webhook_event_id: webhookEventId ?? null,
  });
}

export async function userFromRequest(req: Request) {
  const token = (req.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '');
  if (!token) throw new PaymentError('Please sign in to pay.', 401);
  const { data } = await db().auth.getUser(token);
  if (!data?.user) throw new PaymentError('Your session has expired. Please sign in again.', 401);
  return data.user;
}

export async function loadOwnOrder(orderId: unknown, userId: string): Promise<DbOrder> {
  if (!orderId || typeof orderId !== 'string') throw new PaymentError('Missing order');
  const { data, error } = await db().from('prakruthi_orders').select('*').eq('id', orderId).maybeSingle();
  if (error) throw new PaymentError('Payments need the latest database update (run supabase/razorpay-payments.sql).', 500);
  if (!data) throw new PaymentError('Order not found', 404);
  if (data.user_id !== userId) throw new PaymentError('This order belongs to a different account', 403);
  if (data.payment_method !== 'razorpay') throw new PaymentError('This order is not set up for online payment');
  return data as DbOrder;
}

async function markPaid(o: DbOrder, p: RzpPayment, signature: string | null, source: Source) {
  const { error } = await db().from('prakruthi_orders').update({
    payment_status: 'paid',
    status: o.status === 'pending' ? 'confirmed' : o.status,
    razorpay_payment_id: p.id,
    ...(signature ? { razorpay_signature: signature } : {}),
    payment_mode: p.method ?? null,
    paid_at: now(), payment_error: null, payment_updated_at: now(),
  }).eq('id', o.id).neq('payment_status', 'paid');
  if (error) throw new PaymentError('Payment received, but the order could not be updated. Our team will confirm it.', 500);
  await logEvent(o, 'order.marked_paid', source, { razorpay_payment_id: p.id, method: p.method, amount: p.amount });
}

// Validates a payment against the order, captures it if only authorised, and records the outcome.
export async function settle(o: DbOrder, p: RzpPayment, signature: string | null, source: Source): Promise<'paid' | 'pending' | 'failed'> {
  if (p.order_id !== o.razorpay_order_id) throw new PaymentError('Payment does not belong to this order');
  if (Number(p.amount) !== amountOf(o) || p.currency !== (o.currency || 'INR')) {
    await logEvent(o, 'payment.amount_mismatch', source, { razorpay_payment_id: p.id, amount: p.amount, expected: amountOf(o) });
    await db().from('prakruthi_orders').update({ payment_error: `Amount mismatch: received ${p.amount}, expected ${amountOf(o)}`, payment_updated_at: now() }).eq('id', o.id);
    throw new PaymentError('Payment amount does not match the order. Please contact us.');
  }
  let payment = p;
  if (payment.status === 'authorized') {
    payment = await rzp<RzpPayment>(`/payments/${p.id}/capture`, { method: 'POST', body: JSON.stringify({ amount: amountOf(o), currency: o.currency || 'INR' }) });
    await logEvent(o, 'payment.captured_by_server', source, { razorpay_payment_id: p.id });
  }
  if (payment.status === 'captured') { await markPaid(o, payment, signature, source); return 'paid'; }
  if (payment.status === 'failed') {
    await db().from('prakruthi_orders').update({ payment_status: 'failed', payment_error: payment.error_description ?? 'Payment failed', payment_updated_at: now() })
      .eq('id', o.id).neq('payment_status', 'paid');
    return 'failed';
  }
  return 'pending';
}

// ---------- Actions ----------
function checkoutPayload(o: DbOrder, razorpayOrderId: string, amount: number) {
  return {
    status: 'created' as const, key_id: razorpayKeyId(), razorpay_order_id: razorpayOrderId, amount, currency: o.currency || 'INR',
    order_id: o.id, order_number: o.order_number, prefill: { name: o.customer_name, email: o.email, contact: o.phone },
  };
}

export async function createPayment(o: DbOrder) {
  if (o.payment_status === 'paid') return { status: 'paid' as const, order_number: o.order_number };
  const amount = amountOf(o);
  if (!Number.isInteger(amount) || amount < 100) throw new PaymentError('Order amount must be at least ₹1');

  // Reuse the existing Razorpay order (e.g. after a refresh) unless it is already paid.
  if (o.razorpay_order_id) {
    const existing = await rzp<{ id: string; amount: number; status: string }>(`/orders/${o.razorpay_order_id}`);
    if (existing.status === 'paid') {
      const result = await paymentStatus(o);
      if (result.status === 'paid') return result;
    } else if (existing.amount === amount) {
      return checkoutPayload(o, existing.id, amount);
    }
  }

  const created = await rzp<{ id: string }>('/orders', {
    method: 'POST',
    body: JSON.stringify({ amount, currency: o.currency || 'INR', receipt: o.order_number, payment_capture: true, notes: { order_id: o.id, order_number: o.order_number } }),
  });
  const { error } = await db().from('prakruthi_orders').update({ razorpay_order_id: created.id, payment_status: 'pending', payment_error: null, payment_updated_at: now() })
    .eq('id', o.id).neq('payment_status', 'paid');
  if (error) throw new PaymentError('Could not start the payment. Please try again.', 500);
  await logEvent({ ...o, razorpay_order_id: created.id }, 'razorpay.order_created', 'checkout', { amount });
  return checkoutPayload(o, created.id, amount);
}

export async function verifyPayment(o: DbOrder, body: Record<string, unknown>) {
  const razorpay_order_id = String(body.razorpay_order_id ?? ''), razorpay_payment_id = String(body.razorpay_payment_id ?? ''), razorpay_signature = String(body.razorpay_signature ?? '');
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) throw new PaymentError('Incomplete payment details');
  if (razorpay_order_id !== o.razorpay_order_id) throw new PaymentError('Payment does not belong to this order');
  if (!verifyCheckoutSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)) {
    await logEvent(o, 'payment.signature_invalid', 'checkout', { razorpay_payment_id });
    throw new PaymentError('Payment could not be verified. If money was deducted, it will be confirmed automatically or refunded.');
  }
  if (o.payment_status === 'paid') return { status: 'paid' as const, order_number: o.order_number };
  const payment = await rzp<RzpPayment>(`/payments/${razorpay_payment_id}`);
  await logEvent(o, 'payment.verified_signature', 'checkout', { razorpay_payment_id, razorpay_status: payment.status });
  return { status: await settle(o, payment, razorpay_signature, 'checkout'), order_number: o.order_number };
}

export async function paymentStatus(o: DbOrder) {
  if (o.payment_status === 'paid') return { status: 'paid' as const, order_number: o.order_number, total: o.total };
  if (!o.razorpay_order_id) return { status: 'unpaid' as const, order_number: o.order_number, total: o.total };
  const list = await rzp<{ items: RzpPayment[] }>(`/orders/${o.razorpay_order_id}/payments`);
  const items = list.items ?? [];
  const best = items.find((p) => p.status === 'captured') ?? items.find((p) => p.status === 'authorized');
  if (best) return { status: await settle(o, best, null, 'status'), order_number: o.order_number, total: o.total };
  await logEvent(o, 'status.checked', 'status', { payments: items.map((p) => ({ id: p.id, status: p.status })) });
  const allFailed = items.length > 0 && items.every((p) => p.status === 'failed');
  return { status: allFailed ? ('failed' as const) : ('pending' as const), order_number: o.order_number, total: o.total };
}
