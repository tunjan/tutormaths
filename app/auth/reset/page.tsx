import type { Metadata } from "next";
import Link from "next/link";
import { ResetForm } from "./reset-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Reset password — Maths Tasks",
  description: "Request a secure Maths Tasks password-reset link.",
};

export default function ResetPage() {
  return (
    <main
      id="main-content"
      className="auth-canvas flex min-h-dvh items-center justify-center px-4 py-8 sm:py-12"
    >
      <Card className="w-full max-w-md gap-6 p-6 shadow-sm sm:p-8">
        <CardHeader className="gap-2 text-center">
          <h1 className="text-h2">Forgot your password?</h1>
          <CardDescription>
            Enter your email and we&rsquo;ll send a link to set a new one.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <ResetForm />
          <Link
            href="/login"
            className="text-center text-label text-content-info underline-offset-4 transition-colors duration-fast hover:underline"
          >
            Back to sign in
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
