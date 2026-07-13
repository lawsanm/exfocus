import { FileText, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ConfirmActionButton } from "@/components/shared/confirm-action-button";
import { ProjectFormDialog } from "@/features/projects/components/project-form-dialog";
import { deleteProjectAction } from "@/features/projects/actions";
import type { SubjectOption } from "@/components/forms/subject-select";
import type { ProjectListItem } from "@/infrastructure/repositories/project-repository";

export function ProjectCard({
  project,
  subjects,
}: {
  project: ProjectListItem;
  subjects: SubjectOption[];
}) {
  const deadline = new Date(project.deadline);
  const isOverdue = deadline < new Date() && project.progressPercent < 100;

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            className="flex size-9 shrink-0 items-center justify-center rounded-lg"
            style={{
              backgroundColor: `${project.subject?.colorHex ?? "#64748B"}26`,
              color: project.subject?.colorHex ?? "#64748B",
            }}
          >
            <FileText className="size-4" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="truncate font-medium">{project.title}</p>
            <p className="text-muted-foreground truncate text-xs">
              {project.subject?.name ?? "General"}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <div className="text-muted-foreground mb-1 flex items-center justify-between text-xs">
            <span>Progress</span>
            <span>{project.progressPercent}%</span>
          </div>
          <Progress value={project.progressPercent} />
        </div>
        <p className={`text-xs ${isOverdue ? "text-priority-critical" : "text-muted-foreground"}`}>
          Due {deadline.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </p>
        <div className="flex items-center gap-1">
          <ProjectFormDialog subjects={subjects} project={project} />
          <ConfirmActionButton
            action={deleteProjectAction.bind(null, project.id)}
            title="Delete this project?"
            description="This can't be undone."
            confirmLabel="Delete"
            triggerVariant="ghost"
            triggerLabel={<Trash2 className="size-3.5" aria-hidden="true" />}
          />
        </div>
      </CardContent>
    </Card>
  );
}
