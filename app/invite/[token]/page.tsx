import type { Metadata } from "next";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { AcceptInviteForm } from "./accept-form";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Accept invitation — Maths Tasks",
  description: "Finish setting up your private Maths Tasks workspace.",
};

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
    <main
      id="main-content"
      className="auth-canvas flex min-h-dvh items-center justify-center px-4 py-8 sm:py-12"
    >
      <Card className="w-full max-w-md gap-6 p-6 shadow-sm sm:p-8">
        {valid ? (
          <>
            <CardHeader className="gap-2 text-center">
              <h1 className="text-h2">
                {firstName ? `Welcome, ${firstName}` : "Welcome"}
              </h1>
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
            <CardHeader className="gap-2 text-center">
              <h1 className="text-h2 text-content-error">
                This link is no longer valid
              </h1>
              <CardDescription>
                It may have already been used or been cancelled. Ask your tutor
                to send you a new invite link.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link
                href="/login"
                className={buttonVariants()}
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
