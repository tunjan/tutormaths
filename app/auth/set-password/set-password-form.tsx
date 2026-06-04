"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SetPasswordForm() {
  const [supabase] = useState(() => createClient());
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const data = new FormData(e.currentTarget);
    const password = String(data.get("password") ?? "");
    const confirm = String(data.get("confirm") ?? "");

    if (password.length < 8) {
      setError("Use at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Those passwords don't match.");
      return;
    }

    setPending(true);
    // Clearing must_change_password drops the proxy's set-password redirect.
    const { error: updErr } = await supabase.auth.updateUser({
      password,
      data: { must_change_password: false },
    });
    if (updErr) {
      setError(
        /session/i.test(updErr.message)
          ? "This link has expired. Ask your tutor to re-send your invite, or use “Forgot password”."
          : updErr.message,
      );
      setPending(false);
      return;
    }

    // updateUser doesn't reissue the access token, so the JWT still carries the
    // old metadata. Refresh it before navigating, or the proxy bounces us back.
    await supabase.auth.refreshSession();

    toast.success("Password set — you're signed in.");
    router.push("/");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2.5">
        <Label htmlFor="password">New password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          className="h-11 rounded-lg px-3.5 text-base md:text-base"
        />
      </div>
      <div className="flex flex-col gap-2.5">
        <Label htmlFor="confirm">Confirm password</Label>
        <Input
          id="confirm"
          name="confirm"
          type="password"
          autoComplete="new-password"
          required
          className="h-11 rounded-lg px-3.5 text-base md:text-base"
        />
      </div>
      <Button type="submit" disabled={pending} className="h-11 w-full text-base">
        {pending ? "Saving…" : "Set password"}
      </Button>
      {error && (
        <p className="text-center text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
