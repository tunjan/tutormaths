"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signIn, type LoginState } from "./actions";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(signIn, initialState);

  return (
    <form action={formAction}>
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
          <div className="flex items-center justify-between gap-4">
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Link
              href="/auth/reset"
              className="text-caption text-content-info underline-offset-4 transition-colors duration-fast hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </Field>

        <Field orientation="horizontal">
          <Checkbox id="rememberMe" name="rememberMe" defaultChecked />
          <FieldLabel
            htmlFor="rememberMe"
            className="cursor-pointer font-normal text-muted-foreground"
          >
            Keep me signed in
          </FieldLabel>
        </Field>

        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Signing in…" : "Sign in"}
        </Button>

        {state.error && <FieldError className="text-center">{state.error}</FieldError>}
      </FieldGroup>
    </form>
  );
}
