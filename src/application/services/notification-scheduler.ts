import { prisma } from "@/infrastructure/db/prisma";
import { sendPushNotification, type StoredPushSubscription } from "@/lib/push";

function startOfTodayUtc(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

async function alreadyNotifiedToday(
  userId: string,
  type: string,
  relatedUrl: string | null,
): Promise<boolean> {
  const existing = await prisma.notification.findFirst({
    where: { userId, type: type as never, relatedUrl, createdAt: { gte: startOfTodayUtc() } },
    select: { id: true },
  });
  return existing !== null;
}

async function createAndPush(params: {
  userId: string;
  type:
    | "STUDY_REMINDER"
    | "EXAM_ALERT"
    | "ASSIGNMENT_ALERT"
    | "DAILY_SUMMARY"
    | "WEEKLY_SUMMARY"
    | "STREAK_REMINDER";
  title: string;
  body: string;
  relatedUrl?: string;
}) {
  await prisma.notification.create({
    data: {
      userId: params.userId,
      type: params.type,
      title: params.title,
      body: params.body,
      relatedUrl: params.relatedUrl,
      sentAt: new Date(),
    },
  });

  const preference = await prisma.notificationPreference.findUnique({
    where: { userId: params.userId },
  });
  if (preference?.pushEnabled && preference.pushSubscription) {
    await sendPushNotification(preference.pushSubscription as unknown as StoredPushSubscription, {
      title: params.title,
      body: params.body,
      url: params.relatedUrl,
    });
  }
}

async function sendExamAlerts() {
  const now = new Date();
  const in48h = new Date(now.getTime() + 48 * 60 * 60 * 1000);

  const exams = await prisma.exam.findMany({
    where: {
      date: { gte: now, lte: in48h },
      user: { notificationPreference: { examAlerts: true } },
    },
    include: { subject: true },
  });

  for (const exam of exams) {
    const relatedUrl = `/exams/${exam.id}`;
    if (await alreadyNotifiedToday(exam.userId, "EXAM_ALERT", relatedUrl)) continue;
    const hoursAway = Math.round((exam.date.getTime() - now.getTime()) / (60 * 60 * 1000));
    await createAndPush({
      userId: exam.userId,
      type: "EXAM_ALERT",
      title: `${exam.subject.name} exam in ${hoursAway}h`,
      body: "Check your readiness score and review the remaining topics.",
      relatedUrl,
    });
  }
}

async function sendAssignmentAlerts() {
  const now = new Date();
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const assignments = await prisma.assignment.findMany({
    where: {
      deadline: { gte: now, lte: in24h },
      status: { not: "COMPLETED" },
      user: { notificationPreference: { assignmentAlerts: true } },
    },
  });

  for (const assignment of assignments) {
    const relatedUrl = "/assignments";
    if (await alreadyNotifiedToday(assignment.userId, "ASSIGNMENT_ALERT", relatedUrl)) continue;
    await createAndPush({
      userId: assignment.userId,
      type: "ASSIGNMENT_ALERT",
      title: `"${assignment.title}" due soon`,
      body: `${assignment.progressPercent}% complete — due within 24 hours.`,
      relatedUrl,
    });
  }
}

async function sendStreakReminders() {
  const startOfToday = startOfTodayUtc();

  const usersAtRisk = await prisma.user.findMany({
    where: {
      currentStreak: { gt: 0 },
      OR: [{ lastStudyDate: null }, { lastStudyDate: { lt: startOfToday } }],
      notificationPreference: { streakReminders: true },
    },
    select: { id: true, currentStreak: true },
  });

  for (const user of usersAtRisk) {
    if (await alreadyNotifiedToday(user.id, "STREAK_REMINDER", "/focus")) continue;
    await createAndPush({
      userId: user.id,
      type: "STREAK_REMINDER",
      title: `Your ${user.currentStreak}-day streak is at risk`,
      body: "Log a focus session today to keep it going.",
      relatedUrl: "/focus",
    });
  }
}

async function sendDailySummaries() {
  const users = await prisma.user.findMany({
    where: { notificationPreference: { dailySummary: true } },
    select: { id: true, name: true },
  });

  const startOfToday = startOfTodayUtc();
  const endOfToday = new Date(startOfToday);
  endOfToday.setUTCDate(endOfToday.getUTCDate() + 1);

  for (const user of users) {
    if (await alreadyNotifiedToday(user.id, "DAILY_SUMMARY", "/dashboard")) continue;

    const sessions = await prisma.studySession.count({
      where: { userId: user.id, scheduledDate: { gte: startOfToday, lt: endOfToday } },
    });
    if (sessions === 0) continue;

    await createAndPush({
      userId: user.id,
      type: "DAILY_SUMMARY",
      title: "Today's study plan is ready",
      body: `${sessions} session${sessions === 1 ? "" : "s"} scheduled for today.`,
      relatedUrl: "/dashboard",
    });
  }
}

async function sendWeeklySummaries() {
  const now = new Date();
  if (now.getUTCDay() !== 1) return; // Monday only

  const users = await prisma.user.findMany({
    where: { notificationPreference: { weeklySummary: true } },
    select: { id: true },
  });

  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  for (const user of users) {
    if (await alreadyNotifiedToday(user.id, "WEEKLY_SUMMARY", "/analytics")) continue;

    const focus = await prisma.focusSession.aggregate({
      where: { userId: user.id, completed: true, startedAt: { gte: weekAgo } },
      _sum: { actualMinutes: true },
    });
    const hours = Math.round(((focus._sum.actualMinutes ?? 0) / 60) * 10) / 10;

    await createAndPush({
      userId: user.id,
      type: "WEEKLY_SUMMARY",
      title: "Your week in review",
      body: `You studied ${hours}h last week. See the full breakdown in Analytics.`,
      relatedUrl: "/analytics",
    });
  }
}

/** Entry point for the scheduled job (see /api/cron/notifications). Each
 * check is independently deduped per-user-per-day, so running this more
 * than once in a day is harmless. */
export async function runNotificationChecks(): Promise<void> {
  await Promise.all([
    sendExamAlerts(),
    sendAssignmentAlerts(),
    sendStreakReminders(),
    sendDailySummaries(),
    sendWeeklySummaries(),
  ]);
}
