"use client";

import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { DynamicIcon } from "@/components/shared/dynamic-icon";
import type { AchievementWithStatus } from "@/infrastructure/repositories/gamification-repository";

export function AchievementBadge({
  achievement,
  index,
}: {
  achievement: AchievementWithStatus;
  index: number;
}) {
  const isUnlocked = achievement.unlockedAt !== null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.25 }}
    >
      <Card className={isUnlocked ? undefined : "opacity-50"}>
        <CardContent className="flex flex-col items-center gap-2 py-6 text-center">
          <span
            className={`flex size-14 items-center justify-center rounded-full ${
              isUnlocked ? "bg-xp/15 text-xp-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            {isUnlocked ? (
              <DynamicIcon name={achievement.icon} className="size-7" aria-hidden="true" />
            ) : (
              <Lock className="size-6" aria-hidden="true" />
            )}
          </span>
          <p className="text-sm font-medium">{achievement.name}</p>
          <p className="text-muted-foreground text-xs">{achievement.description}</p>
          <p className="text-muted-foreground text-xs">
            +{achievement.xpReward} XP · +{achievement.coinReward} coins
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
