import Link from "next/link";
import { TriangleAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DeadlineRisk } from "@/domain/entities/scheduling";

const ENTITY_PATH: Record<string, (id: string) => string> = {
  ASSIGNMENT: () => "/assignments",
  EXAM: (id) => `/exams/${id}`,
  QUIZ: () => "/quizzes",
  PROJECT: () => "/projects",
  TOPIC: () => "/subjects",
};

function linkFor(risk: DeadlineRisk): string {
  const { linkedIds } = risk.workItem;
  if (linkedIds.examId) return ENTITY_PATH.EXAM(linkedIds.examId);
  if (linkedIds.assignmentId) return ENTITY_PATH.ASSIGNMENT("");
  if (linkedIds.quizId) return ENTITY_PATH.QUIZ("");
  if (linkedIds.projectId) return ENTITY_PATH.PROJECT("");
  return ENTITY_PATH.TOPIC("");
}

export function RiskAlertCard({ risks }: { risks: DeadlineRisk[] }) {
  if (risks.length === 0) return null;

  return (
    <Card className="border-priority-critical/30 bg-priority-critical/5">
      <CardHeader>
        <CardTitle className="text-priority-critical flex items-center gap-2">
          <TriangleAlert className="size-4" aria-hidden="true" />
          {risks.length} item{risks.length === 1 ? "" : "s"} at risk of missing their deadline
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {risks.slice(0, 5).map((risk) => (
          <Link
            key={risk.workItem.id}
            href={linkFor(risk)}
            className="hover:bg-accent/50 rounded-md px-2 py-1.5 text-sm"
          >
            <span className="font-medium">{risk.workItem.label}</span>
            <span className="text-muted-foreground"> — {risk.message}</span>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
