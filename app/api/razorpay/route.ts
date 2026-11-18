// POST /api/razorpay/  — { action: 'create' | 'verify' | 'status', order_id, ...razorpay fields }
// Runs on the server (Vercel). Requires the signed-in website customer's session cookie.
import { PaymentError, loadOwnOrder, createPayment, verifyPayment, paymentStatus } from '@/lib/razorpay-server';
import { requireCustomer } from '@/lib/customer-auth';
import { errorResponse } from '@/lib/server-db';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const customer = await requireCustomer(req);
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const order = await loadOwnOrder(body.order_id, customer.id);
    if (body.action === 'create') return Response.json(await createPayment(order));
    if (body.action === 'verify') return Response.json(await verifyPayment(order, body));
    if (body.action === 'status') return Response.json(await paymentStatus(order));
    throw new PaymentError('Unknown action');
  } catch (e) {
    return errorResponse(e);
  }
}
