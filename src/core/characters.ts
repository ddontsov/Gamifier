export type CharacterRole = 'helper' | 'teacher' | 'classmate';
export type Moment = 'start' | 'correct' | 'streak' | 'tryAgain' | 'reveal' | 'finish';
export type Mood = 'idle' | 'happy' | 'think';
export type Accessory = 'none' | 'bow' | 'sprout' | 'glasses' | 'antenna';

/** Как выглядит встроенный персонаж-слайм. */
export interface SlimeLook {
  body: string;
  outline: string;
  shine: string;
  accessory: Accessory;
}

/**
 * Персонаж описывается данными, чтобы позже загружать наборы героев
 * (одноклассники, учителя, свои картинки) без изменения кода.
 * Своих фраз может быть немного: остальные берутся из общего банка.
 */
export interface Character {
  id: string;
  name: string;
  role: CharacterRole;
  look: SlimeLook;
  phrases: Partial<Record<Moment, string[]>>;
}

const commonPhrases: Record<Moment, string[]> = {
  start: ['Давай поиграем в умножение!', 'Сегодня соберём много монеток!'],
  correct: [
    'Верно!',
    'Ура, правильно!',
    'Точно в цель!',
    'Ты молодец!',
    'Так держать!',
    'Правильно! Держи монетку!',
    'Здорово считаешь!',
  ],
  streak: ['Пять подряд! Вот это серия!', 'Ты просто звезда умножения!', 'Серия! Держи бонусные монетки!'],
  tryAgain: [
    'Почти! Давай подумаем вместе.',
    'Не страшно, у меня есть подсказка.',
    'Хм, попробуй ещё разок!',
    'Ошибаться можно, так учатся!',
  ],
  reveal: [
    'Ничего, запомним вместе. Этот пример скоро вернётся!',
    'Вот правильный ответ. В следующий раз получится!',
  ],
  finish: ['Отличная игра! Возвращайся ещё!', 'Ты сегодня здорово постаралась!'],
};

export const characters: Character[] = [
  {
    id: 'bulk',
    name: 'Бульк',
    role: 'helper',
    look: { body: '#5fd38d', outline: '#2f9e63', shine: '#a8f0c6', accessory: 'none' },
    phrases: {
      start: ['Привет! Я Бульк. Давай поиграем в умножение!', 'Бульк-бульк! Я готов, а ты?'],
      correct: ['Верно! Бульк!', 'Отлично! Я аж подпрыгнул!'],
      finish: ['Бульк гордится тобой!'],
    },
  },
  {
    id: 'knopka',
    name: 'Кнопка',
    role: 'helper',
    look: { body: '#ff9fc4', outline: '#d9568b', shine: '#ffd3e5', accessory: 'bow' },
    phrases: {
      start: ['Привет, я Кнопка! Добро пожаловать в Городок!', 'Пойдём считать по всему Городку!'],
      correct: ['Ура-ура! Правильно!', 'Ты считаешь быстрее велосипеда!'],
      finish: ['Кнопка в восторге! Приходи ещё!'],
    },
  },
  {
    id: 'zhele',
    name: 'Желе',
    role: 'helper',
    look: { body: '#b48cff', outline: '#7a4fd6', shine: '#dcc9ff', accessory: 'sprout' },
    phrases: {
      start: ['Я Желе! В Парке слаймов всё тянется и прыгает!', 'Шлёп-шлёп! Начинаем!'],
      correct: ['Шлёп! Верно!', 'Ты тягучий гений!'],
      finish: ['Парк слаймов аплодирует!'],
    },
  },
  {
    id: 'klyaksa',
    name: 'Профессор Клякса',
    role: 'teacher',
    look: { body: '#6cc6ff', outline: '#2b86c4', shine: '#c3e8ff', accessory: 'glasses' },
    phrases: {
      start: ['Здравствуй! Я Профессор Клякса. Урок начинается!', 'Проверим, как ты знаешь таблицу!'],
      correct: ['Безупречно!', 'Пять с плюсом!', 'Превосходный ответ!'],
      finish: ['Урок окончен! Ставлю тебе пятёрку за старание!'],
    },
  },
  {
    id: 'zvezdochka',
    name: 'Звёздочка',
    role: 'helper',
    look: { body: '#ffd166', outline: '#d99a00', shine: '#fff0c2', accessory: 'antenna' },
    phrases: {
      start: ['Пип-пип! Я Звёздочка из Космоса!', 'Пристегнись, летим считать!'],
      correct: ['Космически верно!', 'До звёзд и обратно — правильно!'],
      finish: ['Миссия выполнена! Пип-пип!'],
    },
  },
];

export function characterById(id: string): Character {
  return characters.find((c) => c.id === id) ?? characters[0];
}

/** Первая собственная фраза персонажа — знакомство при входе в его локацию. */
export function greeting(character: Character): string {
  return character.phrases.start?.[0] ?? phrase(character, 'start');
}

export function phrase(character: Character, moment: Moment, random: () => number = Math.random): string {
  const list = [...(character.phrases[moment] ?? []), ...commonPhrases[moment]];
  return list[Math.floor(random() * list.length)];
}
