"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/infrastructure/db/prisma";
import { requireUserId } from "@/lib/auth/require-user";
import { regenerateSchedule } from "@/application/services/regenerate-schedule";
import { assignmentSchema } from "@/features/assignments/schemas";
import type { FormActionState } from "@/lib/form-action-state";

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

  await regenerateSchedule(userId);
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

  await regenerateSchedule(userId);
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
  await regenerateSchedule(userId);
  revalidatePath("/assignments");
  revalidatePath("/dashboard");
}

export async function deleteAssignmentAction(assignmentId: string): Promise<void> {
  const userId = await requireUserId();
  await prisma.assignment.deleteMany({ where: { id: assignmentId, userId } });
  await regenerateSchedule(userId);
  revalidatePath("/assignments");
  revalidatePath("/dashboard");
}
