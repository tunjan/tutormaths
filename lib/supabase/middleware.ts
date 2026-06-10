import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/lib/database.types";

/**
 * Refreshes the auth session cookie and performs OPTIMISTIC redirects only.
 * Called from proxy.ts. This is NOT an authorisation boundary — the binding
 * checks are Postgres RLS + the per-request server-side role check in
 * lib/auth.ts (re-run inside every protected Server Component / handler).
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  // "Keep me signed in" preference — when absent the session should end when
  // the browser closes (session-only cookies, no maxAge/expires).
  const rememberMe = request.cookies.get("remember_me")?.value === "1";

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            // When the user chose NOT to stay signed in, strip the persistence
            // attributes so the cookie becomes session-only and disappears when
            // the browser is closed.
            const finalOptions = rememberMe
              ? options
              : { ...options, maxAge: undefined, expires: undefined };
            supabaseResponse.cookies.set(name, value, finalOptions);
          });
        },
      },
    },
  );

  // IMPORTANT: do not run other code between creating the client and this call.
  // getClaims() refreshes the session and returns the verified JWT claims,
  // including the custom `user_role` claim injected by the access-token hook.
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;

  const path = request.nextUrl.pathname;
  // Public routes reachable without a session: login, the auth flows, and the
  // invite-acceptance page (where a student creates their account).
  const isPublicRoute =
    path === "/login" ||
    path.startsWith("/auth") ||
    path.startsWith("/invite");

  // Unauthenticated → bounce to /login (except on public routes themselves).
  if (!claims && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (claims) {
    const role = claims.user_role === "tutor" ? "tutor" : "student";
    const home = role === "tutor" ? "/tutor" : "/student";

    // Students created with a temporary password must choose a real one before
    // doing anything else. The flag lives in user_metadata (cleared on
    // set-password). Allow set-password itself and signing out.
    const mustChangePassword =
      (claims.user_metadata as { must_change_password?: boolean } | undefined)
        ?.must_change_password === true;
    if (
      mustChangePassword &&
      path !== "/auth/set-password" &&
      path !== "/auth/signout"
    ) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/set-password";
      url.search = "";
      return NextResponse.redirect(url);
    }

    // Already signed in but sitting on /login → send to their home.
    if (path === "/login") {
      const url = request.nextUrl.clone();
      url.pathname = home;
      return NextResponse.redirect(url);
    }

    // Best-effort role gating (RLS still enforces the real boundary).
    if (path.startsWith("/tutor") && role !== "tutor") {
      const url = request.nextUrl.clone();
      url.pathname = "/student";
      return NextResponse.redirect(url);
    }
    if (path.startsWith("/student") && role !== "student") {
      const url = request.nextUrl.clone();
      url.pathname = "/tutor";
      return NextResponse.redirect(url);
    }
  }

  // Always return supabaseResponse so refreshed cookies propagate.
  return supabaseResponse;
}
