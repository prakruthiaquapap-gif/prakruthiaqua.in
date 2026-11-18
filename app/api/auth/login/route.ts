// POST /api/auth/login/ — sign in a WEBSITE customer. Locks for 15 minutes after 5 wrong passwords.
import { NextResponse } from 'next/server';
import { adminDb, ServerError, errorResponse } from '@/lib/server-db';
import { verifyPassword, createSessionToken, sessionCookieOptions, SESSION_COOKIE, normaliseEmail, toPublic, type Customer } from '@/lib/customer-auth';

export const runtime = 'nodejs';
const WRONG = 'Incorrect email or password.';

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const email = normaliseEmail(body.email);
    const password = String(body.password ?? '');
    if (!email || !password) throw new ServerError(WRONG, 401);

    const db = adminDb();
    const { data: row, error } = await db.from('prakruthi_website_customers')
      .select('id, full_name, email, phone, status, password_hash, failed_logins, locked_until').eq('email', email).maybeSingle();
    if (error) throw new ServerError('Customer accounts need the latest database update (run supabase/website-customers.sql).', 500);
    if (!row) throw new ServerError(`${WRONG} New here? Create an account.`, 401);
    if (row.status !== 'active') throw new ServerError('This account is disabled. Please contact us.', 403);
    if (row.locked_until && new Date(row.locked_until).getTime() > Date.now())
      throw new ServerError('Too many wrong attempts. Please wait 15 minutes and try again.', 429);

    if (!(await verifyPassword(password, row.password_hash))) {
      const failed = (row.failed_logins ?? 0) + 1;
      await db.from('prakruthi_website_customers').update({
        failed_logins: failed >= 5 ? 0 : failed,
        locked_until: failed >= 5 ? new Date(Date.now() + 15 * 60_000).toISOString() : null,
      }).eq('id', row.id);
      throw new ServerError(WRONG, 401);
    }

    await db.from('prakruthi_website_customers').update({ failed_logins: 0, locked_until: null, last_login_at: new Date().toISOString() }).eq('id', row.id);
    const res = NextResponse.json({ user: toPublic(row as Customer) });
    res.cookies.set(SESSION_COOKIE, createSessionToken(row.id), sessionCookieOptions);
    return res;
  } catch (e) { return errorResponse(e); }
}
