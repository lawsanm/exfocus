import { prisma } from "@/infrastructure/db/prisma";
import { DIFFICULTY_WEIGHT } from "@/lib/constants";
import type { ScheduledSlot, WorkItem } from "@/domain/entities/scheduling";
import type { ExistingCommitment } from "@/application/services/scheduling-engine";

const GENERAL_SUBJECT = { name: "General", colorHex: "#64748B" };
const DEFAULT_TOPIC_HORIZON_DAYS = 14;
const MIN_SCHEDULABLE_HOURS = 0.1;

export async function gatherWorkItems(userId: string): Promise<WorkItem[]> {
  const today = new Date();

  const [subjects, assignments, exams, quizzes, projects] = await Promise.all([
    prisma.subject.findMany({
      where: { userId, archivedAt: null },
      include: {
        topics: { where: { completed: false } },
        exams: { where: { date: { gte: today } }, select: { date: true } },
      },
    }),
    prisma.assignment.findMany({
      where: { userId, status: { not: "COMPLETED" } },
      include: { subject: true },
    }),
    prisma.exam.findMany({
      where: { userId, date: { gte: today } },
      include: { subject: true, topics: true },
    }),
    prisma.quiz.findMany({
      where: { userId, quizDate: { gte: today } },
      include: { subject: true },
    }),
    prisma.project.findMany({
      where: { userId, progressPercent: { lt: 100 } },
      include: { subject: true },
    }),
  ]);

  const workItems: WorkItem[] = [];
  const fallbackDeadline = new Date(today.getTime() + DEFAULT_TOPIC_HORIZON_DAYS * 86_400_000);

  for (const subject of subjects) {
    const nearestExamDate = subject.exams.length
      ? new Date(Math.min(...subject.exams.map((e) => e.date.getTime())))
      : null;
    const deadline = nearestExamDate ?? fallbackDeadline;

    if (subject.topics.length > 0) {
      for (const topic of subject.topics) {
        workItems.push({
          id: `topic:${topic.id}`,
          type: "TOPIC",
          subjectId: subject.id,
          subjectName: subject.name,
          subjectColor: subject.colorHex,
          label: `${subject.name} — ${topic.name}`,
          deadline,
          difficultyWeight: DIFFICULTY_WEIGHT[subject.difficulty],
          gradeWeight: 0,
          creditHours: subject.creditHours,
          remainingHours: topic.estimatedHours,
          completionPercent: 0,
          linkedIds: {},
        });
      }
    } else if (subject.preparationPercent < 100 && subject.estimatedHours > 0) {
      const remaining = subject.estimatedHours * (1 - subject.preparationPercent / 100);
      if (remaining > MIN_SCHEDULABLE_HOURS) {
        workItems.push({
          id: `subject:${subject.id}`,
          type: "TOPIC",
          subjectId: subject.id,
          subjectName: subject.name,
          subjectColor: subject.colorHex,
          label: `${subject.name} — General study`,
          deadline,
          difficultyWeight: DIFFICULTY_WEIGHT[subject.difficulty],
          gradeWeight: 0,
          creditHours: subject.creditHours,
          remainingHours: remaining,
          completionPercent: subject.preparationPercent,
          linkedIds: {},
        });
      }
    }
  }

  for (const assignment of assignments) {
    const remaining = assignment.estimatedHours * (1 - assignment.progressPercent / 100);
    if (remaining <= MIN_SCHEDULABLE_HOURS) continue;
    workItems.push({
      id: `assignment:${assignment.id}`,
      type: "ASSIGNMENT",
      subjectId: assignment.subject.id,
      subjectName: assignment.subject.name,
      subjectColor: assignment.subject.colorHex,
      label: assignment.title,
      deadline: assignment.deadline,
      difficultyWeight: DIFFICULTY_WEIGHT[assignment.difficulty],
      gradeWeight: assignment.weight,
      creditHours: assignment.subject.creditHours,
      remainingHours: remaining,
      completionPercent: assignment.progressPercent,
      linkedIds: { assignmentId: assignment.id },
    });
  }

  for (const exam of exams) {
    const incompleteTopics = exam.topics.filter((t) => !t.completed);

    if (exam.topics.length > 0 && incompleteTopics.length > 0) {
      const perTopicHours = exam.estimatedHours / exam.topics.length;
      for (const topic of incompleteTopics) {
        workItems.push({
          id: `examtopic:${topic.id}`,
          type: "TOPIC",
          subjectId: exam.subject.id,
          subjectName: exam.subject.name,
          subjectColor: exam.subject.colorHex,
          label: `${exam.subject.name} Exam — ${topic.name}`,
          deadline: exam.date,
          difficultyWeight: DIFFICULTY_WEIGHT[exam.difficulty],
          gradeWeight: exam.weight,
          creditHours: exam.subject.creditHours,
          remainingHours: perTopicHours,
          completionPercent: 0,
          linkedIds: { examId: exam.id },
        });
      }
    } else if (exam.topics.length === 0) {
      const remaining = exam.estimatedHours * (1 - exam.preparationPercent / 100);
      if (remaining > MIN_SCHEDULABLE_HOURS) {
        workItems.push({
          id: `exam:${exam.id}`,
          type: "EXAM",
          subjectId: exam.subject.id,
          subjectName: exam.subject.name,
          subjectColor: exam.subject.colorHex,
          label: `${exam.subject.name} Exam`,
          deadline: exam.date,
          difficultyWeight: DIFFICULTY_WEIGHT[exam.difficulty],
          gradeWeight: exam.weight,
          creditHours: exam.subject.creditHours,
          remainingHours: remaining,
          completionPercent: exam.preparationPercent,
          linkedIds: { examId: exam.id },
        });
      }
    }
  }

  for (const quiz of quizzes) {
    const remaining = quiz.estimatedHours * (1 - quiz.preparationPercent / 100);
    if (remaining <= MIN_SCHEDULABLE_HOURS) continue;
    workItems.push({
      id: `quiz:${quiz.id}`,
      type: "QUIZ",
      subjectId: quiz.subject.id,
      subjectName: quiz.subject.name,
      subjectColor: quiz.subject.colorHex,
      label: `${quiz.subject.name} Quiz`,
      deadline: quiz.quizDate,
      difficultyWeight: DIFFICULTY_WEIGHT[quiz.difficulty],
      gradeWeight: quiz.weight,
      creditHours: quiz.subject.creditHours,
      remainingHours: remaining,
      completionPercent: quiz.preparationPercent,
      linkedIds: { quizId: quiz.id },
    });
  }

  for (const project of projects) {
    const remaining = project.estimatedHours * (1 - project.progressPercent / 100);
    if (remaining <= MIN_SCHEDULABLE_HOURS) continue;
    const subject = project.subject;
    workItems.push({
      id: `project:${project.id}`,
      type: "PROJECT",
      subjectId: subject?.id ?? "general",
      subjectName: subject?.name ?? GENERAL_SUBJECT.name,
      subjectColor: subject?.colorHex ?? GENERAL_SUBJECT.colorHex,
      label: project.title,
      deadline: project.deadline,
      difficultyWeight: 2,
      gradeWeight: 0,
      creditHours: subject?.creditHours ?? 3,
      remainingHours: remaining,
      completionPercent: project.progressPercent,
      linkedIds: { projectId: project.id },
    });
  }

  return workItems;
}

export async function getAvailableHoursByWeekday(userId: string): Promise<number[]> {
  const rows = await prisma.availableHours.findMany({ where: { userId } });
  const hours = new Array(7).fill(2) as number[];
  for (const row of rows) hours[row.dayOfWeek] = row.hours;
  return hours;
}

/**
 * Sessions the engine must treat as already-committed capacity rather than
 * something it can freely place: manually rescheduled sessions (any status)
 * and sessions already marked completed, both from today forward.
 */
export async function getExistingCommitments(userId: string): Promise<ExistingCommitment[]> {
  const today = new Date();
  const rows = await prisma.studySession.findMany({
    where: {
      userId,
      scheduledDate: { gte: today },
      OR: [{ source: "MANUAL" }, { status: "COMPLETED" }],
    },
    select: { scheduledDate: true, subjectId: true, durationMinutes: true },
  });

  return rows.map((row) => ({
    date: row.scheduledDate,
    subjectId: row.subjectId,
    hours: row.durationMinutes / 60,
  }));
}

function startOfTodayUtc(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

export async function persistSchedule(userId: string, slots: ScheduledSlot[]): Promise<void> {
  const today = startOfTodayUtc();

  await prisma.$transaction([
    prisma.studySession.deleteMany({
      where: {
        userId,
        source: "AUTO_GENERATED",
        status: "PLANNED",
        scheduledDate: { gte: today },
      },
    }),
    ...(slots.length > 0
      ? [
          prisma.studySession.createMany({
            data: slots.map((slot) => ({
              userId,
              subjectId: slot.workItem.subjectId === "general" ? null : slot.workItem.subjectId,
              assignmentId: slot.workItem.linkedIds.assignmentId ?? null,
              examId: slot.workItem.linkedIds.examId ?? null,
              quizId: slot.workItem.linkedIds.quizId ?? null,
              projectId: slot.workItem.linkedIds.projectId ?? null,
              relatedType: slot.workItem.type === "TOPIC" ? "SUBJECT" : slot.workItem.type,
              topicLabel: slot.workItem.label,
              scheduledDate: slot.date,
              durationMinutes: slot.durationMinutes,
              priorityScore: slot.priority.score,
              priorityLevel: slot.priority.level,
              status: "PLANNED" as const,
              source: "AUTO_GENERATED" as const,
            })),
          }),
        ]
      : []),
  ]);
}
