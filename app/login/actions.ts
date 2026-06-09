"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";

export interface LoginState {
  error?: string;
}

/**
 * Email + password sign-in. Students set their own email + password when they
 * redeem an invite link (see app/invite/[token]); the tutor signs in with the
 * account they set up, resetting via "forgot password" if needed.
 */
export async function signIn(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Enter your email and password." };
  }

  // Throttle credential attempts per IP before hitting the auth backend.
  const { success, retryAfter } = await checkRateLimit("auth");
  if (!success) {
    return {
      error: `Too many sign-in attempts. Try again in ${retryAfter}s.`,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "Incorrect email or password." };
  }

  // "/" routes to the correct role home.
  redirect("/");
}
