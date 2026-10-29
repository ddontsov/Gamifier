import { describe, expect, it } from 'vitest';
import { multiplication } from '../topics/multiplication';
import { locations } from '../world/locations';
import { BOSS_LIVES, answerBoss, startBoss } from './boss';
import { newSave } from './save';

const dragon = locations[0].bosses[1];

describe('boss fight', () => {
  it('asks every example of the column once', () => {
    let fight = startBoss(multiplication, dragon);
    let save = newSave();
    const asked: string[] = [];
    for (;;) {
      asked.push(fight.question.prompt);
      const r = answerBoss(fight, save, fight.question.answer);
      fight = r.fight;
      save = r.save;
      if (r.outcome === 'won') break;
      expect(r.outcome).toBe('hit');
    }
    expect(asked.sort()).toEqual(['3 × 2', '3 × 3', '3 × 4', '3 × 5', '3 × 6', '3 × 7', '3 × 8', '3 × 9']);
    expect(fight.hp).toBe(0);
    expect(save.bosses).toEqual([dragon.id]);
    expect(save.coins).toBe(0);
    expect(save.progress['multiplication:3x7'].box).toBe(2);
  });

  it('takes a life for a mistake and brings the example back at the end', () => {
    const fight = startBoss(multiplication, dragon, () => 0);
    const missed = fight.question.itemId;
    const r = answerBoss(fight, newSave(), '0');
    expect(r.outcome).toBe('miss');
    expect(r.fight.lives).toBe(BOSS_LIVES - 1);
    expect(r.fight.hp).toBe(fight.maxHp);
    expect(r.fight.queue.at(-1)).toBe(missed);
    expect(r.fight.question.itemId).not.toBe(missed);
    expect(r.save.progress[`multiplication:${missed}`].box).toBe(1);
  });

  it('is lost after the last life', () => {
    let fight = startBoss(multiplication, dragon);
    let save = newSave();
    const outcomes: string[] = [];
    for (let i = 0; i < BOSS_LIVES; i++) {
      const r = answerBoss(fight, save, '0');
      fight = r.fight;
      save = r.save;
      outcomes.push(r.outcome);
    }
    expect(outcomes).toEqual(['miss', 'miss', 'lost']);
    expect(save.bosses).toEqual([]);
  });

  it('does not count a corrected example as learned', () => {
    const save = newSave();
    let fight = startBoss(multiplication, { ...dragon }, () => 0);
    const first = fight.question.itemId;
    let r = answerBoss(fight, save, '0');
    // Решаем остальные, пока ошибочный пример не вернётся.
    while (r.fight.question.itemId !== first) r = answerBoss(r.fight, r.save, r.fight.question.answer);
    fight = r.fight;
    r = answerBoss(fight, r.save, fight.question.answer);
    expect(r.outcome).toBe('won');
    expect(r.save.progress[`multiplication:${first}`]).toMatchObject({ box: 1, seen: 1, correct: 0 });
  });

  it('has a column for every boss in the world', () => {
    const groups = new Set(multiplication.groups().map((g) => g.id));
    const bosses = locations.flatMap((l) => l.bosses);
    for (const boss of bosses) expect(groups.has(boss.group)).toBe(true);
    expect(new Set(bosses.map((b) => b.id)).size).toBe(bosses.length);
  });
});
