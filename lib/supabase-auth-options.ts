export function storeAuthOptions(projectUrl: string, audience: 'customer' | 'admin') {
  const project = new URL(projectUrl).hostname.split('.')[0];
  return {
    storageKey: `sb-${project}-prakruthi-${audience}-auth-v1`,
    persistSession: true,
    autoRefreshToken: true,
    // Customer email links must never be consumed by the admin client.
    detectSessionInUrl: audience === 'customer',
  };
}
