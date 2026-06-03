import "server-only";
import { createClient } from "@/lib/supabase/server";

/**
 * Creates a short-lived signed URL for a private-bucket object, scoped by the
 * caller's session (RLS decides whether they may read it). Returns null on
 * failure so callers can render a graceful fallback.
 */
export async function signedUrl(
  bucket: string,
  path: string,
  expiresIn = 3600,
): Promise<string | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn);
  if (error || !data) return null;
  return data.signedUrl;
}
