import Link from "next/link";
import { requireTutor } from "@/lib/auth";
import { TutorNav } from "@/components/tutor-nav";
import { ThemeToggle } from "@/components/theme-toggle";
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
      <header className="sticky top-0 z-10 border-b-2 border-foreground bg-background">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-6">
          <Link href="/tutor" aria-label="Maths Tasks home" className="font-heading text-xl font-black uppercase tracking-tighter">
            Maths Tasks
          </Link>
          <TutorNav />
          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <NotificationBell userId={ctx.userId} role="tutor" />
            <ThemeToggle />
            <SignOutButton />
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-6 py-12">{children}</div>
    </div>
  );
}
