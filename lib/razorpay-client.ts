// Browser-side helpers for Razorpay Checkout. Only the public key id is ever used here;
// the key secret stays on the server in app/api/razorpay (Vercel environment variable).
import { supabase } from './supabase';

export const onlinePaymentsEnabled = !!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

export type PendingPayment = { order_id: string; order_number: string; total: number; direct: boolean; created_at: number };
const PENDING_KEY = 'prakruthi-pending-payment';

export function readPending(): PendingPayment | null {
  try {
    const p = JSON.parse(localStorage.getItem(PENDING_KEY) || 'null');
    // Forget abandoned attempts after 3 days.
    return p && typeof p.order_id === 'string' && Date.now() - p.created_at < 3 * 864e5 ? p : null;
  } catch { return null; }
}
export function savePending(p: PendingPayment) { try { localStorage.setItem(PENDING_KEY, JSON.stringify(p)); } catch {} }
export function clearPending() { try { localStorage.removeItem(PENDING_KEY); } catch {} }

export type CreateResult = {
  status: 'created' | 'paid'; key_id: string; razorpay_order_id: string; amount: number; currency: string;
  order_id: string; order_number: string; prefill: { name: string; email: string; contact: string };
};
export type PaymentStatus = 'paid' | 'pending' | 'failed' | 'unpaid';

export async function callPayments<T>(body: Record<string, unknown>): Promise<T> {
  if (!supabase) throw Error('Online payments are not connected yet.');
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw Error('Please sign in again to continue with payment.');
  let res: Response;
  try {
    res = await fetch('/api/razorpay/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify(body),
    });
  } catch {
    throw Error('We couldn’t reach the payment service. Check your connection and try again.');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Error(data?.error || 'Payment service is unavailable. Please try again in a moment.');
  return data as T;
}

let scriptPromise: Promise<void> | null = null;
export function loadRazorpay(): Promise<void> {
  if (typeof window === 'undefined') return Promise.reject(Error('Not in a browser'));
  if ((window as unknown as { Razorpay?: unknown }).Razorpay) return Promise.resolve();
  scriptPromise ??= new Promise<void>((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => { scriptPromise = null; reject(Error('Could not load Razorpay. Check your connection and try again.')); };
    document.body.appendChild(s);
  });
  return scriptPromise;
}

export type RazorpaySuccess = { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string };
type RazorpayInstance = { open: () => void; on: (event: string, cb: (resp: { error?: { description?: string } }) => void) => void };
type RazorpayCtor = new (options: Record<string, unknown>) => RazorpayInstance;

export function openRazorpay(order: CreateResult, handlers: { onSuccess: (r: RazorpaySuccess) => void; onDismiss: () => void; onFailed: (message: string) => void }) {
  const Razorpay = (window as unknown as { Razorpay: RazorpayCtor }).Razorpay;
  const rzp = new Razorpay({
    key: order.key_id || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    amount: order.amount,
    currency: order.currency,
    order_id: order.razorpay_order_id,
    name: 'Prakruthi Aqua',
    description: `Order ${order.order_number}`,
    image: `${window.location.origin}/images/prakruthi-icon.svg`,
    prefill: order.prefill,
    notes: { order_number: order.order_number },
    theme: { color: '#263F04' },
    retry: { enabled: true, max_count: 3 },
    modal: { confirm_close: true, ondismiss: handlers.onDismiss },
    handler: handlers.onSuccess,
  });
  rzp.on('payment.failed', (resp) => handlers.onFailed(resp.error?.description || 'Payment failed. Please try again.'));
  rzp.open();
}
