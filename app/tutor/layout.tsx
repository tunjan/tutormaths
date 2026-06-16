import { Link } from "next-view-transitions";
import { requireTutor } from "@/lib/auth";
import { Logo } from "@/components/logo";
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
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-40 px-4 pt-4">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 rounded-2xl border border-border/60 bg-background/60 px-6 shadow-lg shadow-black/5 backdrop-blur-xl backdrop-saturate-150 supports-[backdrop-filter]:bg-background/50 dark:shadow-black/20">
          <Link
            href="/tutor"
            aria-label="Maths Tasks — dashboard"
            className="flex items-center transition-opacity hover:opacity-80"
          >
            <Logo />
          </Link>
          <span className="mx-1 hidden h-4 w-px bg-border md:block" />
          <TutorNav />
          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <NotificationBell userId={ctx.userId} role="tutor" />
            <TutorSettingsDialog initialWindows={initialWindows} />
            <ThemeToggle />
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        {children}
      </main>
    </div>
  );
}
