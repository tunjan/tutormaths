"use client";

import { Link } from "next-view-transitions";
import { usePathname } from "next/navigation";
import { BookOpenText, CalendarDays, Menu, NotebookPen } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const links = [
  { href: "/student", label: "Practice", icon: NotebookPen, exact: true },
  { href: "/student/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/student/library", label: "Library", icon: BookOpenText },
];

function isActive(pathname: string, href: string, exact?: boolean) {
  return exact ? pathname === href : pathname.startsWith(href);
}

export function StudentNav({
  presentation,
}: {
  presentation: "sidebar" | "mobile";
}) {
  const pathname = usePathname();

  if (presentation === "sidebar") {
    return (
      <nav className="flex items-center gap-1" aria-label="Primary">
        {links.map((l) => {
          const active = isActive(pathname, l.href, l.exact);
          const Icon = l.icon;
          return (
            <Link
              key={l.href}
              href={l.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-3 py-2 text-body transition-colors duration-fast hover:bg-bg-muted hover:text-content-emphasis focus-visible:outline-none",
                active
                  ? "bg-bg-subtle text-content-emphasis"
                  : "text-content-default",
              )}
            >
              <Icon className="size-4" strokeWidth={1.5} aria-hidden />
              {l.label}
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
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
            const Icon = l.icon;
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-2 rounded-full px-3 py-2 text-body transition-colors duration-fast hover:bg-bg-muted hover:text-content-emphasis focus-visible:outline-none",
                    active
                      ? "bg-bg-subtle text-content-emphasis"
                      : "text-content-default",
                  )}
                >
                  <Icon className="size-4" strokeWidth={1.5} aria-hidden />
                  {l.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
