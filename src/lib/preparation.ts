interface TopicLike {
  completed: boolean;
}

/** Topic completion ratio takes precedence once topics exist; otherwise fall
 * back to the entity's manually-set preparationPercent. Shared by subjects
 * and exams, both of which have a topic checklist. */
export function computePreparationPercent(
  storedPreparationPercent: number,
  topics: TopicLike[],
): number {
  if (topics.length === 0) return storedPreparationPercent;
  const completed = topics.filter((t) => t.completed).length;
  return Math.round((completed / topics.length) * 100);
}
