import { randomBytes } from "node:crypto";
import { type NextRequest, NextResponse } from "next/server";
import { getAuthContext } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit } from "@/lib/rate-limit";

/**
 * Privileged: create a student account with an auto-generated temporary
 * password. The password is returned ONCE in the response so the tutor can
 * share it with the student; we never store it ourselves. The account is
 * flagged `must_change_password`, so the student is forced through
 * /auth/set-password on first sign-in (see proxy.ts).
 *
 * Uses the service-role key, so it MUST stay server-side. We re-check the tutor
 * role per request (never trust the proxy), then call the admin API.
 */
export async function POST(request: NextRequest) {
  const ctx = await getAuthContext();
  if (!ctx || ctx.role !== "tutor") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Per-tutor throttle on account creation (admin API calls are expensive and
  // send email). Keyed by user id so it can't be sidestepped by changing IP.
  const { success, retryAfter } = await checkRateLimit("api", ctx.userId);
  if (!success) {
    return NextResponse.json(
      { error: "Too many requests. Slow down." },
      { status: 429, headers: { "Retry-After": String(retryAfter) } },
    );
  }

  let payload: { email?: string; full_name?: string };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const email = String(payload.email ?? "").trim().toLowerCase();
  const fullName = String(payload.full_name ?? "").trim();

  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json(
      { error: "A valid email is required." },
      { status: 400 },
    );
  }

  const tempPassword = generateTempPassword();
  const admin = createAdminClient();

  // email_confirm: true lets the student sign in immediately (no confirmation
  // round-trip). The handle_new_user() trigger reads full_name from this
  // metadata and assigns the student role.
  const { error } = await admin.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: { full_name: fullName, must_change_password: true },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, email, tempPassword });
}

/**
 * A short, URL-safe temporary password. 12 chars of base64url easily clears
 * Supabase's policy and the 8-char minimum the student sees on set-password.
 */
function generateTempPassword(): string {
  return randomBytes(9).toString("base64url");
}
