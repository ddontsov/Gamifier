import type { Question, TopicModule } from '../core/types';

const MIN = 2;
const MAX = 9;

function parse(itemId: string): [number, number] {
  const [a, b] = itemId.split('x').map(Number);
  return [a, b];
}

/** Подсказка через уже знакомый пример: 7×8 — это 7×7 и ещё 7. */
export function multiplicationHint(a: number, b: number): string {
  if (a === 2 || b === 2) {
    const n = a === 2 ? b : a;
    return `${a} × ${b} — это ${n} + ${n}`;
  }
  if (a === 9 || b === 9) {
    const n = a === 9 ? b : a;
    return `${n} × 10 = ${n * 10}, а теперь убери одно ${n}`;
  }
  if (a === 5 || b === 5) {
    const n = a === 5 ? b : a;
    return `${n} × 10 = ${n * 10}, а нам нужна половина`;
  }
  // Уменьшаем больший множитель на 1 и добавляем меньший.
  const big = Math.max(a, b);
  const small = Math.min(a, b);
  return `${small} × ${big - 1} = ${small * (big - 1)}, и ещё ${small}`;
}

export const multiplication: TopicModule = {
  id: 'multiplication',
  title: 'Таблица умножения',

  items() {
    const ids: string[] = [];
    for (let a = MIN; a <= MAX; a++) {
      for (let b = MIN; b <= MAX; b++) ids.push(`${a}x${b}`);
    }
    return ids;
  },

  question(itemId: string): Question {
    const [a, b] = parse(itemId);
    return {
      topicId: this.id,
      itemId,
      kind: 'number-input',
      prompt: `${a} × ${b}`,
      answer: String(a * b),
    };
  },

  check(question, given) {
    return given.trim() === question.answer;
  },

  hint(question) {
    const [a, b] = parse(question.itemId);
    return multiplicationHint(a, b);
  },
};
