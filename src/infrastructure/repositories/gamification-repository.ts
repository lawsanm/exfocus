import { prisma } from "@/infrastructure/db/prisma";

export interface AchievementWithStatus {
  id: string;
  key: string;
  name: string;
  description: string;
  icon: string;
  xpReward: number;
  coinReward: number;
  unlockedAt: Date | null;
}

export async function getAchievementsWithStatus(userId: string): Promise<AchievementWithStatus[]> {
  const [achievements, unlocked] = await Promise.all([
    prisma.achievement.findMany({ orderBy: { criteriaValue: "asc" } }),
    prisma.userAchievement.findMany({ where: { userId } }),
  ]);

  const unlockedMap = new Map(unlocked.map((u) => [u.achievementId, u.unlockedAt]));

  return achievements.map((a) => ({
    id: a.id,
    key: a.key,
    name: a.name,
    description: a.description,
    icon: a.icon,
    xpReward: a.xpReward,
    coinReward: a.coinReward,
    unlockedAt: unlockedMap.get(a.id) ?? null,
  }));
}

export async function getGamificationProfile(userId: string) {
  return prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { xp: true, coins: true, currentStreak: true, longestStreak: true },
  });
}
