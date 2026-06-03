import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Next.js 16 network boundary. The exported function MUST be named `proxy`.
 * Runs on the Node.js runtime. Performs OPTIMISTIC auth/role redirects only;
 * never treat it as an authorisation gate (cf. CVE-2025-29927). Real
 * authorisation = Postgres RLS + the per-request check in lib/auth.ts.
 */
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Run on all routes except static assets and image optimisation files.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
