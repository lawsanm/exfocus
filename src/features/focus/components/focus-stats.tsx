import { Clock, Flame, Timer, Trophy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { FocusStats } from "@/infrastructure/repositories/focus-repository";

function formatMinutes(minutes: number): string {
  return `${Math.round((minutes / 60) * 10) / 10}h`;
}

export function FocusStatsRow({ stats }: { stats: FocusStats }) {
  const tiles = [
    { label: "Today", value: formatMinutes(stats.todayMinutes), icon: Timer },
    { label: "This week", value: formatMinutes(stats.weeklyMinutes), icon: Clock },
    { label: "This month", value: formatMinutes(stats.monthlyMinutes), icon: Flame },
    { label: "Longest session", value: `${stats.longestSessionMinutes}m`, icon: Trophy },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {tiles.map((tile) => (
        <Card key={tile.label}>
          <CardContent className="flex items-center gap-3">
            <span className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-full">
              <tile.icon className="size-4" aria-hidden="true" />
            </span>
            <div>
              <p className="text-xl font-semibold tabular-nums">{tile.value}</p>
              <p className="text-muted-foreground text-xs">{tile.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
