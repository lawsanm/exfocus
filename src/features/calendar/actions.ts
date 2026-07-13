"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/infrastructure/db/prisma";
import { requireUserId } from "@/lib/auth/require-user";
import { regenerateSchedule } from "@/application/services/regenerate-schedule";

export async function rescheduleStudySessionAction(
  sessionId: string,
  newDate: string,
): Promise<{ error?: string }> {
  const userId = await requireUserId();

  const { count } = await prisma.studySession.updateMany({
    where: { userId, id: sessionId, status: { not: "COMPLETED" } },
    data: { scheduledDate: new Date(newDate), source: "MANUAL" },
  });

  if (count === 0) {
    return { error: "This session can't be rescheduled." };
  }

  // Reflow the rest of the auto-generated plan around the moved session.
  await regenerateSchedule(userId);
  revalidatePath("/calendar");
  revalidatePath("/dashboard");
  return {};
}
