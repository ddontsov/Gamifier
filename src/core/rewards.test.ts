import { describe, expect, it } from 'vitest';
import { multiplication } from '../topics/multiplication';
import { locationById, locations } from '../world/locations';
import { COLLECTION_DONE_COINS, lockState, openChest, unlockLocation } from './rewards';
import { newSave } from './save';
import { advance, answer, isFinished, startSession } from './session';

const town = locationById('town');
const park = locationById('slime-park');

describe('world map', () => {
  it('starts with only the first location open', () => {
    const save = newSave();
    expect(lockState(save, locations, locations[0])).toBe('open');
    expect(lockState(save, locations, town)).toBe('need-coins');
    expect(lockState(save, locations, park)).toBe('need-previous');
  });

  it('unlocks the next location for its price and moves there', () => {
    const save = { ...newSave(), coins: town.price + 7 };
    expect(lockState(save, locations, town)).toBe('can-unlock');
    const next = unlockLocation(save, locations, town);
    expect(next.coins).toBe(7);
    expect(next.unlocked).toEqual(['circus', 'town']);
    expect(next.location).toBe('town');
  });

  it('does not unlock without enough coins or out of order', () => {
    const poor = { ...newSave(), coins: town.price - 1 };
    expect(unlockLocation(poor, locations, town)).toBe(poor);
    const rich = { ...newSave(), coins: 1000 };
    expect(unlockLocation(rich, locations, park)).toBe(rich);
  });

  it('keeps prices growing so each new place takes longer', () => {
    const prices = locations.map((l) => l.price);
    expect(prices[0]).toBe(0);
    for (let i = 1; i < prices.length; i++) expect(prices[i]).toBeGreaterThan(prices[i - 1]);
  });

  it('uses unique item ids across the whole world', () => {
    const ids = locations.flatMap((l) => l.items.map((i) => i.id));
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('chest', () => {
  it('gives a new item from the current location', () => {
    const circus = locations[0];
    const save = { ...newSave(), items: [circus.items[0].id] };
    const result = openChest(save, circus, () => 0);
    expect(result.item).toEqual(circus.items[1]);
    expect(result.save.items).toEqual([circus.items[0].id, circus.items[1].id]);
    expect(result.coins).toBe(0);
  });

  it('pays coins once the collection is complete', () => {
    const circus = locations[0];
    const save = { ...newSave(), coins: 3, items: circus.items.map((i) => i.id) };
    const result = openChest(save, circus);
    expect(result.item).toBeNull();
    expect(result.save.coins).toBe(3 + COLLECTION_DONE_COINS);
  });
});

describe('economy', () => {
  // Правило Dmitry: чтобы открыть весь мир, таблицу нужно пройти целиком не меньше 10 раз.
  const MIN_PASSES = 10;

  it('needs at least ten flawless passes of the table to open every location', () => {
    const total = locations.reduce((sum, l) => sum + l.price, 0);
    const circus = locations[0];
    // Самый быстрый путь: ни одной ошибки, и сундучок каждый раз платит монетками.
    let save = { ...newSave(), items: circus.items.map((i) => i.id) };
    let answers = 0;
    while (save.coins < total) {
      let s = startSession(multiplication, save);
      for (;;) {
        const r = answer(s, save, s.question.answer);
        answers++;
        save = r.save;
        if (save.coins >= total || isFinished(r.session)) break;
        s = advance(r.session, save);
      }
      if (save.coins < total) save = openChest(save, circus).save;
    }
    expect(answers).toBeGreaterThanOrEqual(MIN_PASSES * multiplication.items().length);
  });
});
