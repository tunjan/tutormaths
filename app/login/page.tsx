import type { Metadata } from "next";
import { LoginForm } from "./login-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Sign in — Maths Tasks",
  description: "Sign in to your private maths workspace.",
};

export default function LoginPage() {
  return (
    <main
      id="main-content"
      className="auth-canvas flex min-h-dvh items-center justify-center px-4 py-8 sm:py-12"
    >
      <Card className="w-full max-w-md gap-6 p-6 shadow-sm sm:p-8">
        <CardHeader className="gap-2 text-center">
          <h1 className="text-h2">Sign in</h1>
          <CardDescription>
            Continue to your private maths workspace.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </main>
  );
}
