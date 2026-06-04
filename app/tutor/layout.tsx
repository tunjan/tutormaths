import Link from "next/link";
import { requireTutor } from "@/lib/auth";
import { Logo } from "@/components/logo";
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
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-6">
            <Link href="/tutor" aria-label="Maths Tasks home">
              <Logo />
            </Link>
            <TutorNav />
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <NotificationBell userId={ctx.userId} />
            <ThemeToggle />
            <SignOutButton />
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">{children}</div>
    </div>
  );
}
