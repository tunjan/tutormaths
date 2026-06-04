"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatDateTime, relativeTime } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface NotificationRow {
  id: string;
  body: string;
  created_at: string;
  read_at: string | null;
  assignment_id: string | null;
}

/**
 * In-app notifications via Supabase Realtime. Loads the latest, then subscribes
 * to INSERTs scoped to this recipient. Items deep-link to the relevant
 * assignment and are marked read individually (opening the popover no longer
 * silently clears everything); there is an explicit "Mark all as read".
 */
export function NotificationBell({
  userId,
  role,
}: {
  userId: string;
  role: "tutor" | "student";
}) {
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const [items, setItems] = useState<NotificationRow[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let active = true;

    supabase
      .from("notifications")
      .select("id, body, created_at, read_at, assignment_id")
      .order("created_at", { ascending: false })
      .limit(30)
      .then(({ data }) => {
        if (active && data) setItems(data);
      });

    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `recipient_id=eq.${userId}`,
        },
        (payload) => {
          const row = payload.new as NotificationRow;
          setItems((prev) => [row, ...prev].slice(0, 30));
        },
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [supabase, userId]);

  const unread = items.filter((i) => !i.read_at).length;

  async function markRead(ids: string[]) {
    if (ids.length === 0) return;
    const now = new Date().toISOString();
    setItems((prev) =>
      prev.map((i) =>
        ids.includes(i.id) ? { ...i, read_at: i.read_at ?? now } : i,
      ),
    );
    await supabase.from("notifications").update({ read_at: now }).in("id", ids);
  }

  function markAllRead() {
    void markRead(items.filter((i) => !i.read_at).map((i) => i.id));
  }

  function onItemClick(n: NotificationRow) {
    if (!n.read_at) void markRead([n.id]);
    if (n.assignment_id) {
      setOpen(false);
      router.push(`/${role}/assignments/${n.assignment_id}`);
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            className="relative"
            aria-label={
              unread > 0 ? `Notifications (${unread} unread)` : "Notifications"
            }
          >
            <Bell />
            {unread > 0 && (
              <Badge className="absolute -top-1 -right-1 h-4 min-w-4 justify-center px-1 text-[10px] tabular-nums">
                {unread}
              </Badge>
            )}
          </Button>
        }
      />
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <span className="text-sm font-medium">Notifications</span>
          {unread > 0 && (
            <button
              type="button"
              onClick={markAllRead}
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              Mark all as read
            </button>
          )}
        </div>
        <ul className="max-h-96 divide-y divide-border overflow-y-auto">
          {items.length === 0 && (
            <li className="px-4 py-8 text-center text-sm text-muted-foreground">
              No notifications yet.
            </li>
          )}
          {items.map((n) => {
            const clickable = Boolean(n.assignment_id);
            return (
              <li key={n.id}>
                <button
                  type="button"
                  onClick={() => onItemClick(n)}
                  disabled={!clickable && !!n.read_at}
                  className={cn(
                    "flex w-full flex-col items-start gap-0.5 px-4 py-3 text-left transition-colors",
                    clickable && "hover:bg-muted/50",
                    !n.read_at && "bg-primary/5",
                  )}
                >
                  <span className="flex items-start gap-2 text-sm">
                    {!n.read_at && (
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                    )}
                    <span>{n.body}</span>
                  </span>
                  <span
                    className="pl-0 text-xs text-muted-foreground"
                    title={formatDateTime(n.created_at)}
                  >
                    {relativeTime(n.created_at)}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
