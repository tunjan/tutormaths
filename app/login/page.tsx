import { Logo } from "@/components/logo";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-6 py-12 selection:bg-muted selection:text-foreground">
      <div className="w-full max-w-[380px]">
        <div className="mb-8 flex flex-col items-center gap-6 text-center">
          <Logo />
          <div className="flex flex-col gap-2">
            <h1 className="text-[32px] font-medium leading-tight tracking-tight text-foreground">
              Sign in to your instance
            </h1>
            <p className="text-[15px] text-secondary-foreground">
              Enter your credentials to access the engine.
            </p>
          </div>
        </div>
        <div className="border border-border bg-card p-8">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
