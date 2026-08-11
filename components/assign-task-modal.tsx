"use client";

import { Modal } from "@/components/ui/modal";
import { NewAssignmentForm } from "@/app/tutor/assignments/new/new-assignment-form";
import type { CategoryRow } from "@/lib/actions/library";

interface StudentOption {
  id: string;
  full_name: string;
  email: string | null;
  pending?: boolean;
}

/** Dialog wrapper around the new-assignment form. On success the form
 *  redirects to the created assignment, which dismisses the dialog. */
export function AssignTaskModal({
  open,
  onClose,
  students,
  categories = [],
  defaultStudentId,
}: {
  open: boolean;
  onClose: () => void;
  students: StudentOption[];
  categories?: CategoryRow[];
  defaultStudentId?: string;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Assign a task"
      description="Choose who it’s for, add the material, and set a deadline."
      className="max-h-[calc(100dvh-1rem)]! max-w-5xl! overflow-hidden sm:max-h-[calc(100dvh-2rem)]!"
      contentClassName="flex min-h-0 flex-1 flex-col"
    >
      <NewAssignmentForm
        students={students}
        categories={categories}
        defaultStudentId={defaultStudentId}
        onCancel={onClose}
      />
    </Modal>
  );
}
