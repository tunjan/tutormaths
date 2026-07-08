import type { ReactNode } from "react";
import { Link } from "next-view-transitions";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";

function accountInitial(email: string | null | undefined, fallback: string) {
  const source = email?.trim() || fallback;
  return source.charAt(0).toUpperCase();
}

export function AppToolbar({
  homeHref,
  homeLabel,
  roleLabel,
  userEmail,
  nav,
  controls,
  maxWidthClassName,
}: {
  homeHref: string;
  homeLabel: string;
  roleLabel: string;
  userEmail?: string | null;
  nav: ReactNode;
  controls: ReactNode;
  maxWidthClassName: string;
}) {
  const accountLabel = userEmail ?? roleLabel;

  return (
    <header className="sticky top-0 z-40 border-b border-border-subtle bg-bg-default/95 backdrop-blur supports-[backdrop-filter]:bg-bg-default/85">
      <div
        className={cn(
          "mx-auto flex min-h-16 w-full items-center gap-3 px-4 sm:px-6",
          maxWidthClassName,
        )}
      >
        <Link
          href={homeHref}
          aria-label={homeLabel}
          className="group flex min-w-0 items-center gap-2 rounded-lg py-1 pr-2 text-content-emphasis transition-all duration-150 hover:text-content-emphasis focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-border-subtle"
        >
          <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-border-subtle bg-bg-default transition-all duration-150 group-hover:bg-bg-muted group-hover:ring-4 group-hover:ring-border-subtle">
            <Logo className="size-3" />
          </span>
          <span className="hidden min-w-0 flex-col sm:flex">
            <span className="truncate text-sm font-semibold leading-5 text-content-emphasis">
              Maths Tasks
            </span>
            <span className="truncate text-xs font-medium leading-4 text-content-subtle">
              {roleLabel}
            </span>
          </span>
        </Link>

        <span
          className="hidden h-6 w-px shrink-0 bg-border-subtle md:block"
          aria-hidden="true"
        />

        <div className="min-w-0 flex-1">{nav}</div>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg border border-border-subtle bg-bg-default p-1">
            {controls}
          </div>
          <span
            className="hidden size-8 shrink-0 place-items-center rounded-full border border-border-subtle bg-bg-muted text-xs font-medium tabular-nums text-content-default sm:grid"
            role="img"
            aria-label={`${accountLabel} account`}
            title={accountLabel}
          >
            {accountInitial(userEmail, roleLabel)}
          </span>
        </div>
      </div>
    </header>
  );
}
