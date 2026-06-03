import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Verifies an email link (invite, password recovery, or magic link) arriving as
 * `token_hash` + `type`, or a PKCE `code`. On success the session cookie is set.
 * Invite and recovery links route to /auth/set-password so the user can choose
 * a password; everything else goes to `next` (default home).
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");

  const fallbackNext =
    type === "invite" || type === "recovery" ? "/auth/set-password" : "/";
  const next = searchParams.get("next") ?? fallbackNext;

  const supabase = await createClient();

  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) return NextResponse.redirect(new URL(next, request.url));
  }

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(next, request.url));
  }

  return NextResponse.redirect(new URL("/login?error=link", request.url));
}
