"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteCategory, deleteLibraryDocument } from "@/lib/actions/library";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";


/** Tutor-only confirm-and-delete for a Library document or a whole topic. */
export function LibraryDeleteButton({
  kind,
  id,
  name,
}: {
  kind: "document" | "category";
  id: string;
  name: string;
}) {
  const [pending, start] = useTransition();
  const isCategory = kind === "category";

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            disabled={pending}
            aria-label={isCategory ? `Delete topic ${name}` : `Delete ${name}`}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="size-4" />
          </Button>
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isCategory ? `Delete the “${name}” topic?` : `Delete “${name}”?`}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isCategory
              ? "Its documents will be permanently removed, and any assignments tagged with it will become untagged. This can’t be undone."
              : "This document will be permanently removed from the Library. This can’t be undone."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={() =>
              start(async () => {
                try {
                  if (isCategory) await deleteCategory(id);
                  else await deleteLibraryDocument(id);
                  toast.success(isCategory ? "Topic deleted." : "Document deleted.");
                } catch (err) {
                  toast.error((err as Error).message);
                }
              })
            }
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
