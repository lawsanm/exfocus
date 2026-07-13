/**
 * Level N requires a cumulative 50*N*(N-1) XP (triangular growth — each
 * level takes progressively longer, a standard game-design curve).
 * Level is always derived from total XP rather than trusted from a stored
 * column, so there is exactly one source of truth.
 */
function xpThresholdForLevel(level: number): number {
  return 50 * level * (level - 1);
}

export interface LevelProgress {
  level: number;
  xpIntoLevel: number;
  xpForNextLevel: number;
  progress: number; // 0..1
}

export function getLevelProgress(totalXp: number): LevelProgress {
  let level = 1;
  while (xpThresholdForLevel(level + 1) <= totalXp) {
    level += 1;
  }

  const currentLevelThreshold = xpThresholdForLevel(level);
  const nextLevelThreshold = xpThresholdForLevel(level + 1);
  const xpIntoLevel = totalXp - currentLevelThreshold;
  const xpForNextLevel = nextLevelThreshold - currentLevelThreshold;

  return {
    level,
    xpIntoLevel,
    xpForNextLevel,
    progress: xpForNextLevel === 0 ? 1 : xpIntoLevel / xpForNextLevel,
  };
}

/** 1 XP per completed minute — transparent and easy to reason about. */
export function xpForFocusMinutes(minutes: number): number {
  return Math.max(0, Math.round(minutes));
}

/** 1 coin per 10 completed minutes. */
export function coinsForFocusMinutes(minutes: number): number {
  return Math.max(0, Math.floor(minutes / 10));
}
