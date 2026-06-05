import Link from "next/link";
import { requireStudent } from "@/lib/auth";
import { ThemeToggle } from "@/components/theme-toggle";
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
      <header className="sticky top-0 z-10 border-b-2 border-foreground bg-background">
        <div className="mx-auto flex h-16 max-w-7xl items-center px-6">
          <Link href="/student" aria-label="Maths Tasks home" className="font-heading text-xl font-black uppercase tracking-tighter">
            Maths Tasks
          </Link>
          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <NotificationBell userId={ctx.userId} role="student" />
            <ThemeToggle />
            <SignOutButton />
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-6 py-12">{children}</div>
    </div>
  );
}
