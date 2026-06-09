import { Logo } from "@/components/logo";
import { SetPasswordForm } from "./set-password-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function SetPasswordPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-8 px-4 py-16">
      <div className="flex flex-col items-center gap-3 text-center">
        <Logo />
        <p className="text-sm text-muted-foreground">
          Choose a password for your account
        </p>
      </div>

      <Card className="w-full max-w-md gap-8 rounded-2xl py-10">
        <CardHeader className="gap-2 px-10 text-center">
          <CardTitle className="text-xl font-medium">Set your password</CardTitle>
          <CardDescription>
            You&rsquo;ll use this with your email to sign in from now on.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-10">
          <SetPasswordForm />
        </CardContent>
      </Card>
    </main>
  );
}
