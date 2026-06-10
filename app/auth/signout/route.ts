import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** Signs the current user out and returns them to /login. POST only. */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  const response = NextResponse.redirect(new URL("/login", request.url), {
    status: 303,
  });
  // Clear the "keep me signed in" preference so next login starts fresh.
  response.cookies.delete("remember_me");
  return response;
}
