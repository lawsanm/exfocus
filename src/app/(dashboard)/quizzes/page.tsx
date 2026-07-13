import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ClipboardList } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/infrastructure/db/prisma";
import { listQuizzes } from "@/infrastructure/repositories/quiz-repository";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { QuizFormDialog } from "@/features/quizzes/components/quiz-form-dialog";
import { QuizRow } from "@/features/quizzes/components/quiz-row";

export const metadata: Metadata = {
  title: "Quizzes",
};

export default async function QuizzesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [quizzes, subjects] = await Promise.all([
    listQuizzes(session.user.id),
    prisma.subject.findMany({
      where: { userId: session.user.id, archivedAt: null },
      select: { id: true, name: true, colorHex: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Quizzes</h1>
          <p className="text-muted-foreground text-sm">Low-weight, frequent checks.</p>
        </div>
        <QuizFormDialog subjects={subjects} />
      </div>

      {quizzes.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed py-16 text-center">
          <ClipboardList className="text-muted-foreground size-8" aria-hidden="true" />
          <p className="text-muted-foreground text-sm">No quizzes yet.</p>
          <QuizFormDialog subjects={subjects} />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead>Weight</TableHead>
                <TableHead>Preparation</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quizzes.map((quiz) => (
                <QuizRow key={quiz.id} quiz={quiz} subjects={subjects} />
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
