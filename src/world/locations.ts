import type { WorldLocation } from '../core/types';

/**
 * Карта мира. Локации открываются по очереди за монетки. В каждой свой фон,
 * свой персонаж и своя коллекция предметов из сундучков.
 * Цены подобраны так, чтобы на весь мир даже без ошибок понадобилось
 * не меньше 10 полных проходов таблицы (см. тест экономики в rewards.test.ts).
 * Боссы охраняют столбики таблицы: лёгкие в первых локациях, трудные в последних.
 */
export const locations: WorldLocation[] = [
  {
    id: 'circus',
    name: 'Цирк',
    icon: '🎪',
    price: 0,
    characterId: 'bulk',
    background: ['#f3efff', '#ffe9f3'],
    items: [
      { id: 'circus-balloon', name: 'Воздушный шарик', icon: '🎈' },
      { id: 'circus-popcorn', name: 'Попкорн', icon: '🍿' },
      { id: 'circus-hat', name: 'Цилиндр фокусника', icon: '🎩' },
      { id: 'circus-carousel', name: 'Карусель', icon: '🎠' },
      { id: 'circus-juggler', name: 'Жонглёр', icon: '🤹' },
      { id: 'circus-ticket', name: 'Билет в цирк', icon: '🎟️' },
    ],
    bosses: [
      { id: 'boss-x2', name: 'Клоун Двоечник', icon: '🤡', group: 'x2' },
      { id: 'boss-x3', name: 'Трёхглавый Дракон', icon: '🐉', group: 'x3' },
    ],
  },
  {
    id: 'town',
    name: 'Городок',
    icon: '🏘️',
    price: 100,
    characterId: 'knopka',
    background: ['#fff4e0', '#ffe0ec'],
    items: [
      { id: 'town-house', name: 'Домик', icon: '🏠' },
      { id: 'town-bike', name: 'Велосипед', icon: '🚲' },
      { id: 'town-cupcake', name: 'Капкейк', icon: '🧁' },
      { id: 'town-cat', name: 'Котик', icon: '🐱' },
      { id: 'town-tulip', name: 'Тюльпан', icon: '🌷' },
      { id: 'town-slide', name: 'Горка', icon: '🛝' },
    ],
    bosses: [
      { id: 'boss-x4', name: 'Робот Четвёрка', icon: '🤖', group: 'x4' },
      { id: 'boss-x5', name: 'Пятнистый Леопард', icon: '🐆', group: 'x5' },
    ],
  },
  {
    id: 'slime-park',
    name: 'Парк слаймов',
    icon: '🫧',
    price: 200,
    characterId: 'zhele',
    background: ['#e8fff0', '#efe6ff'],
    items: [
      { id: 'park-rainbow', name: 'Радуга', icon: '🌈' },
      { id: 'park-mushroom', name: 'Грибок', icon: '🍄' },
      { id: 'park-frog', name: 'Лягушонок', icon: '🐸' },
      { id: 'park-sunflower', name: 'Подсолнух', icon: '🌻' },
      { id: 'park-kite', name: 'Воздушный змей', icon: '🪁' },
      { id: 'park-bubbles', name: 'Мыльные пузыри', icon: '🫧' },
    ],
    bosses: [
      { id: 'boss-x6', name: 'Шестилапый Жук', icon: '🪲', group: 'x6' },
    ],
  },
  {
    id: 'school',
    name: 'Школа',
    icon: '🏫',
    price: 300,
    characterId: 'klyaksa',
    background: ['#e6f4ff', '#f1f8e9'],
    items: [
      { id: 'school-books', name: 'Стопка книг', icon: '📚' },
      { id: 'school-pencil', name: 'Карандаш', icon: '✏️' },
      { id: 'school-backpack', name: 'Рюкзак', icon: '🎒' },
      { id: 'school-abacus', name: 'Счёты', icon: '🧮' },
      { id: 'school-microscope', name: 'Микроскоп', icon: '🔬' },
      { id: 'school-trophy', name: 'Кубок', icon: '🏆' },
    ],
    bosses: [
      { id: 'boss-x7', name: 'Контрольная Семёрка', icon: '📝', group: 'x7' },
      { id: 'boss-x8', name: 'Осьминог Восьмёрка', icon: '🐙', group: 'x8' },
    ],
  },
  {
    id: 'space',
    name: 'Космос',
    icon: '🚀',
    price: 400,
    characterId: 'zvezdochka',
    background: ['#e3e0ff', '#ffe9d6'],
    items: [
      { id: 'space-rocket', name: 'Ракета', icon: '🚀' },
      { id: 'space-planet', name: 'Планета', icon: '🪐' },
      { id: 'space-star', name: 'Звезда', icon: '⭐' },
      { id: 'space-ufo', name: 'Летающая тарелка', icon: '🛸' },
      { id: 'space-moon', name: 'Луна', icon: '🌙' },
      { id: 'space-alien', name: 'Инопланетянин', icon: '👽' },
    ],
    bosses: [
      { id: 'boss-x9', name: 'Девятиглазый Пришелец', icon: '👾', group: 'x9' },
    ],
  },
];

export const FIRST_LOCATION = locations[0].id;

export function locationById(id: string): WorldLocation {
  return locations.find((l) => l.id === id) ?? locations[0];
}
