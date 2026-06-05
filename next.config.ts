import type { NextConfig } from "next";

/**
 * Supabase origin (e.g. https://xxxx.supabase.co). The browser talks to it for
 * REST + Storage over https and for Realtime over a wss WebSocket, so both
 * schemes must be allow-listed in connect-src or the app breaks under CSP.
 * Read at build time; on Vercel the real value is present, in CI it may be a
 * placeholder (harmless — the header is only enforced where the app actually
 * runs against that origin).
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseOrigin = supabaseUrl ? new URL(supabaseUrl).origin : "";
const supabaseWs = supabaseOrigin.replace(/^https:/, "wss:");

const isProd = process.env.NODE_ENV === "production";

/**
 * Content-Security-Policy. `script-src` keeps 'unsafe-inline' because Next.js
 * injects inline bootstrap/hydration scripts and this app does not yet wire up
 * a per-request nonce; that's the one remaining hardening step (nonce +
 * 'strict-dynamic' via the proxy). Everything else is locked to 'self' plus the
 * Supabase origin. 'unsafe-eval' is dev-only (React Refresh / Turbopack need it).
 */
const csp = [
  `default-src 'self'`,
  `script-src 'self' 'unsafe-inline'${isProd ? "" : " 'unsafe-eval'"}`,
  `style-src 'self' 'unsafe-inline'`,
  `img-src 'self' data: blob: ${supabaseOrigin}`.trim(),
  `font-src 'self' data:`,
  `connect-src 'self' ${supabaseOrigin} ${supabaseWs}`.trim(),
  `frame-ancestors 'none'`,
  `base-uri 'self'`,
  `form-action 'self'`,
  `object-src 'none'`,
  `worker-src 'self' blob:`,
  ...(isProd ? [`upgrade-insecure-requests`] : []),
]
  .filter(Boolean)
  .join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  // Enforce HTTPS for two years, including subdomains. Vercel terminates TLS,
  // so this is safe in production; harmless on localhost (browsers ignore HSTS
  // on http origins).
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  { key: "X-DNS-Prefetch-Control", value: "off" },
];

const nextConfig: NextConfig = {
  // proxy.ts (the network boundary) runs on the Node.js runtime by default in
  // Next.js 16, which is required for the Supabase server client.
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
