"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/infrastructure/db/prisma";
import { requireUserId } from "@/lib/auth/require-user";
import { applyStudyActivity } from "@/application/services/streak";
import { xpForFocusMinutes, coinsForFocusMinutes } from "@/application/services/gamification";
import {
  completeFocusSessionSchema,
  type CompleteFocusSessionInput,
} from "@/features/focus/schemas";

export async function completeFocusSessionAction(input: CompleteFocusSessionInput): Promise<void> {
  const userId = await requireUserId();
  const parsed = completeFocusSessionSchema.parse(input);

  if (parsed.subjectId) {
    const subject = await prisma.subject.findFirst({
      where: { id: parsed.subjectId, userId },
      select: { id: true },
    });
    if (!subject) throw new Error("Subject not found.");
  }

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: {
      xp: true,
      coins: true,
      currentStreak: true,
      longestStreak: true,
      lastStudyDate: true,
    },
  });

  const streak =
    parsed.actualMinutes > 0
      ? applyStudyActivity({
          currentStreak: user.currentStreak,
          longestStreak: user.longestStreak,
          lastStudyDate: user.lastStudyDate,
        })
      : null;

  await prisma.$transaction([
    prisma.focusSession.create({
      data: {
        userId,
        subjectId: parsed.subjectId ?? null,
        studySessionId: parsed.studySessionId ?? null,
        mode: parsed.mode,
        plannedMinutes: parsed.plannedMinutes,
        actualMinutes: parsed.actualMinutes,
        startedAt: parsed.startedAt,
        endedAt: new Date(),
        completed: parsed.actualMinutes > 0,
      },
    }),
    ...(parsed.studySessionId
      ? [
          prisma.studySession.updateMany({
            where: { id: parsed.studySessionId, userId },
            data: { status: "COMPLETED" as const, completedAt: new Date() },
          }),
        ]
      : []),
    ...(parsed.actualMinutes > 0
      ? [
          prisma.user.update({
            where: { id: userId },
            data: {
              xp: { increment: xpForFocusMinutes(parsed.actualMinutes) },
              coins: { increment: coinsForFocusMinutes(parsed.actualMinutes) },
              ...(streak && {
                currentStreak: streak.currentStreak,
                longestStreak: streak.longestStreak,
                lastStudyDate: streak.lastStudyDate,
              }),
            },
          }),
        ]
      : []),
  ]);

  revalidatePath("/focus");
  revalidatePath("/dashboard");
  revalidatePath("/analytics");
  revalidatePath("/gamification");
}
