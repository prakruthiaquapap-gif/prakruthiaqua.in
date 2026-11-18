// POST /api/orders/ — place an order for the signed-in website customer.
// Totals are calculated in the database from catalog prices, never from the browser.
import { adminDb, ServerError, errorResponse } from '@/lib/server-db';
import { requireCustomer } from '@/lib/customer-auth';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const customer = await requireCustomer(req);
    const body = (await req.json().catch(() => ({}))) as { customer?: Record<string, unknown>; items?: unknown; payment_method?: string };
    const method = body.payment_method === 'razorpay' ? 'razorpay' : 'offline';
    const { data, error } = await adminDb().rpc('prakruthi_place_customer_order', {
      p_customer_id: customer.id,
      p_customer: { ...(body.customer ?? {}), payment_method: method },
      p_items: body.items ?? [],
    });
    if (error) {
      // Messages raised by the order function are safe, customer-facing text.
      if (error.code === 'P0001') throw new ServerError(error.message);
      if (error.code === 'PGRST202' || error.code === '42883') throw new ServerError('Orders need the latest database update (run supabase/website-customers.sql).', 500);
      throw new ServerError('Unable to place your order. Please try again.', 500);
    }
    return Response.json(data);
  } catch (e) { return errorResponse(e); }
}

// GET /api/orders/ — the signed-in customer's own orders, newest first.
export async function GET(req: Request) {
  try {
    const customer = await requireCustomer(req);
    const { data, error } = await adminDb().from('prakruthi_orders')
      .select('id, order_number, created_at, customer_name, email, phone, address, notes, status, payment_status, payment_method, payment_mode, paid_at, razorpay_payment_id, total, items')
      .eq('customer_id', customer.id).order('created_at', { ascending: false }).limit(100);
    if (error) throw new ServerError('Unable to load your orders right now.', 500);
    return Response.json({ orders: data ?? [] }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) { return errorResponse(e); }
}
