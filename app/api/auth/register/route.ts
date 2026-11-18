// POST /api/auth/register/ — create a WEBSITE customer account (separate from dealer logins).
import { NextResponse } from 'next/server';
import { adminDb, ServerError, errorResponse } from '@/lib/server-db';
import { hashPassword, createSessionToken, sessionCookieOptions, SESSION_COOKIE, normaliseEmail, validEmail, toPublic, type Customer } from '@/lib/customer-auth';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const name = String(body.name ?? '').trim();
    const email = normaliseEmail(body.email);
    const phone = String(body.phone ?? '').trim();
    const password = String(body.password ?? '');
    if (name.length < 1 || name.length > 100) throw new ServerError('Please enter your full name.');
    if (!validEmail(email)) throw new ServerError('Please enter a valid email address.');
    if (phone.length > 30) throw new ServerError('Please check your phone number.');
    if (password.length < 8 || password.length > 128) throw new ServerError('Password must be at least 8 characters.');

    const db = adminDb();
    const { data: existing, error: lookupError } = await db.from('prakruthi_website_customers').select('id').eq('email', email).maybeSingle();
    if (lookupError) throw new ServerError('Customer accounts need the latest database update (run supabase/website-customers.sql).', 500);
    if (existing) throw new ServerError('An account with this email is already registered on the website. Please sign in.', 409);

    const { data, error } = await db.from('prakruthi_website_customers')
      .insert({ full_name: name, email, phone, password_hash: await hashPassword(password), last_login_at: new Date().toISOString() })
      .select('id, full_name, email, phone, status').single();
    if (error?.code === '23505') throw new ServerError('An account with this email is already registered on the website. Please sign in.', 409);
    if (error || !data) throw new ServerError('Unable to create your account. Please try again.', 500);

    const res = NextResponse.json({ user: toPublic(data as Customer) });
    res.cookies.set(SESSION_COOKIE, createSessionToken(data.id), sessionCookieOptions);
    return res;
  } catch (e) { return errorResponse(e); }
}
