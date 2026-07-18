import { requireStudent } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { unreadAssignmentIds } from "@/lib/queries";
import { PageHeader } from "@/components/ui/page-header";
import { RequestHomeworkButton } from "@/components/request-homework-button";
import {
  AssignmentCalendar,
  type CalendarAssignment,
} from "@/components/assignment-calendar";

export default async function StudentCalendar() {
  await requireStudent();
  const supabase = await createClient();

  // RLS limits this to the student's own assignments.
  const [{ data: assignments }, unread] = await Promise.all([
    supabase
      .from("assignments")
      .select("id, title, type, due_at, completion_pct, review_status")
      .order("due_at", { ascending: true }),
    unreadAssignmentIds(),
  ]);

  const items = (assignments ?? []) as CalendarAssignment[];

  return (
    <div className="w-full animate-rise">
      <PageHeader
        title="Calendar"
        description="Every assignment on its due date — plan your week at a glance."
        actions={<RequestHomeworkButton />}
      />

      <div>
        <AssignmentCalendar assignments={items} unread={[...unread]} />
      </div>
    </div>
  );
}
