"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/infrastructure/db/prisma";
import { assignmentSchema } from "@/features/assignments/schemas";
import type { FormActionState } from "@/lib/form-action-state";

async function requireUserId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated.");
  return session.user.id;
}

function statusFromProgress(progressPercent: number): "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" {
  if (progressPercent >= 100) return "COMPLETED";
  if (progressPercent > 0) return "IN_PROGRESS";
  return "NOT_STARTED";
}

export async function createAssignmentAction(
  _prevState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const userId = await requireUserId();
  const parsed = assignmentSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };

  const subject = await prisma.subject.findFirst({
    where: { id: parsed.data.subjectId, userId },
    select: { id: true },
  });
  if (!subject) return { error: "Subject not found." };

  await prisma.assignment.create({
    data: {
      ...parsed.data,
      userId,
      status: statusFromProgress(parsed.data.progressPercent),
    },
  });

  revalidatePath("/assignments");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateAssignmentAction(
  assignmentId: string,
  _prevState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const userId = await requireUserId();
  const parsed = assignmentSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };

  const subject = await prisma.subject.findFirst({
    where: { id: parsed.data.subjectId, userId },
    select: { id: true },
  });
  if (!subject) return { error: "Subject not found." };

  const { count } = await prisma.assignment.updateMany({
    where: { id: assignmentId, userId },
    data: { ...parsed.data, status: statusFromProgress(parsed.data.progressPercent) },
  });
  if (count === 0) return { error: "Assignment not found." };

  revalidatePath("/assignments");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateAssignmentProgressAction(
  assignmentId: string,
  progressPercent: number,
): Promise<void> {
  const userId = await requireUserId();
  const clamped = Math.min(100, Math.max(0, Math.round(progressPercent)));
  await prisma.assignment.updateMany({
    where: { id: assignmentId, userId },
    data: { progressPercent: clamped, status: statusFromProgress(clamped) },
  });
  revalidatePath("/assignments");
  revalidatePath("/dashboard");
}

export async function deleteAssignmentAction(assignmentId: string): Promise<void> {
  const userId = await requireUserId();
  await prisma.assignment.deleteMany({ where: { id: assignmentId, userId } });
  revalidatePath("/assignments");
  revalidatePath("/dashboard");
}
