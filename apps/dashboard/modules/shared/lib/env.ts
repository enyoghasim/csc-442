// Mirrors apps/mobile's modules/shared/lib/env.ts — fail loudly at import time rather than let a
// missing env var surface as a confusing runtime network error later.
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

if (!apiUrl) {
  throw new Error('NEXT_PUBLIC_API_URL is not set — check your apps/dashboard/.env');
}

export const env = {
  NEXT_PUBLIC_API_URL: apiUrl,
};
