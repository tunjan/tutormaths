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
    <main className="flex min-h-dvh flex-col items-center justify-center gap-8 px-4 py-12">
      <div className="flex flex-col items-center gap-3 text-center">
        <Logo />
      </div>

      <Card className="w-full max-w-[420px]">
        <CardHeader className="text-center">
          <CardTitle className="text-h2">Set your password</CardTitle>
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
