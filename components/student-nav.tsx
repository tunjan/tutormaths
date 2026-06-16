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
      <nav className="hidden items-center gap-4 md:flex" aria-label="Primary">
        {links.map((l) => {
          const active = isActive(pathname, l.href, l.exact);
          return (
            <Link
              key={l.href}
              href={l.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "navbar-link text-sm font-medium transition-colors",
                active
                  ? "text-[#1a1a1a] dark:text-[#f4f1ea] font-semibold"
                  : "text-[#5b564d] hover:text-[#1a1a1a] dark:text-[#b3ac9f] dark:hover:text-[#f4f1ea]",
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
                        "relative block rounded-[6px] px-3 py-2 text-sm transition-colors",
                        active
                          ? "bg-[#efebe1] dark:bg-[#1d1b16] font-semibold text-[#1a1a1a] dark:text-[#f4f1ea]"
                          : "text-[#5b564d] hover:bg-[#f4f1ea] dark:text-[#b3ac9f] dark:hover:bg-[#1a1a1a]",
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
