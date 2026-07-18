"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Copy, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { revokeInvite } from "@/app/tutor/actions";

/**
 * Actions for a pending-invite card: re-copy the shareable link (built from the
 * current origin so it works in any environment) and revoke the invite.
 */
export function PendingInviteActions({
  inviteId,
  token,
}: {
  inviteId: string;
  token: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    const url = `${window.location.origin}/invite/${token}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Invite link copied.");
    setTimeout(() => setCopied(false), 2000);
  }

  function revoke() {
    startTransition(async () => {
      try {
        await revokeInvite(inviteId);
        toast.success("Invite cancelled.");
        router.refresh();
      } catch {
        toast.error("Couldn't cancel the invite.");
      }
    });
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="soft"
        size="sm"
        className="flex-1"
        onClick={copyLink}
      >
        <Copy /> {copied ? "Copied" : "Copy link"}
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        disabled={pending}
        onClick={revoke}
        aria-label="Cancel invite"
      >
        <X />
      </Button>
    </div>
  );
}
