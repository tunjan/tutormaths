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
  { href: "/tutor/assignments/new", label: "New assignment" },
  { href: "/tutor/settings", label: "Settings" },
];

function isActive(pathname: string, href: string, exact?: boolean) {
  return exact ? pathname === href : pathname.startsWith(href);
}

export function TutorNav() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop: quiet pill tabs with a filled active state */}
      <nav className="hidden items-center gap-1 text-sm sm:flex">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            aria-current={isActive(pathname, l.href, l.exact) ? "page" : undefined}
            className={cn(
              "rounded-lg px-3 py-1.5 transition-colors",
              isActive(pathname, l.href, l.exact)
                ? "bg-secondary font-medium text-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            {l.label}
          </Link>
        ))}
      </nav>

      {/* Mobile: a menu popover */}
      <div className="sm:hidden">
        <Popover>
          {/* render= delegates to Button which provides focus-visible styling,
              consistent with the pattern in notification-bell.tsx */}
          <PopoverTrigger
            render={
              <Button variant="ghost" size="icon-sm" aria-label="Open menu">
                <Menu />
              </Button>
            }
          />
          <PopoverContent align="start" className="w-52 p-1.5">
            <ul className="flex flex-col">
              {links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    aria-current={
                      isActive(pathname, l.href, l.exact) ? "page" : undefined
                    }
                    className={cn(
                      "block rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted",
                      isActive(pathname, l.href, l.exact)
                        ? "font-medium text-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </PopoverContent>
        </Popover>
      </div>
    </>
  );
}
