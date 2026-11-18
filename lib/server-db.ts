// Server-only Supabase client using the service role key. Never import from client components.
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export class ServerError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}

let client: SupabaseClient | null = null;
export function adminDb(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!url || !serviceKey) throw new ServerError('The website server is not configured yet (SUPABASE_SERVICE_ROLE_KEY missing).', 503);
  client ??= createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  return client;
}

export function errorResponse(e: unknown) {
  const known = e instanceof ServerError;
  if (!known) console.error('server error', e);
  return Response.json({ error: known ? e.message : 'Something went wrong. Please try again.' }, { status: known ? e.status : 500 });
}
