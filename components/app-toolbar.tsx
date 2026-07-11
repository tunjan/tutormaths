import type { ReactNode } from "react";
import { Link } from "next-view-transitions";
import { AccountMenu } from "@/components/account-menu";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";

export function AppToolbar({
  homeHref,
  homeLabel,
  roleLabel,
  userEmail,
  nav,
  notification,
  accountActions,
  maxWidthClassName,
}: {
  homeHref: string;
  homeLabel: string;
  roleLabel: string;
  userEmail?: string | null;
  nav: ReactNode;
  notification: ReactNode;
  accountActions: ReactNode;
  maxWidthClassName: string;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-border-subtle bg-bg-default/95 backdrop-blur-md supports-[backdrop-filter]:bg-bg-default/85">
      <div
        className={cn(
          "mx-auto grid min-h-16 w-full grid-cols-[auto_1fr_auto] items-center gap-2 px-4 sm:px-6 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]",
          maxWidthClassName,
        )}
      >
        <Link
          href={homeHref}
          aria-label={homeLabel}
          className="flex h-10 min-w-0 items-center gap-2.5 rounded-lg text-content-emphasis focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-border-subtle"
        >
          <Logo />
          <span className="hidden truncate text-sm font-semibold tracking-[-0.01em] min-[380px]:inline">
            Maths Tasks
          </span>
          <span className="hidden truncate text-xs font-normal text-content-muted lg:inline">
            {roleLabel}
          </span>
        </Link>

        <div className="flex min-w-0 items-center justify-end md:justify-center">
          {nav}
        </div>

        <div className="flex min-w-0 items-center justify-end gap-0.5">
          {notification}
          <AccountMenu
            roleLabel={roleLabel}
            userEmail={userEmail}
            actions={accountActions}
          />
        </div>
      </div>
    </header>
  );
}
