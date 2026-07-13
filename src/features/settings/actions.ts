"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/infrastructure/db/prisma";
import { requireUserId } from "@/lib/auth/require-user";
import { regenerateSchedule } from "@/application/services/regenerate-schedule";
import { studyPreferencesSchema } from "@/features/settings/schemas";
import { exportDataSchema } from "@/lib/export-format";
import type { FormActionState } from "@/lib/form-action-state";

export async function updateStudyPreferencesAction(
  _prevState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const userId = await requireUserId();
  const parsed = studyPreferencesSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };

  await prisma.user.update({
    where: { id: userId },
    data: {
      defaultFocusMode: parsed.data.defaultFocusMode,
      academicYear: parsed.data.academicYear || null,
    },
  });

  revalidatePath("/settings");
  return { success: true };
}

export async function importDataAction(
  _prevState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const userId = await requireUserId();

  const file = formData.get("file");
  if (!(file instanceof File)) return { error: "Choose a file to import." };

  let json: unknown;
  try {
    json = JSON.parse(await file.text());
  } catch {
    return { error: "That file isn't valid JSON." };
  }

  const parsed = exportDataSchema.safeParse(json);
  if (!parsed.success) return { error: "That file doesn't match the expected export format." };

  const data = parsed.data;
  const subjectIdByName = new Map<string, string>();

  await prisma.$transaction(async (tx) => {
    for (const subject of data.subjects) {
      const created = await tx.subject.create({
        data: {
          userId,
          name: subject.name,
          difficulty: subject.difficulty,
          creditHours: subject.creditHours,
          targetGrade: subject.targetGrade,
          preparationPercent: subject.preparationPercent,
          estimatedHours: subject.estimatedHours,
          colorHex: subject.colorHex,
          topics: { create: subject.topics },
        },
      });
      subjectIdByName.set(subject.name, created.id);
    }

    for (const assignment of data.assignments) {
      const subjectId = subjectIdByName.get(assignment.subjectName);
      if (!subjectId) continue;
      await tx.assignment.create({
        data: {
          userId,
          subjectId,
          title: assignment.title,
          deadline: new Date(assignment.deadline),
          difficulty: assignment.difficulty,
          weight: assignment.weight,
          estimatedHours: assignment.estimatedHours,
          progressPercent: assignment.progressPercent,
          status: assignment.progressPercent >= 100 ? "COMPLETED" : "IN_PROGRESS",
        },
      });
    }

    for (const exam of data.exams) {
      const subjectId = subjectIdByName.get(exam.subjectName);
      if (!subjectId) continue;
      await tx.exam.create({
        data: {
          userId,
          subjectId,
          date: new Date(exam.date),
          weight: exam.weight,
          difficulty: exam.difficulty,
          preparationPercent: exam.preparationPercent,
          estimatedHours: exam.estimatedHours,
        },
      });
    }

    for (const quiz of data.quizzes) {
      const subjectId = subjectIdByName.get(quiz.subjectName);
      if (!subjectId) continue;
      await tx.quiz.create({
        data: {
          userId,
          subjectId,
          quizDate: new Date(quiz.quizDate),
          difficulty: quiz.difficulty,
          weight: quiz.weight,
          estimatedHours: quiz.estimatedHours,
          preparationPercent: quiz.preparationPercent,
        },
      });
    }

    for (const project of data.projects) {
      const subjectId = project.subjectName ? subjectIdByName.get(project.subjectName) : undefined;
      await tx.project.create({
        data: {
          userId,
          subjectId: subjectId ?? null,
          title: project.title,
          deadline: new Date(project.deadline),
          progressPercent: project.progressPercent,
          estimatedHours: project.estimatedHours,
        },
      });
    }
  });

  await regenerateSchedule(userId);
  revalidatePath("/", "layout");
  return { success: true };
}
