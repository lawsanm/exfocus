import { CheckCircle2, ClipboardList, FileText, GraduationCap, ListTodo } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { CompletedTaskCounts } from "@/infrastructure/repositories/analytics-repository";

export function CompletedTasksSummary({ counts }: { counts: CompletedTaskCounts }) {
  const total = counts.assignments + counts.exams + counts.quizzes + counts.projects;
  const tiles = [
    { label: "Assignments", value: counts.assignments, icon: ListTodo },
    { label: "Exams", value: counts.exams, icon: GraduationCap },
    { label: "Quizzes", value: counts.quizzes, icon: ClipboardList },
    { label: "Projects", value: counts.projects, icon: FileText },
  ];

  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="bg-success/15 text-success flex size-10 shrink-0 items-center justify-center rounded-full">
            <CheckCircle2 className="size-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-2xl font-semibold tabular-nums">{total}</p>
            <p className="text-muted-foreground text-xs">Total completed</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {tiles.map((tile) => (
            <div key={tile.label} className="flex items-center gap-2 text-sm">
              <tile.icon className="text-muted-foreground size-4" aria-hidden="true" />
              <span className="font-medium tabular-nums">{tile.value}</span>
              <span className="text-muted-foreground">{tile.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
