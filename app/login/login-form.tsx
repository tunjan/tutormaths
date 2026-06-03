"use client";

import { useActionState } from "react";
import { sendMagicLink, type LoginState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: LoginState = { status: "idle" };

export function LoginForm() {
  const [state, formAction, pending] = useActionState(
    sendMagicLink,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <div className="flex flex-col gap-2.5">
        <Label htmlFor="email" className="text-sm font-medium">
          Email
        </Label>
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

      <Button
        type="submit"
        disabled={pending || state.status === "sent"}
        className="h-11 w-full text-base"
      >
        {pending ? "Sending…" : "Send sign-in link"}
      </Button>

      {state.message && (
        <p
          className={`text-center text-sm ${
            state.status === "error"
              ? "text-destructive"
              : "text-muted-foreground"
          }`}
          role="status"
        >
          {state.message}
        </p>
      )}
    </form>
  );
}
