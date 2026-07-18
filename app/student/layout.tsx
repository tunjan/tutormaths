import { requireStudent } from "@/lib/auth";
import { AppShell } from "@/components/app-toolbar";
import { StudentNav } from "@/components/student-nav";
import { NotificationBell } from "@/components/notification-bell";
import { SignOutButton } from "@/components/sign-out-button";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ctx = await requireStudent();

  return (
    <AppShell
      homeHref="/student"
      homeLabel="Maths Tasks student dashboard"
      roleLabel="Student workspace"
      userEmail={ctx.email}
      navigation={<StudentNav presentation="sidebar" />}
      mobileNavigation={<StudentNav presentation="mobile" />}
      notification={<NotificationBell userId={ctx.userId} role="student" />}
      accountActions={
        <>
          <SignOutButton presentation="menu" />
        </>
      }
    >
      {children}
    </AppShell>
  );
}
