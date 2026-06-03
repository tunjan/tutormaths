"use server";

import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/site-url";

export interface LoginState {
  status: "idle" | "sent" | "error";
  message?: string;
}

/**
 * Passwordless sign-in. Sends a magic link to an EXISTING user only
 * (`shouldCreateUser: false`) — there is no public sign-up; students are
 * onboarded by the tutor via invite, and the tutor account is created in the
 * Supabase dashboard. We never hold anyone's password.
 */
export async function sendMagicLink(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return { status: "error", message: "Enter a valid email address." };
  }

  const siteUrl = getSiteUrl();
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false,
      emailRedirectTo: `${siteUrl}/auth/confirm`,
    },
  });

  if (error) {
    // Don't leak whether the email exists — show a neutral message either way.
    return {
      status: "sent",
      message: "If that email has an account, a sign-in link is on its way.",
    };
  }

  return {
    status: "sent",
    message: "Check your inbox for a sign-in link.",
  };
}
