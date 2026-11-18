// Server-only website customer accounts: password hashing + signed session cookie.
// Customers live in public.prakruthi_website_customers (separate from Supabase Auth / dealer logins).
import { createHmac, randomBytes, scrypt as scryptCb, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { adminDb, ServerError } from './server-db';

const scrypt = promisify(scryptCb) as (password: string, salt: Buffer, keylen: number) => Promise<Buffer>;
export const SESSION_COOKIE = 'pa_customer';
const SESSION_DAYS = 30;

export type Customer = { id: string; full_name: string; email: string; phone: string; status: string };
export type PublicCustomer = { id: string; name: string; email: string; phone: string };
export const toPublic = (c: Customer): PublicCustomer => ({ id: c.id, name: c.full_name, email: c.email, phone: c.phone });

// ---------- Passwords (scrypt, per-user salt) ----------
export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const hash = await scrypt(password, salt, 64);
  return `scrypt$${salt.toString('base64')}$${hash.toString('base64')}`;
}
export async function verifyPassword(password: string, stored: string) {
  const [scheme, saltB64, hashB64] = stored.split('$');
  if (scheme !== 'scrypt' || !saltB64 || !hashB64) return false;
  const expected = Buffer.from(hashB64, 'base64');
  const actual = await scrypt(password, Buffer.from(saltB64, 'base64'), expected.length);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

// ---------- Session cookie (HMAC-signed, httpOnly) ----------
function sessionSecret() {
  const explicit = process.env.CUSTOMER_SESSION_SECRET;
  if (explicit) return explicit;
  const base = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!base) throw new ServerError('The website server is not configured yet (SUPABASE_SERVICE_ROLE_KEY missing).', 503);
  return createHmac('sha256', base).update('prakruthi-customer-session-v1').digest('hex');
}
const b64url = (s: string) => Buffer.from(s).toString('base64url');
const sign = (data: string) => createHmac('sha256', sessionSecret()).update(data).digest('base64url');

export function createSessionToken(customerId: string) {
  const payload = b64url(JSON.stringify({ sub: customerId, exp: Date.now() + SESSION_DAYS * 864e5 }));
  return `${payload}.${sign(payload)}`;
}
export const sessionCookieOptions = {
  httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' as const, path: '/', maxAge: SESSION_DAYS * 86400,
};

export function sessionCustomerId(req: Request): string | null {
  const cookie = req.headers.get('cookie') ?? '';
  const raw = cookie.split(/;\s*/).find((c) => c.startsWith(`${SESSION_COOKIE}=`))?.slice(SESSION_COOKIE.length + 1);
  if (!raw) return null;
  const [payload, sig] = decodeURIComponent(raw).split('.');
  if (!payload || !sig) return null;
  const expected = sign(payload);
  if (expected.length !== sig.length || !timingSafeEqual(Buffer.from(expected), Buffer.from(sig))) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
    return typeof data.sub === 'string' && data.exp > Date.now() ? data.sub : null;
  } catch { return null; }
}

export async function findCustomerById(id: string): Promise<Customer | null> {
  const { data, error } = await adminDb().from('prakruthi_website_customers').select('id, full_name, email, phone, status').eq('id', id).maybeSingle();
  if (error) throw new ServerError('Customer accounts need the latest database update (run supabase/website-customers.sql).', 500);
  return data && data.status === 'active' ? (data as Customer) : null;
}

export async function requireCustomer(req: Request): Promise<Customer> {
  const id = sessionCustomerId(req);
  const customer = id ? await findCustomerById(id) : null;
  if (!customer) throw new ServerError('Please sign in to continue.', 401);
  return customer;
}

export const normaliseEmail = (e: unknown) => String(e ?? '').trim().toLowerCase();
export const validEmail = (e: string) => e.length >= 3 && e.length <= 200 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
