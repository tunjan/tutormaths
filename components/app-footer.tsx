import { Link } from "next-view-transitions";

/** A compact utility footer for the private workspace. */
export function AppFooter({ homeHref }: { homeHref: string }) {
  return (
    <footer className="mt-auto border-t border-border bg-background">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-2 px-4 py-8 text-caption text-content-subtle sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-3">
          <Link
            href={homeHref}
            className="font-heading font-semibold text-content-emphasis focus-visible:outline-none"
          >
            Maths Tasks
          </Link>
          <span className="hidden h-3 w-px bg-border sm:block" aria-hidden />
          <p className="hidden sm:block">Private mathematics workspace</p>
        </div>
        <p>© {new Date().getFullYear()}</p>
      </div>
    </footer>
  );
}
