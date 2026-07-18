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
    <main className="flex min-h-dvh flex-col items-center justify-center gap-8 px-4 py-12">
      <div className="flex flex-col items-center gap-3 text-center">
        <Logo />
      </div>

      <Card className="w-full max-w-[420px]">
        <CardHeader className="text-center">
          <CardTitle className="text-h2">
            Forgot your password?
          </CardTitle>
          <CardDescription>
            Enter your email and we&rsquo;ll send a link to set a new one.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <ResetForm />
          <Link
            href="/login"
            className="text-center text-label text-content-info underline-offset-4 transition-colors duration-fast hover:underline"
          >
            Back to sign in
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
