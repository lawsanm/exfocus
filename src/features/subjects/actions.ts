"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/infrastructure/db/prisma";
import { requireUserId } from "@/lib/auth/require-user";
import type { FormActionState } from "@/lib/form-action-state";
import { subjectSchema, topicSchema } from "@/features/subjects/schemas";

export async function createSubjectAction(
  _prevState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const userId = await requireUserId();
  const parsed = subjectSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };

  await prisma.subject.create({
    data: { ...parsed.data, targetGrade: parsed.data.targetGrade || null, userId },
  });

  revalidatePath("/subjects");
  return { success: true };
}

export async function updateSubjectAction(
  subjectId: string,
  _prevState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const userId = await requireUserId();
  const parsed = subjectSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };

  const { count } = await prisma.subject.updateMany({
    where: { id: subjectId, userId },
    data: { ...parsed.data, targetGrade: parsed.data.targetGrade || null },
  });
  if (count === 0) return { error: "Subject not found." };

  revalidatePath("/subjects");
  revalidatePath(`/subjects/${subjectId}`);
  return { success: true };
}

export async function archiveSubjectAction(subjectId: string): Promise<void> {
  const userId = await requireUserId();
  await prisma.subject.updateMany({
    where: { id: subjectId, userId },
    data: { archivedAt: new Date() },
  });
  revalidatePath("/subjects");
}

export async function addTopicAction(
  subjectId: string,
  _prevState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const userId = await requireUserId();
  const parsed = topicSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };

  const subject = await prisma.subject.findFirst({
    where: { id: subjectId, userId },
    select: { id: true, topics: { select: { order: true } } },
  });
  if (!subject) return { error: "Subject not found." };

  const maxOrder = subject.topics.reduce((max, t) => Math.max(max, t.order), -1);

  await prisma.subjectTopic.create({
    data: { ...parsed.data, subjectId, order: maxOrder + 1 },
  });

  revalidatePath(`/subjects/${subjectId}`);
  return { success: true };
}

export async function toggleTopicAction(subjectId: string, topicId: string): Promise<void> {
  const userId = await requireUserId();
  const topic = await prisma.subjectTopic.findFirst({
    where: { id: topicId, subject: { id: subjectId, userId } },
  });
  if (!topic) return;

  await prisma.subjectTopic.update({
    where: { id: topicId },
    data: { completed: !topic.completed },
  });

  revalidatePath(`/subjects/${subjectId}`);
}

export async function deleteTopicAction(subjectId: string, topicId: string): Promise<void> {
  const userId = await requireUserId();
  await prisma.subjectTopic.deleteMany({
    where: { id: topicId, subject: { id: subjectId, userId } },
  });
  revalidatePath(`/subjects/${subjectId}`);
}
