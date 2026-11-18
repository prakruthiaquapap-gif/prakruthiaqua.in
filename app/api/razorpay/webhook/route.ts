// POST /api/razorpay/webhook/ — OPTIONAL safety net. Only active when RAZORPAY_WEBHOOK_SECRET is set.
// Marks orders paid even if the customer closed the browser before the site could confirm.
// Razorpay Dashboard → Settings → Webhooks → URL: https://<your-domain>/api/razorpay/webhook/
// Events: payment.authorized, payment.captured, payment.failed, order.paid
import { db, hmacHex, safeEqual, logEvent, settle, type DbOrder, type RzpPayment } from '@/lib/razorpay-server';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return new Response('Webhook not configured', { status: 503 });

  const raw = await req.text();
  if (!safeEqual(hmacHex(secret, raw), req.headers.get('x-razorpay-signature') ?? '')) return new Response('Invalid signature', { status: 401 });

  try {
    const evt = JSON.parse(raw);
    const payment: RzpPayment | undefined = evt?.payload?.payment?.entity;
    const rzpOrderId: string | undefined = payment?.order_id ?? evt?.payload?.order?.entity?.id;
    const { data: order } = rzpOrderId
      ? await db().from('prakruthi_orders').select('*').eq('razorpay_order_id', rzpOrderId).maybeSingle()
      : { data: null };

    // Razorpay retries deliveries; the unique event id makes each one count once.
    const { error: dup } = await logEvent(order ?? { razorpay_order_id: rzpOrderId ?? null }, `webhook:${evt?.event}`, 'webhook',
      { ...evt, razorpay_payment_id: payment?.id }, req.headers.get('x-razorpay-event-id'));
    if (dup?.code === '23505') return new Response('Duplicate', { status: 200 });
    if (!order || !payment || order.payment_status === 'paid') return new Response('ok', { status: 200 });

    await settle(order as DbOrder, payment, null, 'webhook').catch((e) => console.error('webhook settle', e));
    return new Response('ok', { status: 200 });
  } catch (e) {
    console.error('razorpay webhook error', e);
    return new Response('ok', { status: 200 });
  }
}
