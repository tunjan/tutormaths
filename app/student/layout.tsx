import Link from "next/link";
import { requireStudent } from "@/lib/auth";
import { Logo, LogoMark } from "@/components/logo";
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
      <header className="sticky top-0 z-10 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center px-4 sm:px-6">
          <Link href="/student" aria-label="Maths Tasks home">
            <Logo className="hidden sm:flex" />
            <LogoMark className="size-8 sm:hidden" />
          </Link>
          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <NotificationBell userId={ctx.userId} role="student" />
            <ThemeToggle />
            <SignOutButton />
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">{children}</div>
    </div>
  );
}
