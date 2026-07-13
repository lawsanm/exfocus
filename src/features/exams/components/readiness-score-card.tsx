import { Gauge } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { ReadinessResult } from "@/application/services/readiness-score";

const LEVEL_CLASS: Record<ReadinessResult["level"], string> = {
  LOW: "text-priority-critical",
  MODERATE: "text-priority-medium-foreground",
  GOOD: "text-primary",
  EXCELLENT: "text-success",
};

export function ReadinessScoreCard({ readiness }: { readiness: ReadinessResult }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gauge className="size-4" aria-hidden="true" />
          Exam readiness
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-baseline gap-2">
          <span className={`text-3xl font-semibold tabular-nums ${LEVEL_CLASS[readiness.level]}`}>
            {readiness.score}
          </span>
          <span className="text-muted-foreground text-sm">
            / 100 · {readiness.level.toLowerCase()}
          </span>
        </div>
        <Progress value={readiness.score} />
        <p className="text-muted-foreground text-sm">{readiness.recommendation}</p>
      </CardContent>
    </Card>
  );
}
