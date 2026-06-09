import Link from "next/link";
import { Logo } from "@/components/logo";
import { ResetForm } from "./reset-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ResetPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-8 px-4 py-16">
      <div className="flex flex-col items-center gap-3 text-center">
        <Logo />
        <p className="text-sm text-muted-foreground">Reset your password</p>
      </div>

      <Card className="w-full max-w-md gap-8 rounded-2xl py-10">
        <CardHeader className="gap-2 px-10 text-center">
          <CardTitle className="text-xl font-medium">
            Forgot your password?
          </CardTitle>
          <CardDescription>
            Enter your email and we&rsquo;ll send a link to set a new one.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 px-10">
          <ResetForm />
          <Link
            href="/login"
            className="text-center text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Back to sign in
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
