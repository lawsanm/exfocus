import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/infrastructure/db/prisma";
import {
  getFocusStats,
  getRecentFocusSessions,
} from "@/infrastructure/repositories/focus-repository";
import { FocusTimer } from "@/features/focus/components/focus-timer";
import { FocusStatsRow } from "@/features/focus/components/focus-stats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Focus Mode",
};

export default async function FocusPage({
  searchParams,
}: {
  searchParams: Promise<{ session?: string; subject?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const params = await searchParams;

  const [subjects, stats, recentSessions] = await Promise.all([
    prisma.subject.findMany({
      where: { userId: session.user.id, archivedAt: null },
      select: { id: true, name: true, colorHex: true },
      orderBy: { name: "asc" },
    }),
    getFocusStats(session.user.id),
    getRecentFocusSessions(session.user.id),
  ]);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Focus Mode</h1>
        <p className="text-muted-foreground text-sm">
          Pomodoro, deep focus, or a fixed 90-minute block — pick what fits.
        </p>
      </div>

      <FocusStatsRow stats={stats} />

      <Card>
        <CardContent className="py-8">
          <FocusTimer
            subjects={subjects}
            initialStudySessionId={params.session}
            initialSubjectId={params.subject}
          />
        </CardContent>
      </Card>

      {recentSessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent sessions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            {recentSessions.map((focusSession) => (
              <div
                key={focusSession.id}
                className="hover:bg-accent/50 flex items-center justify-between rounded-md px-2 py-1.5 text-sm"
              >
                <span className="flex items-center gap-2">
                  {focusSession.subject && (
                    <span
                      className="size-2 rounded-full"
                      style={{ backgroundColor: focusSession.subject.colorHex }}
                    />
                  )}
                  {focusSession.subject?.name ?? "General"}
                </span>
                <span className="text-muted-foreground">
                  {focusSession.actualMinutes} min ·{" "}
                  {new Date(focusSession.startedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
