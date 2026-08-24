import { AssignTaskButton } from "@/components/assign-task-button";

const students = [
  {
    id: "student-ada",
    full_name: "Ada Lovelace",
    email: "ada@example.com",
  },
  {
    id: "student-noor",
    full_name: "Noor al-Khwarizmi with a deliberately long display name",
    email: "noor@example.com",
  },
  {
    id: "invite-grace",
    full_name: "Grace Hopper",
    email: "grace@example.com",
    pending: true,
  },
];

const categories = [
  { id: "topic-algebra", name: "Algebra" },
  { id: "topic-calculus", name: "Calculus and mathematical analysis" },
];

export default function DialogPreviewPage() {
  return (
    <main
      id="main-content"
      className="grid min-h-dvh place-items-center bg-bg-subtle p-6"
    >
      <div className="flex flex-col items-center gap-4 text-center">
        <h1 className="text-heading-lg text-content-emphasis">
          Assignment dialog preview
        </h1>
        <AssignTaskButton
          students={students}
          categories={categories}
          label="New assignment"
        />
      </div>
    </main>
  );
}
