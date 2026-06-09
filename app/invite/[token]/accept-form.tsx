"use client";

import { useActionState } from "react";
import { Mail } from "lucide-react";
import { acceptInvite, type AcceptInviteState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: AcceptInviteState = {};

/**
 * The student-facing form behind an invite link. They set their own email +
 * password; submitting calls acceptInvite, which creates the account and signs
 * them in. The email notice is deliberate — notifications are sent by email.
 */
export function AcceptInviteForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState(acceptInvite, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="token" value={token} />

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

      <div className="flex flex-col gap-2.5">
        <Label htmlFor="password">Create a password</Label>
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

      <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/50 px-3.5 py-3 text-sm text-muted-foreground">
        <Mail className="mt-0.5 size-4 shrink-0 text-foreground" />
        <p>
          We&rsquo;ll email you when your tutor sets homework, leaves a comment,
          or a due date is near. Please use an address you check regularly so you
          don&rsquo;t miss anything.
        </p>
      </div>

      <Button type="submit" disabled={pending} className="h-11 w-full text-base">
        {pending ? "Creating your account…" : "Create account"}
      </Button>

      {state.error && (
        <p className="text-center text-sm text-destructive" role="alert">
          {state.error}
        </p>
      )}
    </form>
  );
}
