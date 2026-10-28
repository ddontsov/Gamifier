import { get, set } from 'idb-keyval';
import { FIRST_LOCATION, locations } from '../world/locations';
import type { ItemProgress, SaveData } from './types';

const STORAGE_KEY = 'gamifier-save';

export function newSave(): SaveData {
  return {
    version: 2,
    coins: 0,
    sessions: 0,
    progress: {},
    location: FIRST_LOCATION,
    unlocked: [FIRST_LOCATION],
    items: [],
  };
}

function isProgress(v: unknown): v is ItemProgress {
  if (typeof v !== 'object' || v === null) return false;
  const p = v as Record<string, unknown>;
  return (
    typeof p.box === 'number' &&
    p.box >= 1 &&
    p.box <= 5 &&
    typeof p.seen === 'number' &&
    typeof p.correct === 'number' &&
    typeof p.lastSeen === 'number'
  );
}

function knownIds(value: unknown, known: Set<string>): string[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((v): v is string => typeof v === 'string' && known.has(v)))];
}

const locationIds = new Set(locations.map((l) => l.id));
const itemIds = new Set(locations.flatMap((l) => l.items.map((i) => i.id)));

/**
 * Разбирает сохранение из JSON (файл экспорта или IndexedDB).
 * Старые версии переводятся в текущую. Бросает ошибку, если это не наше сохранение.
 */
export function parseSave(json: string): SaveData {
  const raw: unknown = JSON.parse(json);
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) throw new Error('Это не файл сохранения');
  const s = raw as Record<string, unknown>;
  if (s.version !== 1 && s.version !== 2) throw new Error('Неизвестная версия сохранения');
  if (typeof s.coins !== 'number' || typeof s.sessions !== 'number') {
    throw new Error('Повреждённый файл сохранения');
  }
  const progress: SaveData['progress'] = {};
  if (typeof s.progress === 'object' && s.progress !== null) {
    for (const [key, value] of Object.entries(s.progress)) {
      if (isProgress(value)) progress[key] = value;
    }
  }
  // В версии 1 ещё не было карты мира: всё начинается с первой локации.
  const unlocked = knownIds(s.unlocked, locationIds);
  if (!unlocked.includes(FIRST_LOCATION)) unlocked.unshift(FIRST_LOCATION);
  const location = typeof s.location === 'string' && unlocked.includes(s.location) ? s.location : FIRST_LOCATION;

  return {
    version: 2,
    coins: s.coins,
    sessions: s.sessions,
    progress,
    location,
    unlocked,
    items: knownIds(s.items, itemIds),
  };
}

export function serializeSave(save: SaveData): string {
  return JSON.stringify(save, null, 2);
}

export async function loadSave(): Promise<SaveData> {
  try {
    const json = await get<string>(STORAGE_KEY);
    return json ? parseSave(json) : newSave();
  } catch {
    return newSave();
  }
}

export async function storeSave(save: SaveData): Promise<void> {
  await set(STORAGE_KEY, serializeSave(save));
}

/** Скачивает сохранение файлом, чтобы перенести на другое устройство. */
export function downloadSave(save: SaveData): void {
  const blob = new Blob([serializeSave(save)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const date = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `gamifier-${date}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
