import type { Metadata } from "next";
import { SetPasswordForm } from "./set-password-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Set password — Maths Tasks",
  description: "Choose the password for your Maths Tasks account.",
};

export default function SetPasswordPage() {
  return (
    <main
      id="main-content"
      className="auth-canvas flex min-h-dvh items-center justify-center px-4 py-8 sm:py-12"
    >
      <Card className="w-full max-w-md gap-6 p-6 shadow-sm sm:p-8">
        <CardHeader className="gap-2 text-center">
          <h1 className="text-h2">Set your password</h1>
          <CardDescription>
            You&rsquo;ll use this with your email to sign in from now on.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SetPasswordForm />
        </CardContent>
      </Card>
    </main>
  );
}
