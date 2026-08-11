"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddStudentModal } from "@/components/add-student-modal";

/** "Add student" button that opens the invite dialog. */
export function AddStudentButton({
  variant = "primary",
  label = "Add student",
  size = "default",
  className,
}: {
  variant?: "primary" | "secondary" | "soft" | "minimal";
  label?: string;
  size?: "default" | "sm";
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
      <AddStudentModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
