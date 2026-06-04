"use client";

import { useEffect } from "react";
import { markAssignmentRead } from "@/lib/actions/notifications";

/**
 * Fire-and-forget: marks an assignment's notifications read once it is opened.
 * Renders nothing.
 */
export function MarkAssignmentRead({ assignmentId }: { assignmentId: string }) {
  useEffect(() => {
    void markAssignmentRead(assignmentId);
  }, [assignmentId]);
  return null;
}
