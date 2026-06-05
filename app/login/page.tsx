import { LoginForm } from "./login-form";
import { Logo } from "@/components/logo";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-12 bg-surface px-4 py-16">
      <Logo />

      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col gap-2 border-b border-border pb-6">
          <h1 className="font-heading text-3xl font-semibold tracking-tight">
            Sign in
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your email and password to continue.
          </p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
