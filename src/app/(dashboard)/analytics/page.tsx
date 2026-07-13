import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/infrastructure/db/prisma";
import {
  getCompletedTaskCounts,
  getDailyFocusMinutes,
  getSubjectDistribution,
  getWeeklyProductivity,
} from "@/infrastructure/repositories/analytics-repository";
import { StudyHoursChart } from "@/features/analytics/components/study-hours-chart";
import { SubjectDistributionChart } from "@/features/analytics/components/subject-distribution-chart";
import { WeeklyProductivityChart } from "@/features/analytics/components/weekly-productivity-chart";
import { StudyHeatmap } from "@/features/analytics/components/study-heatmap";
import { CompletedTasksSummary } from "@/features/analytics/components/completed-tasks-summary";
import { Card, CardContent } from "@/components/ui/card";
import { Flame } from "lucide-react";

export const metadata: Metadata = {
  title: "Analytics",
};

export default async function AnalyticsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [dailyMinutes, subjectDistribution, completedTasks, weeklyProductivity, user] =
    await Promise.all([
      getDailyFocusMinutes(session.user.id, 90),
      getSubjectDistribution(session.user.id),
      getCompletedTaskCounts(session.user.id),
      getWeeklyProductivity(session.user.id, 8),
      prisma.user.findUniqueOrThrow({
        where: { id: session.user.id },
        select: { currentStreak: true, longestStreak: true },
      }),
    ]);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground text-sm">Your study patterns over time.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <CompletedTasksSummary counts={completedTasks} />
        <Card className="sm:col-span-2">
          <CardContent className="flex h-full items-center gap-6">
            <div className="flex items-center gap-3">
              <span className="bg-streak/15 text-streak flex size-10 shrink-0 items-center justify-center rounded-full">
                <Flame className="size-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-2xl font-semibold tabular-nums">{user.currentStreak}</p>
                <p className="text-muted-foreground text-xs">Current streak</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="bg-xp/15 text-xp-foreground flex size-10 shrink-0 items-center justify-center rounded-full">
                <Flame className="size-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-2xl font-semibold tabular-nums">{user.longestStreak}</p>
                <p className="text-muted-foreground text-xs">Longest streak</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <StudyHeatmap data={dailyMinutes} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <StudyHoursChart data={dailyMinutes} />
        <SubjectDistributionChart data={subjectDistribution} />
      </div>

      <WeeklyProductivityChart data={weeklyProductivity} />
    </div>
  );
}
