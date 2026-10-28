export type CharacterRole = 'helper' | 'teacher' | 'classmate';
export type Moment = 'start' | 'correct' | 'streak' | 'tryAgain' | 'reveal' | 'finish';
export type Mood = 'idle' | 'happy' | 'think';

/**
 * Персонаж описывается данными, чтобы позже загружать наборы героев
 * (одноклассники, учителя, свои картинки) без изменения кода.
 */
export interface Character {
  id: string;
  name: string;
  role: CharacterRole;
  phrases: Record<Moment, string[]>;
}

export const bulk: Character = {
  id: 'bulk',
  name: 'Бульк',
  role: 'helper',
  phrases: {
    start: [
      'Привет! Я Бульк. Давай поиграем в умножение!',
      'Бульк-бульк! Я готов, а ты?',
      'Сегодня соберём много монеток!',
    ],
    correct: [
      'Верно! Бульк!',
      'Ура, правильно!',
      'Точно в цель!',
      'Ты молодец!',
      'Так держать!',
      'Отлично! Я аж подпрыгнул!',
      'Правильно! Держи монетку!',
      'Здорово считаешь!',
    ],
    streak: [
      'Пять подряд! Вот это серия!',
      'Ты просто звезда умножения!',
      'Серия! Держи бонусные монетки!',
    ],
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
    finish: [
      'Отличная игра! Возвращайся ещё!',
      'Ты сегодня здорово постаралась!',
      'Бульк гордится тобой!',
    ],
  },
};

export function phrase(character: Character, moment: Moment, random: () => number = Math.random): string {
  const list = character.phrases[moment];
  return list[Math.floor(random() * list.length)];
}
