import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getCalendarEvents } from "@/infrastructure/repositories/calendar-repository";
import { CalendarView } from "@/features/calendar/components/calendar-view";

export const metadata: Metadata = {
  title: "Calendar",
};

const RANGE_BEFORE_DAYS = 30;
const RANGE_AFTER_DAYS = 60;

export default async function CalendarPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const now = new Date();
  const rangeStart = new Date(now);
  rangeStart.setDate(rangeStart.getDate() - RANGE_BEFORE_DAYS);
  const rangeEnd = new Date(now);
  rangeEnd.setDate(rangeEnd.getDate() + RANGE_AFTER_DAYS);

  const events = await getCalendarEvents(session.user.id, rangeStart, rangeEnd);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Calendar</h1>
        <p className="text-muted-foreground text-sm">
          Drag a study session to a new day to reschedule it — the rest of your plan reflows
          automatically.
        </p>
      </div>
      <CalendarView events={events} />
    </div>
  );
}
