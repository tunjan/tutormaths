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
    <main id="main-content" className="auth-canvas flex min-h-dvh items-center justify-center px-4 py-12">
      <Card className="w-full max-w-[480px]">
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
