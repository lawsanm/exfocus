import { CalendarCheck, ClipboardList, FileText, GraduationCap, ListTodo } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { UpcomingDeadlineDto } from "@/infrastructure/repositories/dashboard-repository";

const TYPE_ICON: Record<UpcomingDeadlineDto["type"], typeof ListTodo> = {
  ASSIGNMENT: ListTodo,
  EXAM: GraduationCap,
  QUIZ: ClipboardList,
  PROJECT: FileText,
};

function urgency(daysRemaining: number): { label: string; className: string } {
  if (daysRemaining <= 1) {
    return { label: "Critical", className: "bg-priority-critical/15 text-priority-critical" };
  }
  if (daysRemaining <= 3) {
    return { label: "High", className: "bg-priority-high/15 text-priority-high" };
  }
  if (daysRemaining <= 7) {
    return { label: "Medium", className: "bg-priority-medium/15 text-priority-medium-foreground" };
  }
  return { label: "Low", className: "bg-priority-low/15 text-priority-low" };
}

function formatDaysRemaining(days: number): string {
  if (days <= 0) return "Today";
  if (days === 1) return "Tomorrow";
  return `In ${days} days`;
}

export function UpcomingDeadlinesCard({ deadlines }: { deadlines: UpcomingDeadlineDto[] }) {
  return (
    <Card className="hover-lift h-full">
      <CardHeader>
        <CardTitle>Upcoming deadlines</CardTitle>
      </CardHeader>
      <CardContent>
        {deadlines.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <CalendarCheck className="text-muted-foreground size-8" aria-hidden="true" />
            <p className="text-muted-foreground text-sm">
              Nothing due in the next two weeks. Enjoy the breathing room.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {deadlines.map((deadline) => {
              const Icon = TYPE_ICON[deadline.type];
              const { label, className } = urgency(deadline.daysRemaining);
              return (
                <div
                  key={`${deadline.type}-${deadline.id}`}
                  className="hover:bg-accent/50 flex items-center gap-3 rounded-md px-2 py-2"
                >
                  <span
                    className="flex size-8 shrink-0 items-center justify-center rounded-full"
                    style={{
                      backgroundColor: `${deadline.subjectColor}26`,
                      color: deadline.subjectColor,
                    }}
                  >
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{deadline.title}</p>
                    <p className="text-muted-foreground truncate text-xs">
                      {deadline.subjectName} · {formatDaysRemaining(deadline.daysRemaining)}
                    </p>
                  </div>
                  <Badge variant="outline" className={cn("shrink-0 border-transparent", className)}>
                    {label}
                  </Badge>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
