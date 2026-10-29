import { applyAnswer, emptyProgress, pickItem, progressKey } from './leitner';
import type { Question, SaveData, TopicModule } from './types';

export const SESSION_LENGTH = 10;
/** Через сколько вопросов вернуть пример, в котором была ошибка. */
const RETRY_AFTER = 3;
const STREAK_BONUS_EVERY = 5;
/** Бонус за каждые 5 верных ответов подряд. */
export const STREAK_BONUS = 1;
/** Монетки за каждый правильный ответ. */
export const COINS_CORRECT = 1;
/** Сколько монет отнимает каждая неправильная попытка. Баланс не уходит ниже нуля. */
export const COINS_WRONG = 2;

export type Outcome = 'correct' | 'try-again' | 'reveal';

export interface Session {
  topic: TopicModule;
  /** Номер текущего вопроса, с нуля. */
  index: number;
  question: Question;
  attempt: 1 | 2;
  streak: number;
  /** Сколько монет прибавилось или убавилось за игру. */
  coinsEarned: number;
  firstTryCorrect: number;
  recent: string[];
  retry: { itemId: string; due: number }[];
}

function boxOf(save: SaveData, topic: TopicModule) {
  return (itemId: string) => save.progress[progressKey(topic.id, itemId)]?.box ?? 1;
}

function nextQuestion(
  topic: TopicModule,
  save: SaveData,
  index: number,
  recent: string[],
  retry: Session['retry'],
  random: () => number,
): { question: Question; retry: Session['retry'] } {
  const due = retry.find((r) => r.due <= index);
  if (due) {
    return { question: topic.question(due.itemId), retry: retry.filter((r) => r !== due) };
  }
  const itemId = pickItem(topic.items(), boxOf(save, topic), recent, random);
  return { question: topic.question(itemId), retry };
}

export function startSession(
  topic: TopicModule,
  save: SaveData,
  random: () => number = Math.random,
): Session {
  const { question, retry } = nextQuestion(topic, save, 0, [], [], random);
  return {
    topic,
    index: 0,
    question,
    attempt: 1,
    streak: 0,
    coinsEarned: 0,
    firstTryCorrect: 0,
    recent: [question.itemId],
    retry,
  };
}

/**
 * Обрабатывает ответ. Первая ошибка даёт вторую попытку с подсказкой,
 * вторая показывает правильный ответ. Прогресс обновляется один раз
 * на вопрос: по тому, верно ли ответили с первой попытки.
 * Каждый правильный ответ приносит монетки, каждая ошибка их отнимает;
 * `coins` в результате — на сколько изменился баланс.
 */
export function answer(
  session: Session,
  save: SaveData,
  given: string,
  now: number = Date.now(),
): { session: Session; save: SaveData; outcome: Outcome; bonus: boolean; coins: number } {
  const { topic, question } = session;
  const correct = topic.check(question, given);

  if (!correct) {
    const lost = Math.min(COINS_WRONG, save.coins);
    const firstMiss = session.attempt === 1;
    const recorded = firstMiss ? recordAnswer(save, question, false, now) : save;
    return {
      session: {
        ...session,
        attempt: 2,
        streak: 0,
        coinsEarned: session.coinsEarned - lost,
        retry: firstMiss
          ? [...session.retry, { itemId: question.itemId, due: session.index + RETRY_AFTER }]
          : session.retry,
      },
      save: { ...recorded, coins: recorded.coins - lost },
      outcome: firstMiss ? 'try-again' : 'reveal',
      bonus: false,
      coins: lost > 0 ? -lost : 0,
    };
  }

  const firstTry = session.attempt === 1;
  const streak = firstTry ? session.streak + 1 : 0;
  const bonus = firstTry && streak % STREAK_BONUS_EVERY === 0;
  const coins = COINS_CORRECT + (bonus ? STREAK_BONUS : 0);
  const nextSave = firstTry ? recordAnswer(save, question, true, now) : save;

  return {
    session: {
      ...session,
      streak,
      coinsEarned: session.coinsEarned + coins,
      firstTryCorrect: session.firstTryCorrect + (firstTry ? 1 : 0),
    },
    save: { ...nextSave, coins: nextSave.coins + coins },
    outcome: 'correct',
    bonus,
    coins,
  };
}

/** Записывает в прогресс Лейтнера, решён ли пример с первой попытки. */
export function recordAnswer(save: SaveData, question: Question, firstTryCorrect: boolean, now: number): SaveData {
  const key = progressKey(question.topicId, question.itemId);
  const current = save.progress[key] ?? emptyProgress();
  return {
    ...save,
    progress: { ...save.progress, [key]: applyAnswer(current, firstTryCorrect, now) },
  };
}

export function isFinished(session: Session): boolean {
  return session.index + 1 >= SESSION_LENGTH;
}

export function advance(
  session: Session,
  save: SaveData,
  random: () => number = Math.random,
): Session {
  const index = session.index + 1;
  const { question, retry } = nextQuestion(session.topic, save, index, session.recent, session.retry, random);
  return {
    ...session,
    index,
    question,
    attempt: 1,
    recent: [...session.recent, question.itemId].slice(-3),
    retry,
  };
}
