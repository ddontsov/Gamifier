// Типы заданий. Сейчас есть только ввод числа; новые типы (выбор ответа,
// открытый ответ, сопоставление) добавляются сюда и в src/exercises.
export type ExerciseKind = 'number-input';

export interface Question {
  topicId: string;
  itemId: string;
  kind: ExerciseKind;
  /** Текст вопроса на экране, например «7 × 8». */
  prompt: string;
  answer: string;
}

/**
 * Модуль темы отвечает только за содержание: что учить, как спросить,
 * как проверить и как подсказать. Персонажи, награды и прогресс живут в ядре.
 */
export interface TopicModule {
  id: string;
  title: string;
  /** Все элементы темы, например «7x8». */
  items(): string[];
  question(itemId: string): Question;
  check(question: Question, given: string): boolean;
  /** Подсказка-стратегия после ошибки. */
  hint(question: Question, given: string): string;
}

/** Ящик Лейтнера: 1 — знает плохо, 5 — знает отлично. */
export type Box = 1 | 2 | 3 | 4 | 5;

export interface ItemProgress {
  box: Box;
  seen: number;
  correct: number;
  lastSeen: number;
}

export interface SaveData {
  version: 1;
  coins: number;
  sessions: number;
  /** Ключ — `${topicId}:${itemId}`. */
  progress: Record<string, ItemProgress>;
}
