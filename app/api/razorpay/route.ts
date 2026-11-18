// POST /api/razorpay/  — { action: 'create' | 'verify' | 'status', order_id, ...razorpay fields }
// Runs on the server (Vercel). Requires the signed-in customer's Supabase access token.
import { PaymentError, userFromRequest, loadOwnOrder, createPayment, verifyPayment, paymentStatus } from '@/lib/razorpay-server';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const user = await userFromRequest(req);
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const order = await loadOwnOrder(body.order_id, user.id);
    if (body.action === 'create') return Response.json(await createPayment(order));
    if (body.action === 'verify') return Response.json(await verifyPayment(order, body));
    if (body.action === 'status') return Response.json(await paymentStatus(order));
    throw new PaymentError('Unknown action');
  } catch (e) {
    if (!(e instanceof PaymentError)) console.error('razorpay api error', e);
    return Response.json({ error: e instanceof Error ? e.message : 'Unexpected error' }, { status: e instanceof PaymentError ? e.status : 500 });
  }
}
