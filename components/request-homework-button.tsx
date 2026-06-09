"use client";

import { type ReactNode, useState, useTransition } from "react";
import { toast } from "sonner";
import { requestMoreHomework } from "@/app/student/actions";
import { Button, type buttonVariants } from "@/components/ui/button";
import { type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
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

export function RequestHomeworkButton({
  label = "Request more practice",
  icon,
  variant = "default",
  className,
}: {
  label?: string;
  icon?: ReactNode;
  variant?: VariantProps<typeof buttonVariants>["variant"];
  className?: string;
} = {}) {
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(false);

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button
            variant={variant}
            className={cn(className)}
            disabled={pending || done}
          >
            {done ? (
              "Request sent"
            ) : pending ? (
              "Sending…"
            ) : (
              <>
                {icon}
                {label}
              </>
            )}
          </Button>
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Ready for more practice?</AlertDialogTitle>
          <AlertDialogDescription>
            Your tutor will be notified that you&apos;d like to keep improving with extra exercises.
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
