"use client";

import { Link } from "next-view-transitions";
import { usePathname } from "next/navigation";
import { BookOpenText, CalendarDays, NotebookPen } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/student", label: "Practice", icon: NotebookPen, exact: true },
  { href: "/student/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/student/library", label: "Library", icon: BookOpenText },
];

function isActive(pathname: string, href: string, exact?: boolean) {
  return exact ? pathname === href : pathname.startsWith(href);
}

/**
 * Vertical primary-sidebar nav list. Used both in the fixed desktop sidebar
 * and inside the mobile Sheet — the parent supplies the landmark wrapper.
 */
export function StudentNav() {
  const pathname = usePathname();

  return (
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
                "flex h-9 items-center gap-2 rounded-md px-3 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 outline-none",
                active
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
              )}
            >
              <Icon className="size-4 shrink-0" strokeWidth={1.75} aria-hidden />
              {l.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
