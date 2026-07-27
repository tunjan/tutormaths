"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AssignTaskModal } from "@/components/assign-task-modal";
import type { CategoryRow } from "@/lib/actions/library";

interface StudentOption {
  id: string;
  full_name: string;
  email: string | null;
  pending?: boolean;
}

/** "Assign task" button that opens the new-assignment dialog. */
export function AssignTaskButton({
  students,
  categories = [],
  defaultStudentId,
  variant = "primary",
  size = "default",
  label = "Assign task",
  className,
}: {
  students: StudentOption[];
  categories?: CategoryRow[];
  defaultStudentId?: string;
  variant?: "primary" | "secondary" | "minimal" | "soft" | "destructive";
  size?: "default" | "sm" | "lg" | "icon" | "icon-xs" | "icon-sm" | "icon-lg";
  label?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={() => setOpen(true)}
      >
        <Plus data-icon="inline-start" /> {label}
      </Button>
      <AssignTaskModal
        open={open}
        onClose={() => setOpen(false)}
        students={students}
        categories={categories}
        defaultStudentId={defaultStudentId}
      />
    </>
  );
}
