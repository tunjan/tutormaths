import { requireTutor } from "@/lib/auth";
import { AppToolbar } from "@/components/app-toolbar";
import { TutorNav } from "@/components/tutor-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { NotificationBell } from "@/components/notification-bell";
import { SignOutButton } from "@/components/sign-out-button";
import { createClient } from "@/lib/supabase/server";
import { TutorSettingsDialog } from "@/components/tutor-settings-dialog";

export default async function TutorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ctx = await requireTutor();
  const supabase = await createClient();

  const { data: settings } = await supabase
    .from("tutor_settings")
    .select("reminder_windows")
    .eq("tutor_id", ctx.userId)
    .single();

  const initialWindows = settings?.reminder_windows ?? [48, 24, 6];

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <AppToolbar
        homeHref="/tutor"
        homeLabel="Maths Tasks tutor dashboard"
        roleLabel="Tutor workspace"
        userEmail={ctx.email}
        maxWidthClassName="max-w-6xl"
        nav={<TutorNav />}
        controls={
          <>
            <NotificationBell userId={ctx.userId} role="tutor" />
            <TutorSettingsDialog initialWindows={initialWindows} />
            <ThemeToggle />
            <SignOutButton />
          </>
        }
      />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:py-10">
        {children}
      </main>
    </div>
  );
}
