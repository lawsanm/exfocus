function isSameUtcDay(a: Date, b: Date): boolean {
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  );
}

function daysBetweenUtc(from: Date, to: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  const fromMidnight = Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate());
  const toMidnight = Date.UTC(to.getUTCFullYear(), to.getUTCMonth(), to.getUTCDate());
  return Math.round((toMidnight - fromMidnight) / msPerDay);
}

export interface StreakState {
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: Date | null;
}

/**
 * A completed study activity today either starts, continues, or has no
 * effect on the streak (already logged today) — it can never break it.
 * The streak only resets the next time this runs after a day was skipped.
 */
export function applyStudyActivity(state: StreakState, today: Date = new Date()): StreakState {
  if (state.lastStudyDate && isSameUtcDay(state.lastStudyDate, today)) {
    return state;
  }

  const gapDays = state.lastStudyDate ? daysBetweenUtc(state.lastStudyDate, today) : null;
  const nextStreak = gapDays === 1 ? state.currentStreak + 1 : 1;

  return {
    currentStreak: nextStreak,
    longestStreak: Math.max(state.longestStreak, nextStreak),
    lastStudyDate: today,
  };
}
