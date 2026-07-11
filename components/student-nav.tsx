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
  { href: "/student", label: "Practice", exact: true },
  { href: "/student/calendar", label: "Calendar" },
  { href: "/student/library", label: "Library" },
];

function isActive(pathname: string, href: string, exact?: boolean) {
  return exact ? pathname === href : pathname.startsWith(href);
}

export function StudentNav() {
  const pathname = usePathname();

  return (
    <>
      <nav className="hidden h-16 items-center gap-7 md:flex" aria-label="Primary">
        {links.map((l) => {
          const active = isActive(pathname, l.href, l.exact);
          return (
            <Link
              key={l.href}
              href={l.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative inline-flex h-16 items-center px-0.5 text-sm font-medium text-content-subtle transition-colors duration-150 after:absolute after:inset-x-0 after:bottom-0 after:h-px after:origin-center after:scale-x-0 after:bg-content-emphasis after:transition-transform after:duration-150 hover:text-content-emphasis focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-border-subtle",
                active
                  ? "text-content-emphasis after:scale-x-100"
                  : "text-content-subtle",
              )}
            >
              {l.label}
            </Link>
          );
        })}
      </nav>

      <div className="md:hidden">
        <Popover>
          <PopoverTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Open menu"
                title="Open menu"
              >
                <Menu />
              </Button>
            }
          />
          <PopoverContent align="end" sideOffset={8} className="w-56 p-2">
            <ul className="flex flex-col gap-1">
              {links.map((l) => {
                const active = isActive(pathname, l.href, l.exact);
                return (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex h-10 items-center rounded-lg px-3 text-sm font-medium text-content-default transition-colors duration-150 hover:bg-bg-muted hover:text-content-emphasis focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-border-subtle",
                        active
                          ? "bg-bg-muted text-content-emphasis"
                          : "text-content-default",
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
