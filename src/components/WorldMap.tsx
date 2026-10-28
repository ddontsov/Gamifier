import { characterById } from '../core/characters';
import { collected, lockState, unlockLocation } from '../core/rewards';
import type { SaveData } from '../core/types';
import { locations } from '../world/locations';

interface Props {
  save: SaveData;
  onChange: (save: SaveData) => void;
  onClose: () => void;
}

/** Карта мира: открытые локации, следующая за монетки и коллекции предметов. */
export function WorldMap({ save, onChange, onClose }: Props) {
  return (
    <div className="world">
      <div className="world-head">
        <h1 className="title">Карта мира</h1>
        <button className="btn btn-secondary" onClick={onClose}>
          Назад
        </button>
      </div>
      <div className="world-grid">
        {locations.map((location) => {
          const state = lockState(save, locations, location);
          const open = state === 'open';
          const current = save.location === location.id;
          const have = collected(save, location);
          return (
            <div
              key={location.id}
              className={`place place-${state} ${current ? 'place-current' : ''}`}
              style={{ background: `linear-gradient(160deg, ${location.background[0]}, ${location.background[1]})` }}
            >
              <div className="place-icon">{open ? location.icon : '🔒'}</div>
              <div className="place-name">{location.name}</div>
              {open && (
                <>
                  <div className="place-friend">Здесь живёт {characterById(location.characterId).name}</div>
                  <div className="place-items" aria-label={`Собрано ${have.length} из ${location.items.length}`}>
                    {location.items.map((item) => (
                      <span key={item.id} className={save.items.includes(item.id) ? 'got' : 'missing'} title={item.name}>
                        {save.items.includes(item.id) ? item.icon : '?'}
                      </span>
                    ))}
                  </div>
                  {current ? (
                    <div className="place-here">Ты здесь</div>
                  ) : (
                    <button className="btn" onClick={() => onChange({ ...save, location: location.id })}>
                      Играть здесь
                    </button>
                  )}
                </>
              )}
              {state === 'can-unlock' && (
                <button className="btn btn-gold" onClick={() => onChange(unlockLocation(save, locations, location))}>
                  Открыть за <span className="coin">●</span> {location.price}
                </button>
              )}
              {state === 'need-coins' && (
                <div className="place-price">
                  Нужно <span className="coin">●</span> {location.price}
                  <div className="place-hint">ещё {location.price - save.coins}</div>
                </div>
              )}
              {state === 'need-previous' && <div className="place-hint">Сначала открой предыдущую</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
