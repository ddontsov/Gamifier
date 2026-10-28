import type { Character, Mood, SlimeLook } from '../core/characters';

const INK = '#1d1530';

/** Встроенные персонажи — оригинальные слаймы, нарисованные в SVG. */
export function Slime({ character, mood }: { character: Character; mood: Mood }) {
  const look = character.look;
  const { body, outline, shine, accessory } = look;
  const mouth =
    mood === 'happy'
      ? 'M68 110 Q90 136 112 110 Z'
      : mood === 'think'
        ? 'M78 120 Q92 116 104 112'
        : 'M74 114 Q92 126 108 112';

  return (
    <svg className={`slime slime-${mood}`} viewBox="0 -14 180 184" role="img" aria-label={character.name}>
      <ellipse cx="90" cy="160" rx="62" ry="8" fill="rgba(0,0,0,0.14)" />
      <path
        d="M24 150 C10 150 14 120 22 96 C34 52 58 22 90 22 C122 22 146 52 158 96 C166 120 170 150 156 150 Z"
        fill={body}
        stroke={outline}
        strokeWidth="5"
      />
      <path d="M44 70 C52 50 66 40 80 36" stroke={shine} strokeWidth="7" strokeLinecap="round" fill="none" />
      {accessory !== 'shades' && <Eyes mood={mood} />}
      <Brows mood={mood} />
      <path
        d={mouth}
        stroke={INK}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={mood === 'happy' ? INK : 'none'}
      />
      {mood === 'happy' && <path d="M80 122 Q90 128 100 122" stroke="#ff7a8a" strokeWidth="5" strokeLinecap="round" />}
      <Gear look={look} />
    </svg>
  );
}

function Eyes({ mood }: { mood: Mood }) {
  // Смотрят вверх-вбок, когда персонаж задумался.
  const dx = mood === 'think' ? 4 : 1;
  const dy = mood === 'think' ? -5 : 1;
  return (
    <g>
      <ellipse cx="68" cy="88" rx="12" ry={mood === 'happy' ? 9 : 14} fill="#fff" />
      <ellipse cx="112" cy="88" rx="12" ry={mood === 'happy' ? 9 : 14} fill="#fff" />
      <circle cx={68 + dx} cy={88 + dy} r="6.5" fill={INK} />
      <circle cx={112 + dx} cy={88 + dy} r="6.5" fill={INK} />
      <circle cx={70 + dx} cy={85 + dy} r="2" fill="#fff" />
      <circle cx={114 + dx} cy={85 + dy} r="2" fill="#fff" />
    </g>
  );
}

function Brows({ mood }: { mood: Mood }) {
  const left = mood === 'think' ? 'M56 66 L80 70' : mood === 'happy' ? 'M56 68 Q68 60 80 66' : 'M56 70 L80 68';
  const right = mood === 'think' ? 'M100 64 Q112 56 124 62' : mood === 'happy' ? 'M100 66 Q112 60 124 68' : 'M100 68 L124 70';
  return (
    <g stroke={INK} strokeWidth="5" strokeLinecap="round" fill="none">
      <path d={left} />
      <path d={right} />
    </g>
  );
}

function Gear({ look }: { look: SlimeLook }) {
  const { accessory, gear, outline } = look;
  switch (accessory) {
    case 'headphones':
      return (
        <g>
          <path d="M28 96 C28 30 152 30 152 96" stroke={gear} strokeWidth="8" fill="none" strokeLinecap="round" />
          <rect x="14" y="84" width="22" height="36" rx="10" fill={gear} />
          <rect x="144" y="84" width="22" height="36" rx="10" fill={gear} />
          <rect x="18" y="92" width="8" height="20" rx="4" fill="#4fd1ff" />
          <rect x="154" y="92" width="8" height="20" rx="4" fill="#4fd1ff" />
        </g>
      );
    case 'cap':
      // Кепка козырьком назад.
      return (
        <g>
          <path d="M42 50 C52 18 128 18 138 50 Z" fill={gear} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
          <path d="M126 44 Q150 40 162 52 Q146 56 128 52 Z" fill={gear} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
          <circle cx="90" cy="22" r="4" fill="#fff" />
          <path d="M60 44 C70 30 108 30 120 44" stroke="#fff" strokeWidth="4" fill="none" opacity="0.5" />
        </g>
      );
    case 'shades':
      return (
        <g>
          <path d="M46 80 H134" stroke={INK} strokeWidth="5" />
          <path d="M48 78 H86 L82 98 Q66 106 52 98 Z" fill={gear} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
          <path d="M94 78 H132 L128 98 Q112 106 98 98 Z" fill={gear} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
          <path d="M56 84 L64 84 M102 84 L110 84" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
        </g>
      );
    case 'glasses':
      return (
        <g fill="none" stroke={gear} strokeWidth="4">
          <rect x="50" y="74" width="36" height="28" rx="8" />
          <rect x="94" y="74" width="36" height="28" rx="8" />
          <path d="M86 86 H94" />
          <path d="M50 84 L36 80 M130 84 L144 80" stroke={outline} />
        </g>
      );
    case 'antenna':
      return (
        <g>
          <path d="M90 24 L90 2" stroke={outline} strokeWidth="4" strokeLinecap="round" />
          <circle cx="90" cy="-3" r="7" fill={gear} stroke={INK} strokeWidth="2" />
          <circle cx="88" cy="-5" r="2" fill="#fff" />
          <path d="M18 104 Q10 112 18 120 M162 104 Q170 112 162 120" stroke={gear} strokeWidth="4" fill="none" strokeLinecap="round" />
        </g>
      );
  }
}
