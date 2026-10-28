import type { SaveData, WorldItem, WorldLocation } from './types';

/** Монетки за сундучок, когда коллекция локации уже собрана. */
export const COLLECTION_DONE_COINS = 2;

export type LockState = 'open' | 'can-unlock' | 'need-coins' | 'need-previous';

/** Локации открываются по очереди: сначала предыдущая, потом следующая. */
export function lockState(save: SaveData, all: WorldLocation[], location: WorldLocation): LockState {
  if (save.unlocked.includes(location.id)) return 'open';
  const index = all.findIndex((l) => l.id === location.id);
  const previous = all[index - 1];
  if (previous && !save.unlocked.includes(previous.id)) return 'need-previous';
  return save.coins >= location.price ? 'can-unlock' : 'need-coins';
}

/** Открывает локацию за монетки и сразу переносит Катю туда. */
export function unlockLocation(save: SaveData, all: WorldLocation[], location: WorldLocation): SaveData {
  if (lockState(save, all, location) !== 'can-unlock') return save;
  return {
    ...save,
    coins: save.coins - location.price,
    unlocked: [...save.unlocked, location.id],
    location: location.id,
  };
}

export function collected(save: SaveData, location: WorldLocation): WorldItem[] {
  return location.items.filter((i) => save.items.includes(i.id));
}

/**
 * Сундучок после игры: новый предмет из коллекции локации.
 * Если коллекция уже собрана, вместо предмета — монетки.
 */
export function openChest(
  save: SaveData,
  location: WorldLocation,
  random: () => number = Math.random,
): { save: SaveData; item: WorldItem | null; coins: number } {
  const missing = location.items.filter((i) => !save.items.includes(i.id));
  if (missing.length === 0) {
    return {
      save: { ...save, coins: save.coins + COLLECTION_DONE_COINS },
      item: null,
      coins: COLLECTION_DONE_COINS,
    };
  }
  const item = missing[Math.floor(random() * missing.length)];
  return { save: { ...save, items: [...save.items, item.id] }, item, coins: 0 };
}
