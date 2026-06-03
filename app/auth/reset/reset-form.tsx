"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ResetForm() {
  const [supabase] = useState(() => createClient());
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const email = String(data.get("email") ?? "")
      .trim()
      .toLowerCase();
    if (!email) return;

    setPending(true);
    // The recovery link lands on /auth/confirm, which routes recovery → set-password.
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/confirm?next=/auth/set-password`,
    });
    // Neutral result either way — don't reveal whether the email exists.
    setPending(false);
    setSent(true);
  }

  if (sent) {
    return (
      <p className="text-center text-sm text-muted-foreground">
        If that email has an account, a password-reset link is on its way.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
          className="h-11 rounded-lg px-3.5 text-base md:text-base"
        />
      </div>
      <Button type="submit" disabled={pending} className="h-11 w-full text-base">
        {pending ? "Sending…" : "Send reset link"}
      </Button>
    </form>
  );
}
