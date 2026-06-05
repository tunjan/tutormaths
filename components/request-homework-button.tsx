"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { requestMoreHomework } from "@/app/student/actions";
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

export function RequestHomeworkButton() {
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(false);

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button
            variant="outline"
            className="border-primary/30 bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary"
            disabled={pending || done}
          >
            {done ? "Request sent" : pending ? "Sending…" : "Request more homework"}
          </Button>
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Request more homework?</AlertDialogTitle>
          <AlertDialogDescription>
            Your tutor will be notified that you&rsquo;re ready for more work.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() =>
              startTransition(async () => {
                await requestMoreHomework();
                setDone(true);
                toast.success("Request sent — your tutor has been notified.");
              })
            }
          >
            Send request
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
