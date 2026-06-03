"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/** Invites a student via the privileged /api/students route handler. */
export function InviteStudentForm() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setBusy(true);

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
      form.reset();
      toast.success("Invitation sent.");
      router.refresh();
    } else {
      const { error } = await res.json().catch(() => ({ error: "Failed." }));
      toast.error(error ?? "Failed to invite student.");
    }
  }

  return (
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
        {busy ? "Inviting…" : "Invite student"}
      </Button>
    </form>
  );
}
