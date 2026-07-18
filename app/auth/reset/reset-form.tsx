"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";

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
      <p className="text-center text-body text-muted-foreground">
        If that email has an account, a password-reset link is on its way.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
          />
        </Field>
        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Sending…" : "Send reset link"}
        </Button>
      </FieldGroup>
    </form>
  );
}
