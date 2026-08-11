import { LoginForm } from "./login-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function LoginPage() {
  return (
    <main id="main-content" className="auth-canvas flex min-h-dvh items-center justify-center px-4 py-12">
      <Card className="w-full max-w-[480px]">
        <CardHeader className="text-center">
          <CardTitle className="text-h2">Sign in</CardTitle>
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
