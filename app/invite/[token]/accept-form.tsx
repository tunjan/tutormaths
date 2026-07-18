"use client";

import { useActionState } from "react";
import { Mail } from "lucide-react";
import { acceptInvite, type AcceptInviteState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert";

const initialState: AcceptInviteState = {};

/**
 * The student-facing form behind an invite link. They set their own email +
 * password; submitting calls acceptInvite, which creates the account and signs
 * them in. The email notice is deliberate — notifications are sent by email.
 */
export function AcceptInviteForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState(acceptInvite, initialState);

  return (
    <form action={formAction}>
      <input type="hidden" name="token" value={token} />

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

        <Field>
          <FieldLabel htmlFor="password">Create a password</FieldLabel>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="confirm">Confirm password</FieldLabel>
          <Input
            id="confirm"
            name="confirm"
            type="password"
            autoComplete="new-password"
            required
          />
        </Field>

        <Alert variant="info">
          <Mail aria-hidden />
          <AlertDescription>
            We&rsquo;ll email you when your tutor sets homework, leaves a comment,
            or a due date is near. Please use an address you check regularly so you
            don&rsquo;t miss anything.
          </AlertDescription>
        </Alert>

        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Creating your account…" : "Create account"}
        </Button>

        {state.error && <FieldError className="text-center">{state.error}</FieldError>}
      </FieldGroup>
    </form>
  );
}
