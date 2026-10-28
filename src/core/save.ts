import { get, set } from 'idb-keyval';
import type { ItemProgress, SaveData } from './types';

const STORAGE_KEY = 'gamifier-save';

export function newSave(): SaveData {
  return { version: 1, coins: 0, sessions: 0, progress: {} };
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

/**
 * Разбирает сохранение из JSON (файл экспорта или IndexedDB).
 * Бросает ошибку, если это не наше сохранение.
 */
export function parseSave(json: string): SaveData {
  const raw: unknown = JSON.parse(json);
  if (typeof raw !== 'object' || raw === null) throw new Error('Это не файл сохранения');
  const s = raw as Record<string, unknown>;
  if (s.version !== 1) throw new Error('Неизвестная версия сохранения');
  if (typeof s.coins !== 'number' || typeof s.sessions !== 'number') {
    throw new Error('Повреждённый файл сохранения');
  }
  const progress: SaveData['progress'] = {};
  if (typeof s.progress === 'object' && s.progress !== null) {
    for (const [key, value] of Object.entries(s.progress)) {
      if (isProgress(value)) progress[key] = value;
    }
  }
  return { version: 1, coins: s.coins, sessions: s.sessions, progress };
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
