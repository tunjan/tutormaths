import type { ReactNode } from "react";
import { Link } from "next-view-transitions";
import { AccountMenu } from "@/components/account-menu";
import { AppFooter } from "@/components/app-footer";

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
      <header className="sticky top-0 z-40 border-b border-border-strong bg-card pt-[env(safe-area-inset-top)] shadow-xs">
        <div className="mx-auto flex h-14 w-full max-w-[1248px] items-center gap-3 pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] sm:pl-[max(1.5rem,env(safe-area-inset-left))] sm:pr-[max(1.5rem,env(safe-area-inset-right))]">
          <Link
            href={homeHref}
            aria-label={homeLabel}
            className="flex min-h-8 min-w-0 items-center rounded-sm text-content-emphasis focus-visible:outline-none"
          >
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
        className="mx-auto w-full max-w-[1248px] flex-1 py-8 pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] sm:py-10 sm:pl-[max(1.5rem,env(safe-area-inset-left))] sm:pr-[max(1.5rem,env(safe-area-inset-right))]"
      >
        {children}
      </main>

      <AppFooter homeHref={homeHref} />
    </div>
  );
}
