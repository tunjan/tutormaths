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
    <main id="main-content" className="auth-canvas flex min-h-dvh items-center justify-center px-4 py-12">
      <Card className="w-full max-w-[480px]">
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
