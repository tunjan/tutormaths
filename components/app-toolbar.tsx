import type { ReactNode } from "react";
import { Link } from "next-view-transitions";
import { AccountMenu } from "@/components/account-menu";
import { Logo } from "@/components/logo";

export function AppShell({
  homeHref,
  homeLabel,
  roleLabel,
  userEmail,
  navigation,
  mobileNavigation,
  notification,
  accountActions,
  children,
}: {
  homeHref: string;
  homeLabel: string;
  roleLabel: string;
  userEmail?: string | null;
  navigation: ReactNode;
  mobileNavigation: ReactNode;
  notification: ReactNode;
  accountActions: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="min-h-dvh w-full bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background">
        <div className="mx-auto flex min-h-11 w-full max-w-[1200px] items-center gap-3 px-4 py-3 sm:px-6">
          <Link
            href={homeHref}
            aria-label={homeLabel}
            className="flex min-w-0 items-center gap-2 text-content-emphasis focus-visible:outline-none"
          >
            <Logo />
            <span className="truncate text-label">Maths Tasks</span>
          </Link>

          <span className="hidden h-4 w-px bg-border sm:block" aria-hidden />
          <span className="hidden font-eyebrow text-content-muted sm:block">
            {roleLabel}
          </span>

          <div className="ml-2 hidden min-w-0 lg:block">{navigation}</div>

          <div className="ml-auto flex min-w-0 items-center gap-1">
            {notification}
            <div className="lg:hidden">{mobileNavigation}</div>
            <AccountMenu
              roleLabel={roleLabel}
              userEmail={userEmail}
              actions={accountActions}
            />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1200px] px-4 py-8 sm:px-6 md:py-16">
        {children}
      </main>
    </div>
  );
}
