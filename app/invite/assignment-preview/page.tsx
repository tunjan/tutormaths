import type { Metadata } from "next";
import {
  TutorAssignmentBrowser,
  type BrowserItem,
} from "@/components/tutor-assignment-browser";
import { TutorAssignmentSummary } from "@/components/tutor-assignment-summary";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = {
  title: "Assignment preview",
};

const hourMs = 60 * 60 * 1000;
const dayMs = 24 * hourMs;

export default function AssignmentPreviewPage() {
  // eslint-disable-next-line react-hooks/purity
  const nowMs = Date.now();
  const isoFromNow = (offsetMs: number) =>
    new Date(nowMs + offsetMs).toISOString();
  const items: BrowserItem[] = [
    {
      id: "preview-submitted",
      studentId: "student-1",
      title: "Quadratic equations checkpoint",
      type: "problem_set",
      due_at: isoFromNow(dayMs),
      completion_pct: 100,
      review_status: "submitted",
      student: "Maya Chen",
      unread: true,
    },
    {
      id: "preview-overdue",
      studentId: "student-2",
      title: "Trigonometry practice set with a deliberately long title",
      type: "problem_set",
      due_at: isoFromNow(-2 * dayMs),
      completion_pct: 45,
      review_status: "assigned",
      student: "Noah Williams",
      unread: false,
    },
    {
      id: "preview-active",
      studentId: "student-3",
      title: "Read and annotate the proof",
      type: "reading_notes",
      due_at: isoFromNow(4 * dayMs),
      completion_pct: 60,
      review_status: "needs_work",
      student: "Ava Patel",
      unread: false,
    },
    {
      id: "preview-approved",
      studentId: "student-1",
      title: "Functions recap",
      type: "problem_set",
      due_at: isoFromNow(-7 * dayMs),
      completion_pct: 100,
      review_status: "approved",
      student: "Maya Chen",
      unread: false,
    },
  ];

  return (
    <main className="mx-auto w-full max-w-[1248px] p-4 sm:p-8">
      <PageHeader
        title="Assignments"
        description="4 assignments · Search, filter, and manage student work."
        className="mb-5 gap-4 border-b-0 pb-0"
      />
      <TutorAssignmentSummary items={items} nowMs={nowMs} />
      <TutorAssignmentBrowser items={items} nowMs={nowMs} />
    </main>
  );
}
