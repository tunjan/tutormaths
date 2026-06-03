import Link from "next/link";
import { requireStudent } from "@/lib/auth";
import { NotificationBell } from "@/components/notification-bell";
import { SignOutButton } from "@/components/sign-out-button";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ctx = await requireStudent();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-6 py-4">
          <Link href="/student" className="font-semibold tracking-tight">
            Maths Tasks
          </Link>
          <div className="flex items-center gap-2">
            <NotificationBell userId={ctx.userId} />
            <SignOutButton />
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-3xl px-6 py-10">{children}</div>
    </div>
  );
}
