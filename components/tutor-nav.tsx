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
  return exact
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);
}

export function TutorNav({
  presentation,
}: {
  presentation: "header" | "mobile";
}) {
  const pathname = usePathname();

  if (presentation === "header") {
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
                "inline-flex h-8 items-center gap-2 rounded-sm border border-transparent px-3 text-label transition-[background-color,border-color,color] duration-fast focus-visible:outline-none",
                active
                  ? "border-border-strong bg-surface-selected font-medium text-accent-ink hover:bg-surface-selected"
                  : "text-content-default hover:bg-surface-hover hover:text-content-emphasis",
              )}
            >
              <Icon className="size-4" strokeWidth={1.75} aria-hidden />
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
                    "relative flex min-h-11 items-center gap-2.5 rounded-sm border border-transparent px-3 text-label transition-[background-color,border-color,color] duration-fast focus-visible:outline-none",
                    active
                      ? "border-border-strong bg-surface-selected font-medium text-accent-ink hover:bg-surface-selected"
                      : "text-content-default hover:bg-surface-hover hover:text-content-emphasis",
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
