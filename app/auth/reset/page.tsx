import Link from "next/link";
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
    <main className="flex min-h-screen flex-col items-center justify-center gap-10 bg-surface px-4 py-16">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Maths Tasks
        </h1>
        <p className="text-sm text-muted-foreground">Reset your password</p>
      </div>

      <Card className="w-full max-w-md gap-8 rounded-2xl py-10 shadow-sm">
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
