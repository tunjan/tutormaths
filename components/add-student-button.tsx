"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddStudentModal } from "@/components/add-student-modal";

/** "Add student" button that opens the invite dialog. */
export function AddStudentButton({
  variant = "default",
  label = "Add student",
}: {
  variant?: "default" | "outline" | "soft" | "ghost";
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant={variant} onClick={() => setOpen(true)}>
        <Plus /> {label}
      </Button>
      <AddStudentModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
