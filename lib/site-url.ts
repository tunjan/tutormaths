import "server-only";

/**
 * Resolves the canonical site origin (no trailing slash) for building auth
 * redirect URLs server-side. Precedence:
 *   1. NEXT_PUBLIC_SITE_URL — set this to your canonical production domain.
 *   2. VERCEL_PROJECT_PRODUCTION_URL — stable production domain on Vercel.
 *   3. VERCEL_URL — the current (per-deployment) URL, e.g. previews.
 *   4. localhost for local dev.
 *
 * Whatever this returns for a given environment must be listed in Supabase
 * Auth → URL Configuration → Redirect URLs (use a wildcard for previews).
 */
export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");

  const prod = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (prod) return `https://${prod}`;

  const current = process.env.VERCEL_URL;
  if (current) return `https://${current}`;

  return "http://localhost:3000";
}
