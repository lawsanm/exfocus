import Link from "next/link";
import { CalendarClock, CheckCircle2, Circle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { TodayStudySessionDto } from "@/infrastructure/repositories/dashboard-repository";

const PRIORITY_BADGE_CLASS: Record<TodayStudySessionDto["priorityLevel"], string> = {
  CRITICAL: "bg-priority-critical/15 text-priority-critical border-transparent",
  HIGH: "bg-priority-high/15 text-priority-high border-transparent",
  MEDIUM: "bg-priority-medium/15 text-priority-medium-foreground border-transparent",
  LOW: "bg-priority-low/15 text-priority-low border-transparent",
};

export function TodayPlanCard({ sessions }: { sessions: TodayStudySessionDto[] }) {
  const totalMinutes = sessions.reduce((sum, s) => sum + s.durationMinutes, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Today&apos;s study plan</CardTitle>
      </CardHeader>
      <CardContent>
        {sessions.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <CalendarClock className="text-muted-foreground size-8" aria-hidden="true" />
            <p className="text-muted-foreground text-sm">
              No study sessions scheduled for today yet.
              <br />
              Add subjects and deadlines, then generate a plan.
            </p>
            <Link href="/subjects" className="text-primary text-sm font-medium hover:underline">
              Add a subject
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            <p className="text-muted-foreground mb-2 text-xs">
              {sessions.length} sessions · {(totalMinutes / 60).toFixed(1)}h planned
            </p>
            {sessions.map((session) => (
              <div
                key={session.id}
                className="hover:bg-accent/50 flex items-center gap-3 rounded-md px-2 py-2"
              >
                {session.status === "COMPLETED" ? (
                  <CheckCircle2 className="text-success size-4 shrink-0" aria-hidden="true" />
                ) : (
                  <Circle
                    className="size-4 shrink-0"
                    style={{ color: session.subjectColor }}
                    aria-hidden="true"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      "truncate text-sm font-medium",
                      session.status === "COMPLETED" && "text-muted-foreground line-through",
                    )}
                  >
                    {session.subjectName} — {session.topicLabel}
                  </p>
                </div>
                <span className="text-muted-foreground shrink-0 text-xs">
                  {session.durationMinutes} min
                </span>
                <Badge
                  variant="outline"
                  className={cn("shrink-0", PRIORITY_BADGE_CLASS[session.priorityLevel])}
                >
                  {session.priorityLevel}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
