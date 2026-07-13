"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/infrastructure/db/prisma";
import { requireUserId } from "@/lib/auth/require-user";
import { regenerateSchedule } from "@/application/services/regenerate-schedule";
import type { FormActionState } from "@/lib/form-action-state";
import { projectSchema } from "@/features/projects/schemas";

async function assertSubjectOwnership(userId: string, subjectId: string | null) {
  if (!subjectId) return true;
  const subject = await prisma.subject.findFirst({
    where: { id: subjectId, userId },
    select: { id: true },
  });
  return Boolean(subject);
}

export async function createProjectAction(
  _prevState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const userId = await requireUserId();
  const parsed = projectSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };
  if (!(await assertSubjectOwnership(userId, parsed.data.subjectId))) {
    return { error: "Subject not found." };
  }

  await prisma.project.create({ data: { ...parsed.data, userId } });

  await regenerateSchedule(userId);
  revalidatePath("/projects");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateProjectAction(
  projectId: string,
  _prevState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const userId = await requireUserId();
  const parsed = projectSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };
  if (!(await assertSubjectOwnership(userId, parsed.data.subjectId))) {
    return { error: "Subject not found." };
  }

  const { count } = await prisma.project.updateMany({
    where: { id: projectId, userId },
    data: parsed.data,
  });
  if (count === 0) return { error: "Project not found." };

  await regenerateSchedule(userId);
  revalidatePath("/projects");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateProjectProgressAction(
  projectId: string,
  progressPercent: number,
): Promise<void> {
  const userId = await requireUserId();
  const clamped = Math.min(100, Math.max(0, Math.round(progressPercent)));
  await prisma.project.updateMany({
    where: { id: projectId, userId },
    data: { progressPercent: clamped },
  });
  await regenerateSchedule(userId);
  revalidatePath("/projects");
  revalidatePath("/dashboard");
}

export async function deleteProjectAction(projectId: string): Promise<void> {
  const userId = await requireUserId();
  await prisma.project.deleteMany({ where: { id: projectId, userId } });
  await regenerateSchedule(userId);
  revalidatePath("/projects");
  revalidatePath("/dashboard");
}
