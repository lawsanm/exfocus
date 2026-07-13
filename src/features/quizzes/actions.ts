"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/infrastructure/db/prisma";
import { requireUserId } from "@/lib/auth/require-user";
import { regenerateSchedule } from "@/application/services/regenerate-schedule";
import type { FormActionState } from "@/lib/form-action-state";
import { quizSchema } from "@/features/quizzes/schemas";

export async function createQuizAction(
  _prevState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const userId = await requireUserId();
  const parsed = quizSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };

  const subject = await prisma.subject.findFirst({
    where: { id: parsed.data.subjectId, userId },
    select: { id: true },
  });
  if (!subject) return { error: "Subject not found." };

  await prisma.quiz.create({ data: { ...parsed.data, userId } });

  await regenerateSchedule(userId);
  revalidatePath("/quizzes");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateQuizAction(
  quizId: string,
  _prevState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const userId = await requireUserId();
  const parsed = quizSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };

  const subject = await prisma.subject.findFirst({
    where: { id: parsed.data.subjectId, userId },
    select: { id: true },
  });
  if (!subject) return { error: "Subject not found." };

  const { count } = await prisma.quiz.updateMany({
    where: { id: quizId, userId },
    data: parsed.data,
  });
  if (count === 0) return { error: "Quiz not found." };

  await regenerateSchedule(userId);
  revalidatePath("/quizzes");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteQuizAction(quizId: string): Promise<void> {
  const userId = await requireUserId();
  await prisma.quiz.deleteMany({ where: { id: quizId, userId } });
  await regenerateSchedule(userId);
  revalidatePath("/quizzes");
  revalidatePath("/dashboard");
}
