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
 * it must stay single-use: we CLAIM the invite atomically (UPDATE ... WHERE
 * accepted_at IS NULL) BEFORE creating the account, so two concurrent
 * redemptions can't both mint an account. If account creation then fails, we
 * release the claim so the link works again.
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

  // Claim the invite atomically: only an unredeemed row matches, and the first
  // writer flips accepted_at, so a concurrent redemption finds nothing to claim.
  // The DB — not request ordering — is what guarantees single use.
  const { data: invite } = await admin
    .from("student_invites")
    .update({ accepted_at: new Date().toISOString() })
    .eq("token", token)
    .is("accepted_at", null)
    .select("id, full_name")
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
    // Account creation failed — release the claim so the link works again.
    await admin
      .from("student_invites")
      .update({ accepted_at: null })
      .eq("id", invite.id);

    const msg = createErr?.message ?? "";
    return {
      error: /already|registered|exists/i.test(msg)
        ? "That email is already in use. Try signing in instead."
        : "Couldn't create your account. Please try again.",
    };
  }

  // Link the redeeming account to the (already-burned) invite for the record.
  await admin
    .from("student_invites")
    .update({ accepted_user_id: created.user.id })
    .eq("id", invite.id);

  const { error: promoteErr } = await admin.rpc("redeem_pending_assignments", {
    p_invite_id: invite.id,
    p_student_id: created.user.id,
  });
  if (promoteErr) {
    console.error("Failed to promote pending assignments", promoteErr);
    return { error: "Your account was created, but your assignments could not be linked. Please contact your tutor." };
  }

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
