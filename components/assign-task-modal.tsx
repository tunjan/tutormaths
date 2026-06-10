"use client";

import { Modal } from "@/components/ui/modal";
import { NewAssignmentForm } from "@/app/tutor/assignments/new/new-assignment-form";
import type { CategoryRow } from "@/lib/actions/library";

interface StudentOption {
  id: string;
  full_name: string;
  email: string | null;
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
      description="Attach a file, pick a student, and set a due date."
      className="max-w-xl"
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
