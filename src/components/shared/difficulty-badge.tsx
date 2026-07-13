import { Badge } from "@/components/ui/badge";
import { DIFFICULTY_OPTIONS } from "@/lib/constants";

const DIFFICULTY_CLASS: Record<string, string> = {
  EASY: "bg-priority-low/15 text-priority-low",
  MEDIUM: "bg-priority-medium/15 text-priority-medium-foreground",
  HARD: "bg-priority-high/15 text-priority-high",
  VERY_HARD: "bg-priority-critical/15 text-priority-critical",
};

export function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const label = DIFFICULTY_OPTIONS.find((d) => d.value === difficulty)?.label ?? difficulty;
  return (
    <Badge variant="outline" className={`border-transparent ${DIFFICULTY_CLASS[difficulty] ?? ""}`}>
      {label}
    </Badge>
  );
}
