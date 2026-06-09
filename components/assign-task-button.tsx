"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AssignTaskModal } from "@/components/assign-task-modal";

interface StudentOption {
  id: string;
  full_name: string;
  email: string | null;
}

/** "Assign task" button that opens the new-assignment dialog. */
export function AssignTaskButton({
  students,
  defaultStudentId,
  variant = "default",
  size = "default",
  label = "Assign task",
  className,
}: {
  students: StudentOption[];
  defaultStudentId?: string;
  variant?: "default" | "outline" | "soft";
  size?: "default" | "sm";
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
        <Plus /> {label}
      </Button>
      <AssignTaskModal
        open={open}
        onClose={() => setOpen(false)}
        students={students}
        defaultStudentId={defaultStudentId}
      />
    </>
  );
}
