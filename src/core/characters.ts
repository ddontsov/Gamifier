export type CharacterRole = 'helper' | 'teacher' | 'classmate';
export type Moment = 'start' | 'correct' | 'streak' | 'tryAgain' | 'reveal' | 'finish';
export type Mood = 'idle' | 'happy' | 'think';
export type Accessory = 'headphones' | 'cap' | 'shades' | 'glasses' | 'antenna';

/** Как выглядит встроенный персонаж-слайм. */
export interface SlimeLook {
  body: string;
  outline: string;
  shine: string;
  accessory: Accessory;
  /** Цвет аксессуара. */
  gear: string;
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
  start: ['Погнали! Десять примеров — покажи, на что способна.', 'Готова к раунду?'],
  correct: ['Верно!', 'Есть!', 'Чётко!', 'Легко!', 'Вот это скорость!', 'В точку!', 'Так держать!'],
  streak: ['Пять подряд — комбо!', 'Комбо! Бонус твой.', 'Ты в ударе!'],
  tryAgain: ['Мимо. Лови подсказку:', 'Почти! Подсказка:', 'Не то. Смотри, как проще:'],
  reveal: [
    'Бывает. Запомни ответ — этот пример скоро вернётся.',
    'Вот правильный ответ. В следующий раз будешь готова.',
  ],
  finish: ['Раунд окончен. Хорошая игра!', 'GG! Возвращайся за новыми монетами.'],
};

export const characters: Character[] = [
  {
    id: 'bulk',
    name: 'Бульк',
    role: 'helper',
    look: { body: '#4cc985', outline: '#21794c', shine: '#9be8bf', accessory: 'headphones', gear: '#2a2140' },
    phrases: {
      start: ['Йо! Я Бульк. Погнали считать?', 'Бульк на связи. Начинаем?'],
      correct: ['Бульк одобряет.', 'Красиво решено!'],
      finish: ['Бульк впечатлён. Реально.'],
    },
  },
  {
    id: 'knopka',
    name: 'Кнопка',
    role: 'helper',
    look: { body: '#ff8ab8', outline: '#c2407a', shine: '#ffc9df', accessory: 'cap', gear: '#5a3fe0' },
    phrases: {
      start: ['Привет, я Кнопка! Добро пожаловать в Городок!', 'В Городке всё честно: считаешь — богатеешь.'],
      correct: ['Огонь!', 'Чисто сработано!'],
      finish: ['Городок тобой гордится!'],
    },
  },
  {
    id: 'zhele',
    name: 'Желе',
    role: 'helper',
    look: { body: '#a57cff', outline: '#6338c9', shine: '#d6c4ff', accessory: 'shades', gear: '#1d1530' },
    phrases: {
      start: ['Я Желе. В Парке слаймов всё тянется, кроме времени на ответ!', 'Парк слаймов ждёт. Поехали.'],
      correct: ['Стильно!', 'Без вариантов — верно.'],
      finish: ['Желе ставит лайк.'],
    },
  },
  {
    id: 'klyaksa',
    name: 'Профессор Клякса',
    role: 'teacher',
    look: { body: '#5bb8f5', outline: '#1f6fa8', shine: '#bfe3fb', accessory: 'glasses', gear: '#2a2140' },
    phrases: {
      start: ['Здравствуй! Я Профессор Клякса. Урок начинается!', 'Проверим, как ты знаешь таблицу.'],
      correct: ['Безупречно!', 'Превосходно!', 'Пять с плюсом!'],
      finish: ['Урок окончен. Блестящая работа!'],
    },
  },
  {
    id: 'zvezdochka',
    name: 'Звёздочка',
    role: 'helper',
    look: { body: '#ffc94d', outline: '#b67f00', shine: '#ffe9a8', accessory: 'antenna', gear: '#4fd1ff' },
    phrases: {
      start: ['Связь установлена. Я Звёздочка, твой штурман в Космосе!', 'Курс проложен. Взлетаем!'],
      correct: ['Курс верный!', 'Космическая точность!'],
      finish: ['Миссия выполнена!'],
    },
  },
];

export type BossMoment = 'start' | 'hit' | 'miss' | 'won' | 'lost';

/** Реплики боссов. Общие для всех: босса узнают по имени и значку. */
const bossPhrases: Record<BossMoment, string[]> = {
  start: ['Ха! Мой столбик тебе не по зубам!', 'Посмотрим, кто кого!', 'Решишь весь мой столбик? Сомневаюсь!'],
  hit: ['Ай!', 'Ой-ой!', 'Не может быть!', 'Это случайность!', 'Ну погоди!'],
  miss: ['Ха-ха, мимо! Запомни ответ.', 'Промах! Вот правильный ответ.', 'Моя взяла! Смотри, сколько было.'],
  won: ['Ладно, ты победила. Трофей твой!', 'Я повержен! Держи трофей.'],
  lost: ['В этот раз победа за мной! Повтори столбик и возвращайся.'],
};

export function bossPhrase(moment: BossMoment, random: () => number = Math.random): string {
  const list = bossPhrases[moment];
  return list[Math.floor(random() * list.length)];
}

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
