"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { requestMoreHomework } from "@/app/student/actions";
import { Button } from "@/components/ui/button";

export function RequestHomeworkButton() {
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(false);

  return (
    <Button
      variant="outline"
      className="border-primary/30 bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary"
      disabled={pending || done}
      onClick={() =>
        startTransition(async () => {
          await requestMoreHomework();
          setDone(true);
          toast.success("Request sent — your tutor has been notified.");
        })
      }
    >
      {done ? "Request sent" : pending ? "Sending…" : "Request more homework"}
    </Button>
  );
}
