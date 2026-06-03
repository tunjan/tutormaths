import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type Role = "tutor" | "student";

export interface AuthContext {
  userId: string;
  email: string | null;
  role: Role;
}

/**
 * The per-request server-side session + role check. Call this inside EVERY
 * protected Server Component, Route Handler, and Server Action that touches
 * protected data — never trust the proxy's optimistic decision.
 *
 * Uses getClaims(), which verifies the JWT signature and returns the custom
 * `user_role` claim injected by the access-token hook (no table lookup, no
 * recursion). Returns null when there is no valid session.
 */
export async function getAuthContext(): Promise<AuthContext | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  const claims = data?.claims;
  if (error || !claims) return null;

  const role: Role = claims.user_role === "tutor" ? "tutor" : "student";

  return {
    userId: claims.sub as string,
    email: (claims.email as string | undefined) ?? null,
    role,
  };
}

/** Require any authenticated user; redirect to /login otherwise. */
export async function requireUser(): Promise<AuthContext> {
  const ctx = await getAuthContext();
  if (!ctx) redirect("/login");
  return ctx;
}

/** Require the tutor; non-tutors are bounced to the student home. */
export async function requireTutor(): Promise<AuthContext> {
  const ctx = await requireUser();
  if (ctx.role !== "tutor") redirect("/student");
  return ctx;
}

/** Require a student; the tutor is bounced to the tutor home. */
export async function requireStudent(): Promise<AuthContext> {
  const ctx = await requireUser();
  if (ctx.role !== "student") redirect("/tutor");
  return ctx;
}
