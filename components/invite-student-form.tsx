"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Created {
  email: string;
  tempPassword: string;
}

/** Invites a student via the privileged /api/students route handler. */
export function InviteStudentForm() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [globalError, setGlobalError] = useState("");
  const [created, setCreated] = useState<Created | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setBusy(true);
    setGlobalError("");

    const res = await fetch("/api/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: data.get("email"),
        full_name: data.get("full_name"),
      }),
    });

    setBusy(false);
    if (res.ok) {
      const { email, tempPassword } = await res.json();
      form.reset();
      setCreated({ email, tempPassword });
      toast.success("Student created.");
      router.refresh();
    } else {
      const { error } = await res.json().catch(() => ({ error: "Failed." }));
      setGlobalError(error ?? "Failed to invite student.");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {globalError && (
        <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
          {globalError}
        </div>
      )}
      <form
        onSubmit={onSubmit}
        className="flex flex-col gap-4 sm:flex-row sm:items-end"
      >
        <div className="flex flex-1 flex-col gap-2">
          <Label htmlFor="full_name">Name</Label>
          <Input id="full_name" name="full_name" type="text" placeholder="Ada Lovelace" />
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            placeholder="student@example.com"
          />
        </div>
        <Button type="submit" disabled={busy}>
          {busy ? "Creating…" : "Add student"}
        </Button>
      </form>

      {created && (
        <div className="flex flex-col gap-2 rounded-lg border border-border bg-surface p-4 text-sm">
          <p className="font-medium text-foreground">
            Share this temporary password with {created.email}
          </p>
          <p className="text-muted-foreground">
            They sign in with their email and this password, then choose a new
            one. It won&rsquo;t be shown again.
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded-md bg-muted px-3 py-2 font-mono text-base text-foreground">
              {created.tempPassword}
            </code>
            <Button
              type="button"
              variant="outline"
              onClick={async () => {
                await navigator.clipboard.writeText(created.tempPassword);
                toast.success("Password copied.");
              }}
            >
              Copy
            </Button>
            <Button type="button" variant="ghost" onClick={() => setCreated(null)}>
              Dismiss
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
