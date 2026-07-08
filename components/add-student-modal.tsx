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
  fullName: string;
  link: string;
}

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

    const res = await fetch("/api/invites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ full_name: data.get("full_name") }),
    });

    setBusy(false);
    if (res.ok) {
      const { token, full_name } = await res.json();
      form.reset();
      setCreated({
        fullName: full_name,
        link: `${window.location.origin}/invite/${token}`,
      });
      toast.success("Invite link ready.");
      router.refresh();
    } else {
      const { error } = await res.json().catch(() => ({ error: "Failed." }));
      setError(error ?? "Failed to create the invite.");
    }
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title="Add a student"
      description="Enter their name and we'll generate a link to share — they set their own email and password."
    >
      {created ? (
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold text-foreground">
            Share this link with {created.fullName}
          </p>
          <p className="text-sm text-content-subtle">
            When they open it, they&rsquo;ll choose their email and a password.
            You can copy it again later from the students list.
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 truncate rounded-md border border-border-subtle bg-bg-muted px-3 py-2.5 text-sm text-foreground">
              {created.link}
            </code>
            <Button
              type="button"
              variant="outline"
              onClick={async () => {
                await navigator.clipboard.writeText(created.link);
                toast.success("Link copied.");
              }}
            >
              <Copy className="size-4" /> Copy
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
              required
              placeholder="e.g. Ada Lovelace"
              autoFocus
            />
          </div>

          {error && (
            <p
              className="rounded-md border border-content-error/20 bg-bg-error px-3 py-2 text-sm text-content-error"
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
              <UserPlus className="size-4" /> {busy ? "Creating…" : "Create invite link"}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
