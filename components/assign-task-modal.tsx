"use client";

import { Modal } from "@/components/ui/modal";
import { NewAssignmentForm } from "@/app/tutor/assignments/new/new-assignment-form";

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
  defaultStudentId,
}: {
  open: boolean;
  onClose: () => void;
  students: StudentOption[];
  defaultStudentId?: string;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Assign a task"
      description="Attach a PDF, pick a student, and set a due date."
      className="max-w-xl"
    >
      <NewAssignmentForm
        students={students}
        defaultStudentId={defaultStudentId}
        onCancel={onClose}
      />
    </Modal>
  );
}
