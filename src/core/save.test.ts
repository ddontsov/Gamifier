import { describe, expect, it } from 'vitest';
import { newSave, parseSave, serializeSave } from './save';

describe('save file', () => {
  it('round-trips through export and import', () => {
    const save = {
      ...newSave(),
      coins: 12,
      sessions: 3,
      progress: { 'multiplication:7x8': { box: 3 as const, seen: 4, correct: 3, lastSeen: 5 } },
    };
    expect(parseSave(serializeSave(save))).toEqual(save);
  });

  it('rejects files that are not saves', () => {
    expect(() => parseSave('[]')).toThrow();
    expect(() => parseSave('{"version":2,"coins":0,"sessions":0}')).toThrow('версия');
    expect(() => parseSave('not json')).toThrow();
  });

  it('drops broken progress entries but keeps the rest', () => {
    const json = JSON.stringify({
      version: 1,
      coins: 1,
      sessions: 1,
      progress: { good: { box: 2, seen: 1, correct: 1, lastSeen: 0 }, bad: { box: 9 } },
    });
    expect(Object.keys(parseSave(json).progress)).toEqual(['good']);
  });
});
