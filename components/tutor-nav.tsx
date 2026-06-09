"use client";

import { Link } from "next-view-transitions";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const links = [
  { href: "/tutor", label: "Dashboard", exact: true },
  { href: "/tutor/students", label: "Students" },
];

function isActive(pathname: string, href: string, exact?: boolean) {
  return exact ? pathname === href : pathname.startsWith(href);
}

/**
 * Tutor navigation: a quiet row of pill tabs. The active route carries a soft
 * inset wash; the rest are ink-soft until hovered. On small screens it collapses
 * into a menu popover.
 */
export function TutorNav() {
  const pathname = usePathname();

  return (
    <>
      <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
        {links.map((l) => {
          const active = isActive(pathname, l.href, l.exact);
          return (
            <Link
              key={l.href}
              href={l.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "px-2 py-1.5 text-sm transition-colors",
                active
                  ? "text-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {l.label}
            </Link>
          );
        })}
      </nav>

      {/* Mobile: a menu popover. */}
      <div className="md:hidden">
        <Popover>
          <PopoverTrigger
            render={
              <Button variant="ghost" size="icon-sm" aria-label="Open menu">
                <Menu />
              </Button>
            }
          />
          <PopoverContent align="start" className="w-56 p-1.5">
            <ul className="flex flex-col">
              {links.map((l) => {
                const active = isActive(pathname, l.href, l.exact);
                return (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "relative block rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted",
                        active
                          ? "bg-muted font-semibold text-foreground"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {l.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </PopoverContent>
        </Popover>
      </div>
    </>
  );
}
