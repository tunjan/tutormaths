import { Link } from "next-view-transitions";
import { requireStudent } from "@/lib/auth";
import { Logo } from "@/components/logo";
import { Mascot } from "@/components/mascot";
import { StudentNav } from "@/components/student-nav";
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
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center gap-4 px-6">
          <Link
            href="/student"
            aria-label="Maths Tasks — home"
            className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
          >
            <Mascot pose="glide" className="size-7" />
            <Logo />
          </Link>
          <span className="mx-1 hidden h-6 w-px bg-border md:block" />
          <StudentNav />
          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <NotificationBell userId={ctx.userId} role="student" />
            <ThemeToggle />
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
        {children}
      </main>
    </div>
  );
}
