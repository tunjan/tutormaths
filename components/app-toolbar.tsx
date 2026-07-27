"use client";

import { useState, type ReactNode } from "react";
import { Link } from "next-view-transitions";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { AccountMenu } from "@/components/account-menu";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

/**
 * Fixed-width left sidebar shell (design doc §4/§6): wordmark at top, primary
 * nav in the middle, role/notification/account demoted into the footer. On
 * narrow viewports the sidebar collapses into a top bar + slide-in Sheet.
 */
export function AppShell({
  homeHref,
  homeLabel,
  roleLabel,
  userEmail,
  navigation,
  notification,
  accountActions,
  children,
}: {
  homeHref: string;
  homeLabel: string;
  roleLabel: string;
  userEmail?: string | null;
  navigation: ReactNode;
  notification: ReactNode;
  accountActions: ReactNode;
  children: ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const [lastPathname, setLastPathname] = useState(pathname);

  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setMobileOpen(false);
  }

  const wordmark = (
    <Link
      href={homeHref}
      aria-label={homeLabel}
      className="flex min-w-0 items-center gap-2 text-content-emphasis focus-visible:outline-none"
    >
      <Logo />
      <span className="truncate text-label">Maths Tasks</span>
    </Link>
  );

  return (
    <div className="flex min-h-dvh w-full bg-surface-muted">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-(--sidebar-width) flex-col border-r border-border bg-background lg:flex">
        <div className="flex items-center gap-2 px-5 py-5">{wordmark}</div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3" aria-label="Primary">
          {navigation}
        </nav>

        <div className="mt-auto flex flex-col gap-2 border-t border-border-subtle px-3 py-3">
          <div className="flex items-center justify-between gap-2 px-2">
            <span className="font-eyebrow text-content-subtle">{roleLabel}</span>
            {notification}
          </div>
          <AccountMenu roleLabel={roleLabel} userEmail={userEmail} actions={accountActions} />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col lg:pl-(--sidebar-width)">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-background px-4 py-3 lg:hidden">
          <Button
            variant="minimal"
            size="icon-sm"
            aria-label="Open menu"
            title="Open menu"
            onClick={() => setMobileOpen(true)}
          >
            <Menu />
          </Button>
          {wordmark}
          <div className="ml-auto flex min-w-0 items-center gap-1">
            {notification}
            <AccountMenu roleLabel={roleLabel} userEmail={userEmail} actions={accountActions} />
          </div>
        </header>

        <main className="mx-auto w-full max-w-(--content-width) flex-1 px-4 py-8 sm:px-6 md:py-12">
          {children}
        </main>
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-4">
          <SheetHeader className="px-0 pb-2">
            <SheetTitle>{homeLabel}</SheetTitle>
          </SheetHeader>
          <nav aria-label="Primary">{navigation}</nav>
        </SheetContent>
      </Sheet>
    </div>
  );
}
