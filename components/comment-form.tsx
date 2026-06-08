"use client";

import { useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="self-end">
      {pending ? "Posting…" : "Post comment"}
    </Button>
  );
}

/**
 * Comment composer. The server action is passed in by the page so the same
 * form serves both tutor and student views.
 */
export function CommentForm({
  assignmentId,
  action,
}: {
  assignmentId: string;
  action: (formData: FormData) => Promise<void>;
}) {
  const ref = useRef<HTMLFormElement>(null);
  const [globalError, setGlobalError] = useState("");

  return (
    <form
      ref={ref}
      action={async (formData) => {
        try {
          await action(formData);
          ref.current?.reset();
          setGlobalError("");
        } catch (e) {
          setGlobalError((e as Error).message);
        }
      }}
      className="flex flex-col gap-3"
    >
      {globalError && (
        <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
          {globalError}
        </div>
      )}
      <input type="hidden" name="assignment_id" value={assignmentId} />
      <Textarea
        name="body"
        required
        rows={3}
        placeholder="Write a comment…"
        className="min-h-20 bg-card"
      />
      <SubmitButton />
    </form>
  );
}
