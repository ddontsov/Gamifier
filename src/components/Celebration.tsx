import { characterById, greeting } from '../core/characters';
import type { WorldLocation } from '../core/types';
import { Confetti } from './Confetti';
import { Slime } from './Slime';

interface Props {
  location: WorldLocation;
  onClose: () => void;
}

/** Праздник открытия новой локации: салют и знакомство с её персонажем. */
export function Celebration({ location, onClose }: Props) {
  const character = characterById(location.characterId);
  return (
    <div
      className="celebrate"
      role="dialog"
      aria-label={`Открыта локация ${location.name}`}
      style={{ background: `linear-gradient(160deg, ${location.background[0]}, ${location.background[1]})` }}
    >
      <Confetti />
      <div className="celebrate-card">
        <div className="celebrate-label">Новая локация!</div>
        <div className="celebrate-icon">{location.icon}</div>
        <h1 className="title">{location.name}</h1>
        <div className="bubble">{greeting(character)}</div>
        <Slime character={character} mood="happy" />
        <p className="goal">
          Здесь новая коллекция и {location.bosses.length === 1 ? 'новый босс' : 'новые боссы'}:{' '}
          {location.bosses.map((b) => b.icon).join(' ')}
        </p>
        <button className="btn btn-big" onClick={onClose}>
          Вперёд!
        </button>
      </div>
    </div>
  );
}
