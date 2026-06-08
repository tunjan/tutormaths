"use client";

import { Link } from "next-view-transitions";
import { usePathname } from "next/navigation";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
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

type Rect = { left: number; width: number };

/**
 * Tutor navigation. Two motion languages share one row of tabs:
 *
 *  · a gray "wash" (surface) that slides to follow the pointer, and
 *  · an ink "rail" (a 2px foreground underline) that slides to mark the
 *    active route.
 *
 * Both are absolutely-positioned siblings measured from each tab's box, so
 * the movement is a single GPU-friendly transition rather than per-tab fills.
 * This keeps the OpenAI grayscale identity — gray for hover, ink for state —
 * while making the active position feel physical instead of static.
 */
export function TutorNav() {
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  const [activeRect, setActiveRect] = useState<Rect | null>(null);
  const [hoverRect, setHoverRect] = useState<Rect | null>(null);
  const [hovering, setHovering] = useState(false);

  const activeIndex = links.findIndex((l) =>
    isActive(pathname, l.href, l.exact),
  );

  // Re-measure the active tab whenever the route changes or the row reflows
  // (font swap, viewport resize), so the rail never drifts off its label.
  const measure = useCallback(() => {
    const el = itemRefs.current[activeIndex];
    setActiveRect(el ? { left: el.offsetLeft, width: el.offsetWidth } : null);
  }, [activeIndex]);

  useLayoutEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  return (
    <>
      {/* Desktop: sliding wash + ink rail */}
      <nav
        ref={navRef}
        onMouseLeave={() => setHovering(false)}
        className="relative hidden items-center sm:flex"
        aria-label="Primary"
      >
        {/* Hover wash — gray surface that tracks the pointer. */}
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute top-1/2 h-8 -translate-y-1/2 rounded-lg bg-accent transition-[left,width,opacity] duration-200 ease-out",
            hovering && hoverRect ? "opacity-100" : "opacity-0",
          )}
          style={hoverRect ? { left: hoverRect.left, width: hoverRect.width } : undefined}
        />
        {/* Active ink rail — a 2px foreground underline that marks the route. */}
        <span
          aria-hidden
          className="pointer-events-none absolute bottom-0 h-0.5 rounded-full bg-foreground transition-[left,width,opacity] duration-300 ease-out"
          style={
            activeRect
              ? { left: activeRect.left + 12, width: activeRect.width - 24, opacity: 1 }
              : { opacity: 0 }
          }
        />
        {links.map((l, i) => (
          <Link
            key={l.href}
            ref={(el) => {
              itemRefs.current[i] = el;
            }}
            href={l.href}
            onMouseEnter={(e) => {
              setHoverRect({
                left: e.currentTarget.offsetLeft,
                width: e.currentTarget.offsetWidth,
              });
              setHovering(true);
            }}
            aria-current={activeIndex === i ? "page" : undefined}
            className={cn(
              "relative z-10 rounded-lg px-3 py-1.5 text-sm transition-colors duration-200",
              activeIndex === i
                ? "font-medium text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {l.label}
          </Link>
        ))}
      </nav>

      {/* Mobile: a menu popover. Active item carries the same ink rail, here as
          a left edge bar so the language stays consistent across breakpoints. */}
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
                        "relative block rounded-md py-2 pr-3 pl-4 text-sm transition-colors hover:bg-accent",
                        active
                          ? "font-medium text-foreground"
                          : "text-muted-foreground",
                      )}
                    >
                      {active && (
                        <span
                          aria-hidden
                          className="absolute top-1/2 left-1 h-4 w-0.5 -translate-y-1/2 rounded-full bg-foreground"
                        />
                      )}
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
