import Link from "next/link";
import { requireTutor } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { NewAssignmentForm } from "./new-assignment-form";
import { Card, CardContent } from "@/components/ui/card";

export default async function NewAssignmentPage({
  searchParams,
}: {
  searchParams: Promise<{ student?: string }>;
}) {
  await requireTutor();
  const { student } = await searchParams;
  const supabase = await createClient();

  const { data: students } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .eq("role", "student")
    .order("full_name", { ascending: true });

  const defaultStudentId = students?.some((s) => s.id === student)
    ? student
    : "";

  return (
    <div className="flex max-w-2xl flex-col gap-8">
      <h1 className="text-2xl font-semibold tracking-tight">New assignment</h1>

      {!students || students.length === 0 ? (
        <Card className="py-8">
          <CardContent className="text-sm text-muted-foreground">
            You need a student first.{" "}
            <Link href="/tutor/students" className="text-primary underline">
              Invite a student
            </Link>
            .
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent>
            <NewAssignmentForm
              students={students}
              defaultStudentId={defaultStudentId}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
