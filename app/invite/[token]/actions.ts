"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit } from "@/lib/rate-limit";

export interface AcceptInviteState {
  error?: string;
}

/**
 * Public: a student redeems an invite link. We validate the token against a
 * pending (not-yet-accepted) student_invites row, then CREATE the account at
 * this point with the email + password THEY chose. The handle_new_user trigger
 * makes the profile (role student); full_name comes from the invite. We then
 * sign them in (cookies set in this action) and send them to /student.
 *
 * Reads/writes invites with the service-role admin client (bypasses RLS), since
 * the visitor is unauthenticated. The token is the only authorisation here, so
 * it must stay single-use: we flip accepted_at the moment the account is made.
 */
export async function acceptInvite(
  _prev: AcceptInviteState,
  formData: FormData,
): Promise<AcceptInviteState> {
  const token = String(formData.get("token") ?? "");
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (!token) return { error: "This link is invalid." };
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return { error: "Enter a valid email address." };
  }
  if (password.length < 8) {
    return { error: "Use at least 8 characters for your password." };
  }
  if (password !== confirm) {
    return { error: "Those passwords don't match." };
  }

  // Throttle this public endpoint per IP before touching the auth backend.
  const { success, retryAfter } = await checkRateLimit("auth");
  if (!success) {
    return { error: `Too many attempts. Try again in ${retryAfter}s.` };
  }

  const admin = createAdminClient();

  // Single-use: only an unredeemed invite is valid.
  const { data: invite } = await admin
    .from("student_invites")
    .select("id, full_name, accepted_at")
    .eq("token", token)
    .is("accepted_at", null)
    .maybeSingle();

  if (!invite) {
    return { error: "This link is no longer valid. Ask your tutor for a new one." };
  }

  // email_confirm: true lets them sign in immediately. The handle_new_user()
  // trigger reads full_name from metadata and assigns the student role. No
  // must_change_password flag — they're choosing their real password now.
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: invite.full_name },
  });

  if (createErr || !created.user) {
    const msg = createErr?.message ?? "";
    return {
      error: /already|registered|exists/i.test(msg)
        ? "That email is already in use. Try signing in instead."
        : "Couldn't create your account. Please try again.",
    };
  }

  // Burn the invite so the link can't be reused.
  await admin
    .from("student_invites")
    .update({ accepted_at: new Date().toISOString(), accepted_user_id: created.user.id })
    .eq("id", invite.id);

  // Sign them in within the action so the session cookies are set, then go home.
  const supabase = await createClient();
  const { error: signInErr } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (signInErr) {
    // Account exists but auto sign-in failed — send them to log in manually.
    redirect("/login");
  }

  redirect("/student");
}
