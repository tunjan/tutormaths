import Link from "next/link";
import { requireTutor } from "@/lib/auth";
import { NotificationBell } from "@/components/notification-bell";
import { SignOutButton } from "@/components/sign-out-button";

export default async function TutorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ctx = await requireTutor();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-6 py-4">
          <nav className="flex items-center gap-6 text-sm">
            <Link href="/tutor" className="font-semibold tracking-tight">
              Maths Tasks
            </Link>
            <Link
              href="/tutor/students"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Students
            </Link>
            <Link
              href="/tutor/assignments/new"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              New assignment
            </Link>
            <Link
              href="/tutor/settings"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Settings
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <NotificationBell userId={ctx.userId} />
            <SignOutButton />
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-4xl px-6 py-10">{children}</div>
    </div>
  );
}
