// GET /api/auth/me/ — the signed-in website customer, or { user: null }.
import { sessionCustomerId, findCustomerById, toPublic } from '@/lib/customer-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const id = sessionCustomerId(req);
    const customer = id ? await findCustomerById(id) : null;
    return Response.json({ user: customer ? toPublic(customer) : null }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return Response.json({ user: null }, { headers: { 'Cache-Control': 'no-store' } });
  }
}
