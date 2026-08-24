"use client";

import { Link } from "next-view-transitions";
import { usePathname } from "next/navigation";
import {
  BookOpenText,
  LayoutDashboard,
  ListChecks,
  Menu,
  UsersRound,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const links = [
  { href: "/tutor", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/tutor/assignments", label: "Assignments", icon: ListChecks },
  { href: "/tutor/students", label: "Students", icon: UsersRound },
  { href: "/tutor/library", label: "Library", icon: BookOpenText },
];

function isActive(pathname: string, href: string, exact?: boolean) {
  return exact ? pathname === href : pathname.startsWith(href);
}

export function TutorNav({
  presentation,
}: {
  presentation: "header" | "mobile";
}) {
  const pathname = usePathname();

  if (presentation === "header") {
    return (
      <nav
        className="flex items-center gap-0.5"
        aria-label="Primary"
      >
        {links.map((l) => {
          const active = isActive(pathname, l.href, l.exact);
          const Icon = l.icon;
          return (
            <Link
              key={l.href}
              href={l.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-body transition-[background-color,color] duration-fast hover:bg-bg-subtle hover:text-content-emphasis focus-visible:outline-none",
                active
                  ? "bg-bg-subtle font-medium text-content-emphasis"
                  : "text-content-default",
              )}
            >
              <Icon className="size-3.5" strokeWidth={1.75} aria-hidden />
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
                    "flex min-h-11 items-center gap-2 rounded-sm px-3 text-label transition-[background-color,color] duration-fast hover:bg-bg-subtle hover:text-content-emphasis focus-visible:outline-none",
                    active
                      ? "bg-bg-subtle font-medium text-content-emphasis"
                      : "text-content-default",
                  )}
                >
                  <Icon className="size-4" strokeWidth={1.75} aria-hidden />
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
