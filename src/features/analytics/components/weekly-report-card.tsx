import { TrendingDown, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  computeProductivityTrend,
  generateWeeklySuggestions,
} from "@/application/services/weekly-report";
import type { WeeklyReportData } from "@/infrastructure/repositories/analytics-repository";

export function WeeklyReportCard({ data }: { data: WeeklyReportData }) {
  const trend = computeProductivityTrend(data.hoursThisWeek, data.hoursLastWeek);
  const suggestions = generateWeeklySuggestions(data);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly report</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <p className="text-xl font-semibold tabular-nums">{data.hoursThisWeek}h</p>
            <p className="text-muted-foreground text-xs">Hours studied</p>
          </div>
          <div>
            <p className="text-xl font-semibold tabular-nums">{data.tasksCompleted}</p>
            <p className="text-muted-foreground text-xs">Tasks completed</p>
          </div>
          <div>
            <p className="truncate text-xl font-semibold">{data.bestSubject?.name ?? "—"}</p>
            <p className="text-muted-foreground text-xs">Best subject</p>
          </div>
          <div>
            <p className="truncate text-xl font-semibold">{data.weakestSubject?.name ?? "—"}</p>
            <p className="text-muted-foreground text-xs">Needs attention</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-sm">
          {trend >= 0 ? (
            <TrendingUp className="text-success size-4" aria-hidden="true" />
          ) : (
            <TrendingDown className="text-priority-critical size-4" aria-hidden="true" />
          )}
          <span className={trend >= 0 ? "text-success" : "text-priority-critical"}>
            {trend >= 0 ? "+" : ""}
            {trend}%
          </span>
          <span className="text-muted-foreground">vs. last week</span>
        </div>

        <ul className="space-y-1.5">
          {suggestions.map((suggestion) => (
            <li key={suggestion} className="text-muted-foreground text-sm">
              • {suggestion}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
