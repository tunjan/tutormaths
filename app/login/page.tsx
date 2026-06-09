import { Logo } from "@/components/logo";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-7 flex flex-col items-center gap-4 text-center">
          <Logo />
          <div className="flex flex-col gap-1.5">
            <h1 className="text-3xl">Sign in</h1>
            <p className="text-sm text-muted-foreground">
              Enter your email and password to continue.
            </p>
          </div>
        </div>
        <div className="surface-card p-7">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
