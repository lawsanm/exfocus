"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/infrastructure/db/prisma";
import { requireUserId } from "@/lib/auth/require-user";
import { profileSchema } from "@/features/profile/schemas";
import type { FormActionState } from "@/lib/form-action-state";

export async function updateProfileAction(
  _prevState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const userId = await requireUserId();
  const parsed = profileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };

  const {
    name,
    image,
    university,
    degree,
    semester,
    currentGpa,
    targetGpa,
    weeklyGoalHours,
    dailyGoalHours,
  } = parsed.data;

  await prisma.user.update({
    where: { id: userId },
    data: {
      name,
      image: image || null,
      university: university || null,
      degree: degree || null,
      semester: semester || null,
      currentGpa: currentGpa ?? null,
      targetGpa: targetGpa ?? null,
      weeklyGoalHours,
      dailyGoalHours,
    },
  });

  revalidatePath("/profile");
  revalidatePath("/", "layout");
  return { success: true };
}
