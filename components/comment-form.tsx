"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

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

  return (
    <form
      ref={ref}
      action={async (formData) => {
        await action(formData);
        ref.current?.reset();
      }}
      className="flex flex-col gap-3"
    >
      <input type="hidden" name="assignment_id" value={assignmentId} />
      <Textarea
        name="body"
        required
        rows={3}
        placeholder="Write a comment…"
        className="min-h-20"
      />
      <Button type="submit" className="self-end">
        Post comment
      </Button>
    </form>
  );
}
