import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { FileText } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/infrastructure/db/prisma";
import { listProjects } from "@/infrastructure/repositories/project-repository";
import { ProjectFormDialog } from "@/features/projects/components/project-form-dialog";
import { ProjectCard } from "@/features/projects/components/project-card";

export const metadata: Metadata = {
  title: "Projects",
};

export default async function ProjectsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [projects, subjects] = await Promise.all([
    listProjects(session.user.id),
    prisma.subject.findMany({
      where: { userId: session.user.id, archivedAt: null },
      select: { id: true, name: true, colorHex: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
          <p className="text-muted-foreground text-sm">
            Multi-step work, optionally tied to a subject.
          </p>
        </div>
        <ProjectFormDialog subjects={subjects} />
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed py-16 text-center">
          <FileText className="text-muted-foreground size-8" aria-hidden="true" />
          <p className="text-muted-foreground text-sm">No projects yet.</p>
          <ProjectFormDialog subjects={subjects} />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} subjects={subjects} />
          ))}
        </div>
      )}
    </div>
  );
}
