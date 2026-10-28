import { describe, expect, it } from 'vitest';
import { applyAnswer, emptyProgress, pickItem } from './leitner';
import type { Box } from './types';

describe('applyAnswer', () => {
  it('moves a correct item up one box, capped at 5', () => {
    let p = emptyProgress();
    for (let i = 0; i < 7; i++) p = applyAnswer(p, true, i);
    expect(p.box).toBe(5);
    expect(p.seen).toBe(7);
    expect(p.correct).toBe(7);
    expect(p.lastSeen).toBe(6);
  });

  it('sends a wrong answer back to box 1', () => {
    const p = applyAnswer({ box: 4, seen: 3, correct: 3, lastSeen: 0 }, false, 10);
    expect(p).toEqual({ box: 1, seen: 4, correct: 3, lastSeen: 10 });
  });
});

describe('pickItem', () => {
  it('skips recent items when others are available', () => {
    const picked = pickItem(['a', 'b'], () => 1, ['a'], () => 0);
    expect(picked).toBe('b');
  });

  it('falls back to all items when everything is recent', () => {
    expect(pickItem(['a'], () => 1, ['a'], () => 0)).toBe('a');
  });

  it('picks low boxes far more often than high boxes', () => {
    const boxes: Record<string, Box> = { weak: 1, strong: 5 };
    let seed = 1;
    const random = () => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };
    const counts = { weak: 0, strong: 0 };
    for (let i = 0; i < 2000; i++) {
      counts[pickItem(['weak', 'strong'], (id) => boxes[id], [], random) as 'weak' | 'strong']++;
    }
    expect(counts.weak).toBeGreaterThan(counts.strong * 8);
  });
});
