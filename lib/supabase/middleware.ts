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
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
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
  const isAuthRoute = path === "/login" || path.startsWith("/auth");

  // Unauthenticated → bounce to /login (except on auth routes themselves).
  if (!claims && !isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (claims) {
    const role = claims.user_role === "tutor" ? "tutor" : "student";
    const home = role === "tutor" ? "/tutor" : "/student";

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
