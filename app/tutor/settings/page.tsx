import { requireTutor } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { updateReminderWindows } from "@/app/tutor/actions";
import { ReminderWindowsField } from "@/components/reminder-windows-field";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function SettingsPage() {
  const ctx = await requireTutor();
  const supabase = await createClient();

  const { data: settings } = await supabase
    .from("tutor_settings")
    .select("reminder_windows")
    .eq("tutor_id", ctx.userId)
    .single();

  const windows = settings?.reminder_windows ?? [48, 24, 6];

  return (
    <div className="flex max-w-2xl flex-col gap-8">
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Reminder windows</CardTitle>
          <CardDescription>
            How long before an assignment is due a reminder is sent (email and
            in-app). Add one chip per window.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ReminderWindowsField
            initial={windows}
            action={updateReminderWindows}
          />
        </CardContent>
      </Card>
    </div>
  );
}
