"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import type { EventDropArg } from "@fullcalendar/core";
import { toast } from "sonner";
import { rescheduleStudySessionAction } from "@/features/calendar/actions";
import type { CalendarEventDto } from "@/infrastructure/repositories/calendar-repository";

const LEGEND: { label: string; color: string }[] = [
  { label: "Study session", color: "#0D9488" },
  { label: "Exam", color: "#DC2626" },
  { label: "Assignment due", color: "#EA580C" },
  { label: "Quiz", color: "#CA8A04" },
  { label: "Project due", color: "#7C3AED" },
];

export function CalendarView({ events }: { events: CalendarEventDto[] }) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  async function handleEventDrop(info: EventDropArg) {
    const entityId = info.event.extendedProps.entityId as string;
    const type = info.event.extendedProps.type as string;
    if (type !== "STUDY_SESSION") {
      info.revert();
      return;
    }

    const newDate = info.event.startStr;
    const result = await rescheduleStudySessionAction(entityId, newDate);
    if (result.error) {
      toast.error(result.error);
      info.revert();
      return;
    }
    toast.success("Session rescheduled — plan updated.");
    startTransition(() => router.refresh());
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="text-muted-foreground flex flex-wrap gap-4 text-xs">
        {LEGEND.map((item) => (
          <span key={item.label} className="flex items-center gap-1.5">
            <span className="size-2 rounded-full" style={{ backgroundColor: item.color }} />
            {item.label}
          </span>
        ))}
      </div>
      <div className="exfocus-calendar rounded-lg border p-2">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,listWeek",
          }}
          events={events.map((event) => ({
            id: event.id,
            title: event.title,
            start: event.date,
            allDay: true,
            editable: event.editable,
            backgroundColor: event.color,
            borderColor: event.color,
            extendedProps: { type: event.type, entityId: event.entityId },
          }))}
          editable
          eventDrop={handleEventDrop}
          height="auto"
          dayMaxEventRows={4}
        />
      </div>
    </div>
  );
}
