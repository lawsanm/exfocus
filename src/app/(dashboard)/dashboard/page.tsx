import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getDashboardData } from "@/infrastructure/repositories/dashboard-repository";
import { computeSchedulingInsights } from "@/application/services/regenerate-schedule";
import { WelcomeHeader } from "@/features/dashboard/components/welcome-header";
import { StatTiles } from "@/features/dashboard/components/stat-tiles";
import { TodayProductivityTiles } from "@/features/dashboard/components/today-productivity-tiles";
import { TodayPlanCard } from "@/features/dashboard/components/today-plan-card";
import { UpcomingDeadlinesCard } from "@/features/dashboard/components/upcoming-deadlines-card";
import { RiskAlertCard } from "@/features/dashboard/components/risk-alert-card";
import { RecommendationCard } from "@/features/dashboard/components/recommendation-card";
import { QuickActions } from "@/features/dashboard/components/quick-actions";
import { FadeInUp } from "@/components/motion/motion-primitives";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const [data, insights] = await Promise.all([
    getDashboardData(session.user.id),
    computeSchedulingInsights(session.user.id),
  ]);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <FadeInUp>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <WelcomeHeader name={data.user.name} />
          <QuickActions />
        </div>
      </FadeInUp>

      {insights.risks.length > 0 && (
        <FadeInUp delay={0.05}>
          <RiskAlertCard risks={insights.risks} />
        </FadeInUp>
      )}

      <StatTiles
        xp={data.user.xp}
        currentStreak={data.user.currentStreak}
        weeklyFocusMinutes={data.weeklyFocusMinutes}
        weeklyGoalHours={data.user.weeklyGoalHours}
        monthlyFocusMinutes={data.monthlyFocusMinutes}
      />

      <FadeInUp delay={0.1}>
        <TodayProductivityTiles
          todayFocusMinutes={data.todayFocusMinutes}
          todayFocusSessionCount={data.todayFocusSessionCount}
          dailyGoalHours={data.user.dailyGoalHours}
        />
      </FadeInUp>

      <FadeInUp delay={0.15}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <TodayPlanCard sessions={data.todaySessions} />
          <UpcomingDeadlinesCard deadlines={data.upcomingDeadlines} />
        </div>
      </FadeInUp>

      {insights.recommendation && (
        <FadeInUp delay={0.2}>
          <RecommendationCard recommendation={insights.recommendation} />
        </FadeInUp>
      )}
    </div>
  );
}
