import type { WorldBoss } from '../core/types';

interface Props {
  boss: WorldBoss;
  hp: number;
  maxHp: number;
}

/** Босс с полоской здоровья: каждое сердце — один пример его столбика. */
export function BossView({ boss, hp, maxHp }: Props) {
  return (
    <div className="boss-view">
      {/* key перезапускает анимацию удара при каждом попадании. */}
      <div key={hp} className={hp < maxHp ? 'boss-icon boss-hit' : 'boss-icon'}>
        {boss.icon}
      </div>
      <div className="boss-name">{boss.name}</div>
      <div className="boss-hp" aria-label={`Здоровье босса: ${hp} из ${maxHp}`}>
        {Array.from({ length: maxHp }, (_, i) => (
          <span key={i} className={i < hp ? 'full' : ''} />
        ))}
      </div>
    </div>
  );
}
