import Link from "next/link";
import { requireTutor } from "@/lib/auth";
import { Logo, LogoMark } from "@/components/logo";
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
      <header className="sticky top-0 z-10 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:gap-6 sm:px-6">
          <Link href="/tutor" aria-label="Maths Tasks home">
            <Logo className="hidden sm:flex" />
            <LogoMark className="size-8 sm:hidden" />
          </Link>
          <TutorNav />
          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <NotificationBell userId={ctx.userId} role="tutor" />
            <ThemeToggle />
            <SignOutButton />
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">{children}</div>
    </div>
  );
}
