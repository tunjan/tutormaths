import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SignOutButton({ presentation = "icon" }: { presentation?: "icon" | "menu" }) {
  if (presentation === "menu") {
    return (
      <form action="/auth/signout" method="post">
        <Button
          type="submit"
          variant="ghost"
          size="default"
          className="w-full justify-start"
        >
          <LogOut data-icon="inline-start" />
          Sign out
        </Button>
      </form>
    );
  }

  return (
    <form action="/auth/signout" method="post">
      <Button
        type="submit"
        variant="ghost"
        size="icon-sm"
        aria-label="Sign out"
        title="Sign out"
      >
        <LogOut />
      </Button>
    </form>
  );
}
