import { Logo } from "@/components/logo";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-6 py-12 selection:bg-muted selection:text-foreground">
      <div className="w-full max-w-[380px]">
        <div className="mb-8 flex flex-col items-center gap-5 text-center">
          <Logo />
          <div className="flex flex-col gap-2">
            <h1 className="text-h2 font-semibold tracking-tight text-foreground">
              Sign in
            </h1>
          </div>
        </div>
        <div className="card shadow-[var(--shadow-md)] p-8 rounded-[12px] bg-card border border-border">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
