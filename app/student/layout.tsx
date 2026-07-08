import { requireStudent } from "@/lib/auth";
import { AppToolbar } from "@/components/app-toolbar";
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
    <div className="flex min-h-dvh flex-col bg-background">
      <AppToolbar
        homeHref="/student"
        homeLabel="Maths Tasks student dashboard"
        roleLabel="Student workspace"
        userEmail={ctx.email}
        maxWidthClassName="max-w-5xl"
        nav={<StudentNav />}
        controls={
          <>
            <NotificationBell userId={ctx.userId} role="student" />
            <ThemeToggle />
            <SignOutButton />
          </>
        }
      />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 lg:py-10">
        {children}
      </main>
    </div>
  );
}
