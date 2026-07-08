"use client";

import { Link } from "next-view-transitions";
import { usePathname } from "next/navigation";
import { BookOpen, Calendar, Home, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const links = [
  { href: "/student", label: "Practice", exact: true, icon: Home },
  { href: "/student/calendar", label: "Calendar", icon: Calendar },
  { href: "/student/library", label: "Library", icon: BookOpen },
];

function isActive(pathname: string, href: string, exact?: boolean) {
  return exact ? pathname === href : pathname.startsWith(href);
}

export function StudentNav() {
  const pathname = usePathname();

  return (
    <>
      <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
        {links.map((l) => {
          const active = isActive(pathname, l.href, l.exact);
          const Icon = l.icon;
          return (
            <Link
              key={l.href}
              href={l.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium text-content-default transition-all duration-150 hover:bg-content-emphasis/5 hover:text-content-emphasis focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-border-subtle",
                active
                  ? "bg-bg-info text-content-info hover:bg-bg-info hover:text-content-info"
                  : "text-content-default",
              )}
            >
              <Icon className="size-4 shrink-0" strokeWidth={1.75} />
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
          <PopoverContent align="start" sideOffset={8} className="w-64 p-1">
            <div className="px-3 py-2 text-xs font-medium text-content-subtle">
              Menu
            </div>
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
                        "flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium text-content-default transition-all duration-150 hover:bg-content-emphasis/5 hover:text-content-emphasis focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-border-subtle",
                        active
                          ? "bg-bg-info text-content-info hover:bg-bg-info hover:text-content-info"
                          : "text-content-default",
                      )}
                    >
                      <Icon className="size-4 shrink-0" strokeWidth={1.75} />
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
