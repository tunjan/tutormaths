import "server-only";
import { headers } from "next/headers";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Distributed rate limiting backed by Upstash Redis. Serverless functions don't
 * share memory across instances, so an in-process counter wouldn't actually
 * limit anything on Vercel — the counter has to live in a shared store.
 *
 * GRACEFUL DEGRADATION: if the Upstash env vars are unset (e.g. local dev, or
 * before the integration is provisioned), limiting is DISABLED and every call
 * is allowed, so the app still runs. In production we warn once at module load
 * so a missing integration is visible in the logs rather than silently open.
 *
 * Provision via Vercel Marketplace → Upstash (or set the vars by hand):
 *   UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN
 */
const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

const redis = url && token ? new Redis({ url, token }) : null;

if (!redis && process.env.NODE_ENV === "production") {
  console.warn(
    "[rate-limit] UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN are not " +
      "set — rate limiting is DISABLED. Provision Upstash to enable it.",
  );
}

/** Named limit policies. Tune the windows here in one place. */
const policies = {
  // Sign-in / credential endpoints: brute-force protection, keyed by IP.
  auth: { limit: 5, window: "60 s" as const, prefix: "rl:auth" },
  // Privileged API (student creation): keyed by tutor user id.
  api: { limit: 20, window: "60 s" as const, prefix: "rl:api" },
} satisfies Record<
  string,
  { limit: number; window: `${number} s`; prefix: string }
>;

export type RateLimitPolicy = keyof typeof policies;

const limiters: Partial<Record<RateLimitPolicy, Ratelimit>> = {};

function limiterFor(name: RateLimitPolicy): Ratelimit | null {
  if (!redis) return null;
  if (!limiters[name]) {
    const p = policies[name];
    limiters[name] = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(p.limit, p.window),
      prefix: p.prefix,
      analytics: false,
    });
  }
  return limiters[name]!;
}

/**
 * Best-effort client IP from the proxy headers. Vercel sets both; we take the
 * first hop of x-forwarded-for. Falls back to a constant so a missing header
 * doesn't accidentally bypass per-IP limits by spreading across null keys.
 */
export async function getClientIp(): Promise<string> {
  const h = await headers();
  const fwd = h.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return h.get("x-real-ip") ?? "unknown";
}

export interface RateLimitResult {
  success: boolean;
  /** Seconds until the window resets (for a Retry-After hint). */
  retryAfter: number;
}

/**
 * Check (and consume) one unit against a named policy. `identifier` should be
 * an IP for auth flows or a user id for per-user limits; omit it to key by the
 * caller's IP. When limiting is disabled, always succeeds.
 */
export async function checkRateLimit(
  name: RateLimitPolicy,
  identifier?: string,
): Promise<RateLimitResult> {
  const limiter = limiterFor(name);
  if (!limiter) return { success: true, retryAfter: 0 };

  const id = identifier ?? (await getClientIp());
  const { success, reset } = await limiter.limit(`${name}:${id}`);
  return {
    success,
    retryAfter: Math.max(0, Math.ceil((reset - Date.now()) / 1000)),
  };
}
