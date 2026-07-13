import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ListTodo } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/infrastructure/db/prisma";
import { listAssignments } from "@/infrastructure/repositories/assignment-repository";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AssignmentFormDialog } from "@/features/assignments/components/assignment-form-dialog";
import { AssignmentRow } from "@/features/assignments/components/assignment-row";

export const metadata: Metadata = {
  title: "Assignments",
};

export default async function AssignmentsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [assignments, subjects] = await Promise.all([
    listAssignments(session.user.id),
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
          <h1 className="text-2xl font-semibold tracking-tight">Assignments</h1>
          <p className="text-muted-foreground text-sm">Deadlines, grade weight, and progress.</p>
        </div>
        <AssignmentFormDialog subjects={subjects} />
      </div>

      {assignments.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed py-16 text-center">
          <ListTodo className="text-muted-foreground size-8" aria-hidden="true" />
          <p className="text-muted-foreground text-sm">No assignments yet.</p>
          <AssignmentFormDialog subjects={subjects} />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead>Weight</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignments.map((assignment) => (
                <AssignmentRow key={assignment.id} assignment={assignment} subjects={subjects} />
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
