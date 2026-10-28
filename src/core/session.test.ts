import { describe, expect, it } from 'vitest';
import { multiplication } from '../topics/multiplication';
import { newSave } from './save';
import {
  COINS_CORRECT,
  COINS_WRONG,
  SESSION_LENGTH,
  STREAK_BONUS,
  advance,
  answer,
  isFinished,
  startSession,
} from './session';

const first = () => 0;

describe('session', () => {
  it('rewards a correct first try with coins and box 2', () => {
    const save = newSave();
    const s = startSession(multiplication, save, first);
    const r = answer(s, save, s.question.answer, 100);
    expect(r.outcome).toBe('correct');
    expect(r.coins).toBe(COINS_CORRECT);
    expect(r.save.coins).toBe(COINS_CORRECT);
    expect(r.save.progress[`multiplication:${s.question.itemId}`].box).toBe(2);
  });

  it('takes coins for each wrong attempt, then reveals', () => {
    const save = { ...newSave(), coins: 10 };
    const s = startSession(multiplication, save, first);
    const r1 = answer(s, save, '0');
    expect(r1.outcome).toBe('try-again');
    expect(r1.session.attempt).toBe(2);
    expect(r1.coins).toBe(-COINS_WRONG);
    expect(r1.save.coins).toBe(10 - COINS_WRONG);
    const r2 = answer(r1.session, r1.save, '0');
    expect(r2.outcome).toBe('reveal');
    expect(r2.save.coins).toBe(10 - 2 * COINS_WRONG);
    expect(r2.session.coinsEarned).toBe(-2 * COINS_WRONG);
    expect(r2.save.progress[`multiplication:${s.question.itemId}`]).toMatchObject({ box: 1, seen: 1, correct: 0 });
  });

  it('never lets the balance go below zero', () => {
    const save = { ...newSave(), coins: COINS_WRONG - 1 };
    const s = startSession(multiplication, save, first);
    const r1 = answer(s, save, '0');
    expect(r1.coins).toBe(-(COINS_WRONG - 1));
    expect(r1.save.coins).toBe(0);
    const r2 = answer(r1.session, r1.save, '0');
    expect(r2.coins).toBe(0);
    expect(r2.save.coins).toBe(0);
  });

  it('pays for a correct second try but does not count it as learned', () => {
    const save = { ...newSave(), coins: 10 };
    const s = startSession(multiplication, save, first);
    const r1 = answer(s, save, '0');
    const r2 = answer(r1.session, r1.save, s.question.answer);
    expect(r2.outcome).toBe('correct');
    expect(r2.save.coins).toBe(10 - COINS_WRONG + COINS_CORRECT);
    expect(r2.save.progress[`multiplication:${s.question.itemId}`].box).toBe(1);
  });

  it('brings a missed item back three questions later', () => {
    let save = newSave();
    let s = startSession(multiplication, save, first);
    const missed = s.question.itemId;
    const r = answer(s, save, '0');
    s = r.session;
    save = r.save;
    const asked: string[] = [];
    for (let i = 0; i < 3; i++) {
      s = advance(s, save, first);
      asked.push(s.question.itemId);
    }
    expect(asked.at(-1)).toBe(missed);
    expect(asked.slice(0, 2)).not.toContain(missed);
  });

  it('pays a streak bonus every five correct answers in a row', () => {
    let save = newSave();
    let s = startSession(multiplication, save, first);
    let bonuses = 0;
    for (let i = 0; i < SESSION_LENGTH; i++) {
      const r = answer(s, save, s.question.answer);
      if (r.bonus) bonuses++;
      save = r.save;
      s = r.session;
      if (!isFinished(s)) s = advance(s, save, first);
    }
    expect(bonuses).toBe(2);
    expect(save.coins).toBe(SESSION_LENGTH * COINS_CORRECT + 2 * STREAK_BONUS);
    expect(s.coinsEarned).toBe(save.coins);
  });
});
