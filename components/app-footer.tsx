import { Link } from "next-view-transitions";

/** A compact utility footer for the private workspace. */
export function AppFooter({ homeHref }: { homeHref: string }) {
  return (
    <footer className="mt-auto border-t border-border-strong bg-bg-subtle">
      <div className="mx-auto flex w-full max-w-[1248px] flex-col gap-3 pt-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] text-caption text-content-default sm:flex-row sm:items-center sm:justify-between sm:pl-[max(1.5rem,env(safe-area-inset-left))] sm:pr-[max(1.5rem,env(safe-area-inset-right))]">
        <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
          <Link
            href={homeHref}
            className="font-heading font-semibold text-content-emphasis focus-visible:outline-none"
            translate="no"
          >
            Maths Tasks
          </Link>
          <span
            className="hidden h-3 w-px bg-border-strong sm:block"
            aria-hidden
          />
          <p className="text-content-subtle">Private mathematics workspace</p>
        </div>
        <p className="font-metric">© {new Date().getFullYear()}</p>
      </div>
    </footer>
  );
}
