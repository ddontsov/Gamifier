import { recordAnswer } from './session';
import type { Question, SaveData, TopicModule, WorldBoss } from './types';

/** Сколько ошибок можно сделать в бою с боссом. */
export const BOSS_LIVES = 3;

export type BossOutcome = 'hit' | 'miss' | 'won' | 'lost';

/**
 * Бой с боссом: нужно решить все примеры его группы. Каждый верный ответ
 * отнимает у босса одно сердце, каждая ошибка — одну жизнь у Кати, а пример
 * возвращается в конец очереди. Монет бой не даёт: награда — трофей.
 */
export interface BossFight {
  topic: TopicModule;
  boss: WorldBoss;
  question: Question;
  /** Примеры, которые ещё нужно решить; первый — текущий. */
  queue: string[];
  hp: number;
  maxHp: number;
  lives: number;
  /** Примеры с ошибкой в этом бою: повторный верный ответ не считается выученным. */
  missed: string[];
}

function shuffle<T>(list: T[], random: () => number): T[] {
  const result = [...list];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function startBoss(topic: TopicModule, boss: WorldBoss, random: () => number = Math.random): BossFight {
  const group = topic.groups().find((g) => g.id === boss.group);
  if (!group) throw new Error(`В теме ${topic.id} нет группы ${boss.group}`);
  const queue = shuffle(group.items, random);
  return {
    topic,
    boss,
    question: topic.question(queue[0]),
    queue,
    hp: queue.length,
    maxHp: queue.length,
    lives: BOSS_LIVES,
    missed: [],
  };
}

export function answerBoss(
  fight: BossFight,
  save: SaveData,
  given: string,
  now: number = Date.now(),
): { fight: BossFight; save: SaveData; outcome: BossOutcome } {
  const { topic, question, boss } = fight;
  const [current, ...rest] = fight.queue;
  const firstTime = !fight.missed.includes(current);

  if (!topic.check(question, given)) {
    const lives = fight.lives - 1;
    const queue = [...rest, current];
    return {
      fight: {
        ...fight,
        lives,
        queue,
        question: topic.question(queue[0]),
        missed: firstTime ? [...fight.missed, current] : fight.missed,
      },
      save: firstTime ? recordAnswer(save, question, false, now) : save,
      outcome: lives === 0 ? 'lost' : 'miss',
    };
  }

  const recorded = firstTime ? recordAnswer(save, question, true, now) : save;
  if (rest.length === 0) {
    const bosses = recorded.bosses.includes(boss.id) ? recorded.bosses : [...recorded.bosses, boss.id];
    return {
      fight: { ...fight, hp: 0, queue: [] },
      save: { ...recorded, bosses },
      outcome: 'won',
    };
  }
  return {
    fight: { ...fight, hp: fight.hp - 1, queue: rest, question: topic.question(rest[0]) },
    save: recorded,
    outcome: 'hit',
  };
}
