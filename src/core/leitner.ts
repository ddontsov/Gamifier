import type { Box, ItemProgress } from './types';

/** Чем ниже ящик, тем чаще выпадает пример. */
const BOX_WEIGHT: Record<Box, number> = { 1: 16, 2: 8, 3: 4, 4: 2, 5: 1 };

export function progressKey(topicId: string, itemId: string): string {
  return `${topicId}:${itemId}`;
}

export function emptyProgress(): ItemProgress {
  return { box: 1, seen: 0, correct: 0, lastSeen: 0 };
}

/**
 * Правильный ответ с первой попытки переносит пример в следующий ящик,
 * ошибка возвращает его в первый.
 */
export function applyAnswer(p: ItemProgress, firstTryCorrect: boolean, now: number): ItemProgress {
  const box = firstTryCorrect ? (Math.min(p.box + 1, 5) as Box) : 1;
  return {
    box,
    seen: p.seen + 1,
    correct: p.correct + (firstTryCorrect ? 1 : 0),
    lastSeen: now,
  };
}

/**
 * Выбирает следующий пример с весом по ящику. Недавние примеры пропускаются,
 * чтобы один и тот же вопрос не шёл подряд.
 */
export function pickItem(
  items: string[],
  boxOf: (itemId: string) => Box,
  recent: string[],
  random: () => number = Math.random,
): string {
  const pool = items.filter((id) => !recent.includes(id));
  const candidates = pool.length > 0 ? pool : items;
  const weights = candidates.map((id) => BOX_WEIGHT[boxOf(id)]);
  const total = weights.reduce((a, b) => a + b, 0);
  let r = random() * total;
  for (let i = 0; i < candidates.length; i++) {
    r -= weights[i];
    if (r < 0) return candidates[i];
  }
  return candidates[candidates.length - 1];
}
