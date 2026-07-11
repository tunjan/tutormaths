"use client";

import { useState } from "react";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { ReminderWindowsField } from "@/components/reminder-windows-field";
import { updateReminderWindows } from "@/app/tutor/actions";

export function TutorSettingsDialog({
  initialWindows,
  presentation = "icon",
}: {
  initialWindows: number[];
  presentation?: "icon" | "menu";
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {presentation === "menu" ? (
        <Button
          variant="ghost"
          size="default"
          className="w-full justify-start"
          onClick={() => setOpen(true)}
        >
          <Settings data-icon="inline-start" />
          Settings
        </Button>
      ) : (
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Settings"
          title="Settings"
          onClick={() => setOpen(true)}
        >
          <Settings />
        </Button>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Settings"
        description="Configure your tutor workspace."
      >
        <div className="space-y-4 pt-2">
          <div>
            <h3 className="text-[14px] font-medium text-foreground mb-1">Reminder windows</h3>
            <p className="text-[13px] text-muted-foreground mb-4 leading-relaxed">
              How long before an assignment is due a reminder is sent (email and in-app). Add one chip per window.
            </p>
            <ReminderWindowsField
              initial={initialWindows}
              action={updateReminderWindows}
            />
          </div>
        </div>
      </Modal>
    </>
  );
}
