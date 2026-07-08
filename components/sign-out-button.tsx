import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
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
