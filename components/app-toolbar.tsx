import type { ReactNode } from "react";
import { Link } from "next-view-transitions";
import { AccountMenu } from "@/components/account-menu";
import { AppFooter } from "@/components/app-footer";
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
    <div className="flex min-h-dvh w-full flex-col bg-background">
      <header className="sticky top-0 z-40 bg-card shadow-xs">
        <div className="mx-auto flex h-14 w-full max-w-[1248px] items-center gap-3 px-4 sm:px-6">
          <Link
            href={homeHref}
            aria-label={homeLabel}
            className="flex min-w-0 items-center gap-2 rounded-sm text-content-emphasis focus-visible:outline-none"
          >
            <Logo />
            <span className="truncate text-title-sm" translate="no">
              Maths Tasks
            </span>
          </Link>

          <div className="ml-3 hidden min-w-0 lg:block">{navigation}</div>

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

      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto w-full max-w-[1248px] flex-1 px-4 py-8 sm:px-6 sm:py-10"
      >
        {children}
      </main>

      <AppFooter homeHref={homeHref} />
    </div>
  );
}
