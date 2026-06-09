"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Copy, UserPlus } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Created {
  email: string;
  tempPassword: string;
}

/**
 * Dialog for inviting a student. Creates the account via the privileged
 * /api/students route, then reveals a one-time temporary password for the tutor
 * to share. The student sets their own password on first sign-in.
 */
export function AddStudentModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState<Created | null>(null);

  function close() {
    setCreated(null);
    setError("");
    onClose();
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setBusy(true);
    setError("");

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
      setError(error ?? "Failed to invite student.");
    }
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title="Add a student"
      description="We generate a temporary password — share it with the student, who chooses their own on first sign-in."
    >
      {created ? (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium text-foreground">
            Share this temporary password with {created.email}
          </p>
          <p className="text-sm text-muted-foreground">
            They sign in with their email and this password, then choose a new
            one. It won&rsquo;t be shown again.
          </p>
          <div className="flex items-center gap-2">
            <code className="tabular flex-1 rounded-xl bg-muted px-3 py-2.5 text-base text-foreground">
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
              <Copy /> Copy
            </Button>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" onClick={close}>
              Done
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="full_name">Full name</Label>
            <Input
              id="full_name"
              name="full_name"
              type="text"
              placeholder="e.g. Ada Lovelace"
              autoFocus
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              placeholder="student@example.com"
            />
          </div>

          {error && (
            <p
              className="rounded-xl border border-destructive/30 bg-destructive-muted px-3 py-2 text-sm text-destructive"
              role="alert"
            >
              {error}
            </p>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={close}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              <UserPlus /> {busy ? "Adding…" : "Add student"}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
