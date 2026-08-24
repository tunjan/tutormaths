import { Bell, BookOpenText, LayoutDashboard, ListChecks, Plus, UsersRound } from "lucide-react";
import { Link } from "next-view-transitions";
import { AppShell } from "@/components/app-toolbar";
import { TutorDashboardOverview } from "@/components/tutor-dashboard-overview";
import type { BrowserItem } from "@/components/tutor-assignment-browser";
import { PageHeader } from "@/components/ui/page-header";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const students = ["Demo", "Ilenia", "Svyatoslav", "Elena", "Marta", "Noah", "Lina"];
const titles = ["Problem set 1", "Trigonometry #1", "Miscellaneous"];

const activeItems: BrowserItem[] = Array.from({ length: 23 }, (_, index) => ({
  id: `preview-${index}`,
  studentId: `student-${index % students.length}`,
  title: titles[index] ?? `Practice set ${index + 1}`,
  type: index % 4 === 0 ? "reading_notes" : "problem_set",
  due_at: index < 21 ? "2026-08-18T10:00:00.000Z" : "2026-09-05T10:00:00.000Z",
  completion_pct: index < 3 ? [0, 80, 0][index] : (index * 13) % 100,
  review_status: index < 3 ? "submitted" : "assigned",
  student: index < 3 ? "Elena" : students[index % students.length],
  unread: index === 0,
}));

const focusItems = activeItems.slice(0, 21);

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, active: true },
  { label: "Assignments", icon: ListChecks, active: false },
  { label: "Students", icon: UsersRound, active: false },
  { label: "Library", icon: BookOpenText, active: false },
];

export default function UiPreview() {
  return (
    <AppShell
      homeHref="/ui-preview"
      homeLabel="Maths Tasks tutor dashboard"
      roleLabel="Tutor workspace"
      userEmail="alex@example.com"
      navigation={
        <nav className="flex items-center gap-1" aria-label="Primary">
          {navItems.map(({ label, icon: Icon, active }) => (
            <Link
              key={label}
              href="/ui-preview"
              aria-current={active ? "page" : undefined}
              className={cn(
                "inline-flex h-8 items-center gap-2 rounded-sm border border-transparent px-3 text-label",
                active
                  ? "border-border-strong bg-surface-selected font-medium text-accent-ink"
                  : "text-content-default",
              )}
            >
              <Icon className="size-4" strokeWidth={1.75} aria-hidden />
              {label}
            </Link>
          ))}
        </nav>
      }
      mobileNavigation={
        <span className="grid size-11 place-items-center text-content-emphasis lg:hidden">
          <LayoutDashboard className="size-4" aria-hidden />
        </span>
      }
      notification={
        <span className="grid size-11 place-items-center text-content-emphasis sm:size-9">
          <Bell className="size-4" aria-hidden />
        </span>
      }
      accountActions={null}
    >
      <PageHeader
        eyebrow="Welcome back, Alex"
        title="Teaching overview"
        className="mb-8 gap-5 border-b-0 pb-0 sm:mb-10"
        description="21 assignments need your attention across 7 students."
        actions={
          <>
            <Link
              href="/ui-preview"
              className={cn(buttonVariants({ size: "sm" }), "flex-auto sm:flex-none")}
            >
              <ListChecks data-icon="inline-start" aria-hidden />
              Review priorities
            </Link>
            <Link
              href="/ui-preview"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "flex-auto sm:flex-none",
              )}
            >
              <Plus data-icon="inline-start" aria-hidden />
              New assignment…
            </Link>
          </>
        }
      />
      <TutorDashboardOverview
        focusItems={focusItems}
        activeItems={activeItems}
        activeCount={23}
        awaitingCount={3}
        overdueCount={18}
      />
    </AppShell>
  );
}
