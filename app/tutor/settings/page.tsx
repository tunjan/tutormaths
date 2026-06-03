import { requireTutor } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { updateReminderWindows } from "@/app/tutor/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
            Hours before an assignment is due when a reminder is sent (email and
            in-app). Comma-separated, e.g. <code>48, 24, 6</code>.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updateReminderWindows} className="flex items-end gap-3">
            <div className="flex flex-1 flex-col gap-2">
              <Label htmlFor="windows">Reminder windows (hours)</Label>
              <Input
                id="windows"
                name="windows"
                type="text"
                defaultValue={windows.join(", ")}
              />
            </div>
            <Button type="submit">Save</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
