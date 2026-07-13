import { Clock, Flame, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AnimatedNumber } from "@/components/motion/animated-number";
import { Stagger, StaggerItem } from "@/components/motion/motion-primitives";
import { getLevelProgress } from "@/application/services/gamification";

export function StatTiles({
  xp,
  currentStreak,
  weeklyFocusMinutes,
  weeklyGoalHours,
  monthlyFocusMinutes,
}: {
  xp: number;
  currentStreak: number;
  weeklyFocusMinutes: number;
  weeklyGoalHours: number;
  monthlyFocusMinutes: number;
}) {
  const level = getLevelProgress(xp);
  const weeklyGoalMinutes = weeklyGoalHours * 60;
  const weeklyProgress =
    weeklyGoalMinutes > 0 ? Math.min(1, weeklyFocusMinutes / weeklyGoalMinutes) : 0;
  const weeklyHours = weeklyFocusMinutes / 60;
  const monthlyHours = monthlyFocusMinutes / 60;

  return (
    <Stagger className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StaggerItem>
        <Card className="hover-lift h-full">
          <CardContent className="flex items-center gap-3">
            <span className="bg-streak/15 text-streak flex size-10 shrink-0 items-center justify-center rounded-xl">
              <Flame className="size-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-2xl font-semibold tabular-nums">
                <AnimatedNumber value={currentStreak} />
              </p>
              <p className="text-muted-foreground text-xs">Day streak</p>
            </div>
          </CardContent>
        </Card>
      </StaggerItem>

      <StaggerItem>
        <Card className="hover-lift h-full">
          <CardContent className="flex items-center gap-3">
            <span className="bg-xp/15 text-xp-foreground flex size-10 shrink-0 items-center justify-center rounded-xl">
              <Star className="size-5 fill-current" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-2xl font-semibold tabular-nums">
                Lvl <AnimatedNumber value={level.level} />
              </p>
              <Progress value={level.progress * 100} className="mt-1 h-1.5" />
            </div>
          </CardContent>
        </Card>
      </StaggerItem>

      <StaggerItem>
        <Card className="hover-lift h-full">
          <CardContent className="flex items-center gap-3">
            <span className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-xl">
              <Clock className="size-5" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-2xl font-semibold tabular-nums">
                <AnimatedNumber value={weeklyHours} decimals={1} />
                <span className="text-muted-foreground text-sm font-normal">
                  {" "}
                  / {weeklyGoalHours}h
                </span>
              </p>
              <p className="text-muted-foreground text-xs">This week</p>
              <Progress value={weeklyProgress * 100} className="mt-1 h-1.5" />
            </div>
          </CardContent>
        </Card>
      </StaggerItem>

      <StaggerItem>
        <Card className="hover-lift h-full">
          <CardContent className="flex items-center gap-3">
            <span className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-xl">
              <Clock className="size-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-2xl font-semibold tabular-nums">
                <AnimatedNumber value={monthlyHours} decimals={1} suffix="h" />
              </p>
              <p className="text-muted-foreground text-xs">This month</p>
            </div>
          </CardContent>
        </Card>
      </StaggerItem>
    </Stagger>
  );
}
