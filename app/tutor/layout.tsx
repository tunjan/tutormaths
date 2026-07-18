import { requireTutor } from "@/lib/auth";
import { AppShell } from "@/components/app-toolbar";
import { TutorNav } from "@/components/tutor-nav";
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
    <AppShell
      homeHref="/tutor"
      homeLabel="Maths Tasks tutor dashboard"
      roleLabel="Tutor workspace"
      userEmail={ctx.email}
      navigation={<TutorNav presentation="sidebar" />}
      mobileNavigation={<TutorNav presentation="mobile" />}
      notification={<NotificationBell userId={ctx.userId} role="tutor" />}
      accountActions={
        <>
          <TutorSettingsDialog initialWindows={initialWindows} presentation="menu" />
          <SignOutButton presentation="menu" />
        </>
      }
    >
      {children}
    </AppShell>
  );
}
