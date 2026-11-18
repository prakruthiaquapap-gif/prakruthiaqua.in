import { createClient } from '@supabase/supabase-js';
import { storeAuthOptions } from './supabase-auth-options';
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
export const adminSupabase = url && key ? createClient(url, key, { auth: storeAuthOptions(url, 'admin') }) : null;
