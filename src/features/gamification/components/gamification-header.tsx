import { Coins, Flame, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getLevelProgress } from "@/application/services/gamification";

export function GamificationHeader({
  xp,
  coins,
  currentStreak,
  longestStreak,
}: {
  xp: number;
  coins: number;
  currentStreak: number;
  longestStreak: number;
}) {
  const level = getLevelProgress(xp);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <Card className="sm:col-span-1">
        <CardContent className="space-y-2 py-4">
          <div className="flex items-center gap-2">
            <span className="bg-xp/15 text-xp-foreground flex size-9 items-center justify-center rounded-full">
              <Star className="size-4 fill-current" aria-hidden="true" />
            </span>
            <div>
              <p className="text-xl font-semibold tabular-nums">Level {level.level}</p>
              <p className="text-muted-foreground text-xs">
                {level.xpIntoLevel} / {level.xpForNextLevel} XP
              </p>
            </div>
          </div>
          <Progress value={level.progress * 100} />
        </CardContent>
      </Card>
      <Card>
        <CardContent className="flex items-center gap-3 py-4">
          <span className="bg-xp/15 text-xp-foreground flex size-9 items-center justify-center rounded-full">
            <Coins className="size-4" aria-hidden="true" />
          </span>
          <div>
            <p className="text-xl font-semibold tabular-nums">{coins}</p>
            <p className="text-muted-foreground text-xs">Coins</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="flex items-center gap-3 py-4">
          <span className="bg-streak/15 text-streak flex size-9 items-center justify-center rounded-full">
            <Flame className="size-4" aria-hidden="true" />
          </span>
          <div>
            <p className="text-xl font-semibold tabular-nums">
              {currentStreak}
              <span className="text-muted-foreground text-sm font-normal"> current</span>
            </p>
            <p className="text-muted-foreground text-xs">Longest: {longestStreak} days</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
