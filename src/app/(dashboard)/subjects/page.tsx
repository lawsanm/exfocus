import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { listSubjects } from "@/infrastructure/repositories/subject-repository";
import { SubjectFormDialog } from "@/features/subjects/components/subject-form-dialog";
import { SubjectCard } from "@/features/subjects/components/subject-card";
import { BookOpen } from "lucide-react";

export const metadata: Metadata = {
  title: "Subjects",
};

export default async function SubjectsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const subjects = await listSubjects(session.user.id);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Subjects</h1>
          <p className="text-muted-foreground text-sm">
            Everything else — assignments, exams, quizzes, projects — hangs off a subject.
          </p>
        </div>
        <SubjectFormDialog />
      </div>

      {subjects.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed py-16 text-center">
          <BookOpen className="text-muted-foreground size-8" aria-hidden="true" />
          <p className="text-muted-foreground text-sm">
            No subjects yet. Add your first one to start building a study plan.
          </p>
          <SubjectFormDialog />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((subject) => (
            <SubjectCard key={subject.id} subject={subject} />
          ))}
        </div>
      )}
    </div>
  );
}
