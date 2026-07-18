"use client";

import { type ReactNode, useState, useTransition } from "react";
import { toast } from "sonner";
import { requestMoreHomework } from "@/app/student/actions";
import { Button, type buttonVariants } from "@/components/ui/button";
import { type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field";
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

const MAX_MESSAGE_LENGTH = 500;

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
  const [message, setMessage] = useState("");

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
        <Field>
          <FieldLabel htmlFor="homework-request-message">
            Add a message{" "}
            <span className="text-muted-foreground font-normal">(optional)</span>
          </FieldLabel>
          <Textarea
            id="homework-request-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={MAX_MESSAGE_LENGTH}
            rows={3}
            placeholder="e.g. more practice on integration by parts, or harder problems on vectors"
            disabled={pending || done}
          />
          <FieldDescription>
            Let your tutor know what you&apos;d like to work on.
          </FieldDescription>
        </Field>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() =>
              startTransition(async () => {
                await requestMoreHomework(message);
                setDone(true);
                toast.success("Request sent. Your tutor has been notified.");
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
