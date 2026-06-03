import { Badge } from "@/components/ui/badge";
import { type DueState, dueLabel } from "@/lib/format";

const styles: Record<DueState, string> = {
  done: "border-transparent bg-primary/10 text-primary",
  overdue: "border-transparent bg-destructive/10 text-destructive",
  "due-soon": "border-transparent bg-amber-100 text-amber-700",
  upcoming: "border-border text-muted-foreground",
};

export function DueBadge({ state }: { state: DueState }) {
  return (
    <Badge variant="outline" className={styles[state]}>
      {dueLabel(state)}
    </Badge>
  );
}
