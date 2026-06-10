"use server";

import { cookies } from "next/headers";
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
  const rememberMe = formData.get("rememberMe") === "on";

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

  // Persist the "keep me signed in" preference as a cookie so the middleware
  // can decide whether to make auth cookies session-only or persistent.
  const cookieStore = await cookies();
  if (rememberMe) {
    cookieStore.set("remember_me", "1", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });
  } else {
    // Delete any previous persistent preference — session will end on browser close.
    cookieStore.delete("remember_me");
  }

  // "/" routes to the correct role home.
  redirect("/");
}
