import { randomBytes } from "node:crypto";
import { type NextRequest, NextResponse } from "next/server";
import { getAuthContext } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";

/**
 * Tutor-only: create a pending student invite from just a NAME. We mint a
 * single-use bearer token and store it in student_invites; no auth account
 * exists yet. The token is returned so the client can build the shareable
 * link (`/invite/<token>`); the student supplies their own email + password
 * when they open it (see app/invite/[token]/actions.ts).
 *
 * We re-check the tutor role per request (never trust the proxy) and insert via
 * the tutor's own RLS-checked session — no service-role needed here.
 */
export async function POST(request: NextRequest) {
  const ctx = await getAuthContext();
  if (!ctx || ctx.role !== "tutor") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Per-tutor throttle on invite creation, keyed by user id.
  const { success, retryAfter } = await checkRateLimit("api", ctx.userId);
  if (!success) {
    return NextResponse.json(
      { error: "Too many requests. Slow down." },
      { status: 429, headers: { "Retry-After": String(retryAfter) } },
    );
  }

  let payload: { full_name?: string };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const fullName = String(payload.full_name ?? "").trim();
  if (!fullName) {
    return NextResponse.json(
      { error: "A name is required." },
      { status: 400 },
    );
  }

  // 24 random bytes → 32-char base64url; high-entropy, URL-safe bearer token.
  const token = randomBytes(24).toString("base64url");

  const supabase = await createClient();
  const { error } = await supabase.from("student_invites").insert({
    token,
    full_name: fullName,
    created_by: ctx.userId,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ token, full_name: fullName });
}
