import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getDashboardData } from "@/infrastructure/repositories/dashboard-repository";
import { WelcomeHeader } from "@/features/dashboard/components/welcome-header";
import { StatTiles } from "@/features/dashboard/components/stat-tiles";
import { TodayPlanCard } from "@/features/dashboard/components/today-plan-card";
import { UpcomingDeadlinesCard } from "@/features/dashboard/components/upcoming-deadlines-card";
import { QuickActions } from "@/features/dashboard/components/quick-actions";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const data = await getDashboardData(session.user.id);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <WelcomeHeader name={data.user.name} />
        <QuickActions />
      </div>

      <StatTiles
        xp={data.user.xp}
        currentStreak={data.user.currentStreak}
        weeklyFocusMinutes={data.weeklyFocusMinutes}
        weeklyGoalHours={data.user.weeklyGoalHours}
        monthlyFocusMinutes={data.monthlyFocusMinutes}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <TodayPlanCard sessions={data.todaySessions} />
        <UpcomingDeadlinesCard deadlines={data.upcomingDeadlines} />
      </div>
    </div>
  );
}
