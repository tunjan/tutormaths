import Link from "next/link";
import { Logo } from "@/components/logo";
import { createAdminClient } from "@/lib/supabase/admin";
import { AcceptInviteForm } from "./accept-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/**
 * Public landing for an invite link. Looks the token up with the admin client.
 */
export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const admin = createAdminClient();
  const { data: invite } = await admin
    .from("student_invites")
    .select("full_name, accepted_at")
    .eq("token", token)
    .maybeSingle();

  const valid = invite && !invite.accepted_at;
  const firstName = invite?.full_name?.trim().split(/\s+/)[0] ?? "";

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-8 px-4 py-12">
      <div className="flex flex-col items-center gap-3 text-center">
        <Logo />
      </div>

      <Card className="w-full max-w-[420px] gap-6">
        {valid ? (
          <>
            <CardHeader className="text-center">
              <CardTitle className="text-h2">
                {firstName ? `Welcome, ${firstName}` : "Welcome"}
              </CardTitle>
              <CardDescription>
                Choose your email and a password to finish setting up your
                account.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AcceptInviteForm token={token} />
            </CardContent>
          </>
        ) : (
          <>
            <CardHeader className="text-center">
              <CardTitle className="text-h2 text-content-error">
                This link is no longer valid
              </CardTitle>
              <CardDescription>
                It may have already been used or been cancelled. Ask your tutor
                to send you a new invite link.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link
                href="/login"
                className="text-label text-content-info underline underline-offset-4"
              >
                Go to sign in
              </Link>
            </CardContent>
          </>
        )}
      </Card>
    </main>
  );
}
