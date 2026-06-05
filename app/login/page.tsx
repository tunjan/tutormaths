import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm grid grid-cols-1 gap-12 bg-card p-8 border-2 border-foreground">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2 border-b-2 border-foreground pb-6">
            <h1 className="font-heading text-4xl font-black tracking-tighter uppercase">
              Sign in
            </h1>
            <p className="text-base text-muted-foreground font-medium">
              Enter your email and password to continue.
            </p>
          </div>
          <LoginForm />
        </div>
      </div>
    </main>
  );
}

