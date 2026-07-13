import { PrismaNeon } from "@prisma/adapter-neon";
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const achievements = [
  {
    key: "first_session",
    name: "First Study Session",
    description: "Complete your very first study session.",
    icon: "Sparkles",
    xpReward: 25,
    coinReward: 10,
    criteriaType: "SESSIONS_COMPLETED",
    criteriaValue: 1,
  },
  {
    key: "streak_7",
    name: "7-Day Streak",
    description: "Study for 7 consecutive days.",
    icon: "Flame",
    xpReward: 100,
    coinReward: 50,
    criteriaType: "STREAK_DAYS",
    criteriaValue: 7,
  },
  {
    key: "streak_30",
    name: "30-Day Streak",
    description: "Study for 30 consecutive days.",
    icon: "Flame",
    xpReward: 500,
    coinReward: 250,
    criteriaType: "STREAK_DAYS",
    criteriaValue: 30,
  },
  {
    key: "streak_100",
    name: "Unstoppable",
    description: "Study for 100 consecutive days.",
    icon: "Flame",
    xpReward: 2000,
    coinReward: 1000,
    criteriaType: "STREAK_DAYS",
    criteriaValue: 100,
  },
  {
    key: "hours_10",
    name: "Getting Started",
    description: "Log 10 total hours of focused study.",
    icon: "Clock",
    xpReward: 50,
    coinReward: 20,
    criteriaType: "TOTAL_HOURS",
    criteriaValue: 10,
  },
  {
    key: "hours_100",
    name: "100 Hours Studied",
    description: "Log 100 total hours of focused study.",
    icon: "Clock",
    xpReward: 750,
    coinReward: 300,
    criteriaType: "TOTAL_HOURS",
    criteriaValue: 100,
  },
  {
    key: "hours_500",
    name: "Scholar",
    description: "Log 500 total hours of focused study.",
    icon: "GraduationCap",
    xpReward: 3000,
    coinReward: 1500,
    criteriaType: "TOTAL_HOURS",
    criteriaValue: 500,
  },
  {
    key: "exam_warrior",
    name: "Exam Warrior",
    description: "Reach a 90+ readiness score before an exam.",
    icon: "Shield",
    xpReward: 300,
    coinReward: 150,
    criteriaType: "READINESS_SCORE",
    criteriaValue: 90,
  },
  {
    key: "assignments_10",
    name: "Task Crusher",
    description: "Complete 10 assignments.",
    icon: "CheckCircle2",
    xpReward: 150,
    coinReward: 75,
    criteriaType: "ASSIGNMENTS_COMPLETED",
    criteriaValue: 10,
  },
  {
    key: "assignments_50",
    name: "Deadline Master",
    description: "Complete 50 assignments.",
    icon: "CheckCircle2",
    xpReward: 600,
    coinReward: 300,
    criteriaType: "ASSIGNMENTS_COMPLETED",
    criteriaValue: 50,
  },
  {
    key: "focus_sessions_50",
    name: "Deep Worker",
    description: "Complete 50 focus sessions.",
    icon: "Timer",
    xpReward: 400,
    coinReward: 200,
    criteriaType: "FOCUS_SESSIONS_COMPLETED",
    criteriaValue: 50,
  },
  {
    key: "perfect_week",
    name: "Perfect Week",
    description: "Hit your weekly study goal 4 weeks in a row.",
    icon: "Trophy",
    xpReward: 500,
    coinReward: 250,
    criteriaType: "PERFECT_WEEKS",
    criteriaValue: 4,
  },
] as const;

async function main() {
  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { key: achievement.key },
      create: achievement,
      update: achievement,
    });
  }
  console.log(`Seeded ${achievements.length} achievements.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
