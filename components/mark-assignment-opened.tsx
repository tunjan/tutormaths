"use client";

import { useEffect } from "react";
import { markAssignmentOpened } from "@/app/student/actions";

/**
 * Fire-and-forget: records that the student has opened this assignment so the
 * tutor sees a read receipt. Stamps only the first open (server-side). Renders
 * nothing.
 */
export function MarkAssignmentOpened({ assignmentId }: { assignmentId: string }) {
  useEffect(() => {
    void markAssignmentOpened(assignmentId);
  }, [assignmentId]);
  return null;
}
