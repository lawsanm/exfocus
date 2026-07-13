const MOTIVATIONAL_QUOTES = [
  "The secret of getting ahead is getting started.",
  "Small daily improvements lead to stunning results.",
  "Discipline is choosing between what you want now and what you want most.",
  "You don't have to be great to start, but you have to start to be great.",
  "Focus on progress, not perfection.",
  "The expert in anything was once a beginner.",
  "Study while others are sleeping; succeed while others are wishing.",
  "A little progress each day adds up to big results.",
  "Your future is created by what you do today, not tomorrow.",
  "Don't watch the clock; do what it does — keep going.",
  "The pain of discipline weighs ounces; the pain of regret weighs tons.",
  "Success is the sum of small efforts repeated day in and day out.",
  "Motivation gets you started. Habit keeps you going.",
  "Every expert was once a student who refused to give up.",
  "You are capable of more than you know.",
] as const;

function dayOfYear(date: Date): number {
  const start = Date.UTC(date.getUTCFullYear(), 0, 1);
  const current = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  return Math.floor((current - start) / (1000 * 60 * 60 * 24));
}

export function getQuoteOfTheDay(date: Date = new Date()): string {
  const index = dayOfYear(date) % MOTIVATIONAL_QUOTES.length;
  return MOTIVATIONAL_QUOTES[index];
}
