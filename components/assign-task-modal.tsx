"use client";

import { useCallback, useRef, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { NewAssignmentForm } from "@/app/tutor/assignments/new/new-assignment-form";
import type { CategoryRow } from "@/lib/actions/library";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  finalFocusRef,
}: {
  open: boolean;
  onClose: () => void;
  students: StudentOption[];
  categories?: CategoryRow[];
  defaultStudentId?: string;
  finalFocusRef?: React.RefObject<HTMLButtonElement | null>;
}) {
  const initialFocusRef = useRef<HTMLButtonElement | null>(null);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);

  const closeNow = useCallback(() => {
    setDirty(false);
    setBusy(false);
    setDiscardOpen(false);
    onClose();
  }, [onClose]);

  const requestClose = useCallback(() => {
    if (busy) return;
    if (dirty) {
      setDiscardOpen(true);
      return;
    }
    closeNow();
  }, [busy, closeNow, dirty]);

  return (
    <>
      <Modal
        open={open}
        onClose={requestClose}
        title="Create assignment"
        description="Choose a student, add the material, and set a deadline."
        className="max-h-[92dvh]! max-w-4xl! overflow-hidden sm:max-h-[calc(100dvh-3rem)]!"
        contentClassName="mt-5 flex min-h-0 flex-1 flex-col"
        initialFocus={initialFocusRef}
        finalFocus={finalFocusRef}
        closeDisabled={busy}
      >
        <NewAssignmentForm
          students={students}
          categories={categories}
          defaultStudentId={defaultStudentId}
          onCancel={requestClose}
          onDirtyChange={setDirty}
          onBusyChange={setBusy}
          initialFocusRef={initialFocusRef}
        />
      </Modal>

      <AlertDialog open={discardOpen} onOpenChange={setDiscardOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard this assignment?</AlertDialogTitle>
            <AlertDialogDescription>
              Your details and selected material will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep editing</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={closeNow}>
              Discard draft
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
