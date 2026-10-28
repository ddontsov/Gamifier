import { describe, expect, it } from 'vitest';
import { multiplication, multiplicationHint } from './multiplication';

describe('multiplication module', () => {
  it('covers every pair from 2 to 9', () => {
    const items = multiplication.items();
    expect(items).toHaveLength(64);
    expect(items[0]).toBe('2x2');
    expect(items.at(-1)).toBe('9x9');
  });

  it('builds a number-input question', () => {
    const q = multiplication.question('7x8');
    expect(q).toMatchObject({ kind: 'number-input', prompt: '7 × 8', answer: '56', topicId: 'multiplication' });
  });

  it('checks answers ignoring surrounding spaces', () => {
    const q = multiplication.question('6x7');
    expect(multiplication.check(q, '42')).toBe(true);
    expect(multiplication.check(q, ' 42 ')).toBe(true);
    expect(multiplication.check(q, '48')).toBe(false);
  });
});

describe('multiplicationHint', () => {
  it('uses doubling for 2', () => {
    expect(multiplicationHint(2, 7)).toBe('2 × 7 — это 7 + 7');
  });

  it('uses ten minus one for 9', () => {
    expect(multiplicationHint(9, 6)).toBe('6 × 10 = 60, а теперь убери одно 6');
  });

  it('uses half of ten for 5', () => {
    expect(multiplicationHint(8, 5)).toBe('8 × 10 = 80, а нам нужна половина');
  });

  it('steps down from a known fact otherwise', () => {
    expect(multiplicationHint(7, 8)).toBe('7 × 7 = 49, и ещё 7');
    expect(multiplicationHint(3, 3)).toBe('3 × 2 = 6, и ещё 3');
  });
});
