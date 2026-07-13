import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { DailyMinutes } from "@/infrastructure/repositories/analytics-repository";

function intensityClass(minutes: number): string {
  if (minutes === 0) return "bg-muted";
  if (minutes < 30) return "bg-primary/25";
  if (minutes < 60) return "bg-primary/50";
  if (minutes < 120) return "bg-primary/75";
  return "bg-primary";
}

export function StudyHeatmap({ data }: { data: DailyMinutes[] }) {
  // Pad the start so the grid begins on a Sunday, matching a GitHub-style
  // contribution graph read column-by-column (each column = one week).
  const first = new Date(data[0]?.date ?? new Date());
  const leadingBlanks = first.getUTCDay();
  const cells: (DailyMinutes | null)[] = [
    ...Array.from({ length: leadingBlanks }, () => null),
    ...data,
  ];

  const weeks: (DailyMinutes | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Study heatmap</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-1 overflow-x-auto pb-2">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1">
              {week.map((day, dayIndex) =>
                day ? (
                  <Tooltip key={day.date}>
                    <TooltipTrigger
                      render={
                        <div className={`size-3 rounded-sm ${intensityClass(day.minutes)}`} />
                      }
                    />
                    <TooltipContent>
                      {day.date}: {Math.round((day.minutes / 60) * 10) / 10}h
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <div key={dayIndex} className="size-3" />
                ),
              )}
            </div>
          ))}
        </div>
        <div className="text-muted-foreground mt-2 flex items-center gap-1.5 text-xs">
          <span>Less</span>
          <span className="bg-muted size-3 rounded-sm" />
          <span className="bg-primary/25 size-3 rounded-sm" />
          <span className="bg-primary/50 size-3 rounded-sm" />
          <span className="bg-primary/75 size-3 rounded-sm" />
          <span className="bg-primary size-3 rounded-sm" />
          <span>More</span>
        </div>
      </CardContent>
    </Card>
  );
}
