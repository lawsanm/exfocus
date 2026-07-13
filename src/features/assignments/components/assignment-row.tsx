"use client";

import { Trash2 } from "lucide-react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DifficultyBadge } from "@/components/shared/difficulty-badge";
import { ConfirmActionButton } from "@/components/shared/confirm-action-button";
import { AssignmentFormDialog } from "@/features/assignments/components/assignment-form-dialog";
import { deleteAssignmentAction } from "@/features/assignments/actions";
import type { SubjectOption } from "@/components/forms/subject-select";
import type { AssignmentListItem } from "@/infrastructure/repositories/assignment-repository";

const STATUS_LABEL: Record<string, string> = {
  NOT_STARTED: "Not started",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
};

const STATUS_CLASS: Record<string, string> = {
  NOT_STARTED: "bg-priority-low/15 text-priority-low",
  IN_PROGRESS: "bg-priority-medium/15 text-priority-medium-foreground",
  COMPLETED: "bg-success/15 text-success",
};

export function AssignmentRow({
  assignment,
  subjects,
}: {
  assignment: AssignmentListItem;
  subjects: SubjectOption[];
}) {
  const deadline = new Date(assignment.deadline);
  const isOverdue = deadline < new Date() && assignment.status !== "COMPLETED";

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-2">
          <span
            className="size-2 shrink-0 rounded-full"
            style={{ backgroundColor: assignment.subject.colorHex }}
          />
          <div className="min-w-0">
            <p className="truncate font-medium">{assignment.title}</p>
            <p className="text-muted-foreground truncate text-xs">{assignment.subject.name}</p>
          </div>
        </div>
      </TableCell>
      <TableCell className={isOverdue ? "text-priority-critical" : undefined}>
        {deadline.toLocaleDateString("en-US", { month: "short", day: "numeric" })}{" "}
        {deadline.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
      </TableCell>
      <TableCell>
        <DifficultyBadge difficulty={assignment.difficulty} />
      </TableCell>
      <TableCell>{assignment.weight}%</TableCell>
      <TableCell className="w-36">
        <div className="flex items-center gap-2">
          <Progress value={assignment.progressPercent} className="h-1.5" />
          <span className="text-muted-foreground w-9 shrink-0 text-xs">
            {assignment.progressPercent}%
          </span>
        </div>
      </TableCell>
      <TableCell>
        <Badge
          variant="outline"
          className={`border-transparent ${STATUS_CLASS[assignment.status]}`}
        >
          {STATUS_LABEL[assignment.status]}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <AssignmentFormDialog subjects={subjects} assignment={assignment} />
          <ConfirmActionButton
            action={deleteAssignmentAction.bind(null, assignment.id)}
            title="Delete this assignment?"
            description="This can't be undone."
            confirmLabel="Delete"
            triggerVariant="ghost"
            triggerLabel={<Trash2 className="text-destructive size-3.5" aria-hidden="true" />}
          />
        </div>
      </TableCell>
    </TableRow>
  );
}
