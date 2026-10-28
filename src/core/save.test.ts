import { describe, expect, it } from 'vitest';
import { newSave, parseSave, serializeSave } from './save';

describe('save file', () => {
  it('round-trips through export and import', () => {
    const save = {
      ...newSave(),
      coins: 12,
      sessions: 3,
      progress: { 'multiplication:7x8': { box: 3 as const, seen: 4, correct: 3, lastSeen: 5 } },
      location: 'town',
      unlocked: ['circus', 'town'],
      items: ['circus-popcorn', 'town-cat'],
    };
    expect(parseSave(serializeSave(save))).toEqual(save);
  });

  it('upgrades a version 1 save from the first prototype', () => {
    const v1 = JSON.stringify({
      version: 1,
      coins: 30,
      sessions: 4,
      progress: { 'multiplication:2x2': { box: 2, seen: 1, correct: 1, lastSeen: 0 } },
    });
    expect(parseSave(v1)).toEqual({
      version: 2,
      coins: 30,
      sessions: 4,
      progress: { 'multiplication:2x2': { box: 2, seen: 1, correct: 1, lastSeen: 0 } },
      location: 'circus',
      unlocked: ['circus'],
      items: [],
    });
  });

  it('rejects files that are not saves', () => {
    expect(() => parseSave('[]')).toThrow();
    expect(() => parseSave('{"version":3,"coins":0,"sessions":0}')).toThrow('версия');
    expect(() => parseSave('not json')).toThrow();
  });

  it('drops broken progress entries and unknown ids but keeps the rest', () => {
    const json = JSON.stringify({
      version: 2,
      coins: 1,
      sessions: 1,
      progress: { good: { box: 2, seen: 1, correct: 1, lastSeen: 0 }, bad: { box: 9 } },
      location: 'atlantis',
      unlocked: ['town', 'atlantis', 'town'],
      items: ['town-cat', 'unicorn', 7],
    });
    const save = parseSave(json);
    expect(Object.keys(save.progress)).toEqual(['good']);
    expect(save.unlocked).toEqual(['circus', 'town']);
    expect(save.location).toBe('circus');
    expect(save.items).toEqual(['town-cat']);
  });
});
