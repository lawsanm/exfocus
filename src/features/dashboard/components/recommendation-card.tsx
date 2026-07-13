import { Lightbulb } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { StudyHourRecommendation } from "@/domain/entities/scheduling";

export function RecommendationCard({
  recommendation,
}: {
  recommendation: StudyHourRecommendation | null;
}) {
  if (!recommendation) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="text-xp-foreground size-4" aria-hidden="true" />
          Study hour recommendation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        <p className="text-2xl font-semibold tabular-nums">
          {recommendation.recommendedDailyHours}h
          <span className="text-muted-foreground text-sm font-normal"> / day</span>
        </p>
        <p className="text-muted-foreground text-sm">{recommendation.reasoning}</p>
      </CardContent>
    </Card>
  );
}
