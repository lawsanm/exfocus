import { CheckCircle2, Timer } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AnimatedNumber } from "@/components/motion/animated-number";

export function TodayProductivityTiles({
  todayFocusMinutes,
  todayFocusSessionCount,
  dailyGoalHours,
}: {
  todayFocusMinutes: number;
  todayFocusSessionCount: number;
  dailyGoalHours: number;
}) {
  const dailyGoalMinutes = dailyGoalHours * 60;
  const productivity =
    dailyGoalMinutes > 0
      ? Math.min(100, Math.round((todayFocusMinutes / dailyGoalMinutes) * 100))
      : 0;
  const timeRemainingMinutes = Math.max(0, Math.round(dailyGoalMinutes - todayFocusMinutes));

  return (
    <div className="grid grid-cols-3 gap-4">
      <Card className="hover-lift">
        <CardContent className="flex items-center gap-3">
          <span className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-xl">
            <Timer className="size-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-2xl font-semibold tabular-nums">
              <AnimatedNumber value={todayFocusSessionCount} />
            </p>
            <p className="text-muted-foreground text-xs">Focus sessions today</p>
          </div>
        </CardContent>
      </Card>
      <Card className="hover-lift">
        <CardContent className="flex items-center gap-3">
          <span className="bg-success/15 text-success flex size-10 shrink-0 items-center justify-center rounded-xl">
            <CheckCircle2 className="size-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-2xl font-semibold tabular-nums">
              <AnimatedNumber value={timeRemainingMinutes} suffix="m" />
            </p>
            <p className="text-muted-foreground text-xs">Left toward today&apos;s goal</p>
          </div>
        </CardContent>
      </Card>
      <Card className="hover-lift">
        <CardContent className="space-y-1.5">
          <div className="text-muted-foreground flex items-center justify-between text-xs">
            <span>Daily productivity</span>
            <span>{productivity}%</span>
          </div>
          <Progress value={productivity} />
        </CardContent>
      </Card>
    </div>
  );
}
