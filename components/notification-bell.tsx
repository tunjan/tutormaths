"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatDateTime } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface NotificationRow {
  id: string;
  body: string;
  created_at: string;
  read_at: string | null;
}

/**
 * In-app notifications via Supabase Realtime. Loads the latest notifications,
 * then subscribes to INSERTs scoped to this recipient. RLS guarantees a client
 * only ever sees its own rows.
 */
export function NotificationBell({ userId }: { userId: string }) {
  const [supabase] = useState(() => createClient());
  const [items, setItems] = useState<NotificationRow[]>([]);

  useEffect(() => {
    let active = true;

    supabase
      .from("notifications")
      .select("id, body, created_at, read_at")
      .order("created_at", { ascending: false })
      .limit(20)
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
          setItems((prev) => [row, ...prev].slice(0, 20));
        },
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [supabase, userId]);

  const unread = items.filter((i) => !i.read_at).length;

  async function markAllRead() {
    if (unread === 0) return;
    const ids = items.filter((i) => !i.read_at).map((i) => i.id);
    const now = new Date().toISOString();
    setItems((prev) => prev.map((i) => ({ ...i, read_at: i.read_at ?? now })));
    await supabase.from("notifications").update({ read_at: now }).in("id", ids);
  }

  return (
    <Popover onOpenChange={(open) => open && markAllRead()}>
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
        <div className="border-b border-border px-4 py-3 text-sm font-medium">
          Notifications
        </div>
        <ul className="max-h-96 divide-y divide-border overflow-y-auto">
          {items.length === 0 && (
            <li className="px-4 py-8 text-center text-sm text-muted-foreground">
              No notifications yet.
            </li>
          )}
          {items.map((n) => (
            <li key={n.id} className="px-4 py-3">
              <p className="text-sm">{n.body}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {formatDateTime(n.created_at)}
              </p>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
