import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import {
  getAchievementsWithStatus,
  getGamificationProfile,
} from "@/infrastructure/repositories/gamification-repository";
import { GamificationHeader } from "@/features/gamification/components/gamification-header";
import { AchievementBadge } from "@/features/gamification/components/achievement-badge";

export const metadata: Metadata = {
  title: "Achievements",
};

export default async function GamificationPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [profile, achievements] = await Promise.all([
    getGamificationProfile(session.user.id),
    getAchievementsWithStatus(session.user.id),
  ]);

  const unlockedCount = achievements.filter((a) => a.unlockedAt !== null).length;

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Achievements</h1>
        <p className="text-muted-foreground text-sm">
          {unlockedCount} of {achievements.length} unlocked
        </p>
      </div>

      <GamificationHeader
        xp={profile.xp}
        coins={profile.coins}
        currentStreak={profile.currentStreak}
        longestStreak={profile.longestStreak}
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {achievements.map((achievement, index) => (
          <AchievementBadge key={achievement.id} achievement={achievement} index={index} />
        ))}
      </div>
    </div>
  );
}
