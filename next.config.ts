import type { NextConfig } from 'next';
// Server mode (not static export) so /api/razorpay can run on Vercel with secret env vars.
const config: NextConfig = { images: { unoptimized: true }, trailingSlash: true };
export default config;
