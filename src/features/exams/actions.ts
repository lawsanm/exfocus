"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/infrastructure/db/prisma";
import { requireUserId } from "@/lib/auth/require-user";
import type { FormActionState } from "@/lib/form-action-state";
import { examSchema, examTopicSchema } from "@/features/exams/schemas";

export async function createExamAction(
  _prevState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const userId = await requireUserId();
  const parsed = examSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };

  const subject = await prisma.subject.findFirst({
    where: { id: parsed.data.subjectId, userId },
    select: { id: true },
  });
  if (!subject) return { error: "Subject not found." };

  await prisma.exam.create({ data: { ...parsed.data, userId } });

  revalidatePath("/exams");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateExamAction(
  examId: string,
  _prevState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const userId = await requireUserId();
  const parsed = examSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };

  const subject = await prisma.subject.findFirst({
    where: { id: parsed.data.subjectId, userId },
    select: { id: true },
  });
  if (!subject) return { error: "Subject not found." };

  const { count } = await prisma.exam.updateMany({
    where: { id: examId, userId },
    data: parsed.data,
  });
  if (count === 0) return { error: "Exam not found." };

  revalidatePath("/exams");
  revalidatePath(`/exams/${examId}`);
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteExamAction(examId: string): Promise<void> {
  const userId = await requireUserId();
  await prisma.exam.deleteMany({ where: { id: examId, userId } });
  revalidatePath("/exams");
  revalidatePath("/dashboard");
}

export async function addExamTopicAction(
  examId: string,
  _prevState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const userId = await requireUserId();
  const parsed = examTopicSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };

  const exam = await prisma.exam.findFirst({
    where: { id: examId, userId },
    select: { id: true, topics: { select: { order: true } } },
  });
  if (!exam) return { error: "Exam not found." };

  const maxOrder = exam.topics.reduce((max, t) => Math.max(max, t.order), -1);

  await prisma.examTopic.create({ data: { ...parsed.data, examId, order: maxOrder + 1 } });

  revalidatePath(`/exams/${examId}`);
  return { success: true };
}

export async function toggleExamTopicAction(examId: string, topicId: string): Promise<void> {
  const userId = await requireUserId();
  const topic = await prisma.examTopic.findFirst({
    where: { id: topicId, exam: { id: examId, userId } },
  });
  if (!topic) return;

  await prisma.examTopic.update({ where: { id: topicId }, data: { completed: !topic.completed } });
  revalidatePath(`/exams/${examId}`);
}

export async function deleteExamTopicAction(examId: string, topicId: string): Promise<void> {
  const userId = await requireUserId();
  await prisma.examTopic.deleteMany({ where: { id: topicId, exam: { id: examId, userId } } });
  revalidatePath(`/exams/${examId}`);
}
