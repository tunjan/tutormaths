"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";

function accountInitial(email: string | null | undefined, fallback: string) {
  const source = email?.trim() || fallback;
  return source.charAt(0).toUpperCase();
}

export function AccountMenu({
  roleLabel,
  userEmail,
  actions,
}: {
  roleLabel: string;
  userEmail?: string | null;
  actions: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const accountLabel = userEmail ?? roleLabel;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            className="px-2"
            aria-label={`Open ${accountLabel} account menu`}
            title={accountLabel}
          >
            <span className="grid size-6 shrink-0 place-items-center rounded-full border border-border bg-card text-caption text-content-default">
              {accountInitial(userEmail, roleLabel)}
            </span>
            <ChevronDown
              data-icon="inline-end"
              className="text-content-muted"
              strokeWidth={1.75}
              aria-hidden
            />
          </Button>
        }
      />
      <PopoverContent align="end" sideOffset={8} className="w-72 p-2">
        <PopoverHeader className="px-2 py-2">
          <PopoverTitle className="truncate">{accountLabel}</PopoverTitle>
          <PopoverDescription>{roleLabel}</PopoverDescription>
        </PopoverHeader>
        <Separator className="my-2" />
        <div
          className="flex flex-col gap-1"
          onClick={() => setOpen(false)}
        >
          {actions}
        </div>
      </PopoverContent>
    </Popover>
  );
}
