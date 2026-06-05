import { LoginForm } from "./login-form";
import { LogoMark } from "@/components/logo";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-10 bg-surface px-4 py-16">
      <LogoMark className="size-12" />

      <Card className="w-full max-w-md gap-8 rounded-2xl py-10 shadow-sm">
        <CardHeader className="gap-2 px-10 text-center">
          <CardTitle className="text-xl font-medium">Sign in</CardTitle>
          <CardDescription>
            Sign in with your email and password.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-10">
          <LoginForm />
        </CardContent>
      </Card>
    </main>
  );
}
