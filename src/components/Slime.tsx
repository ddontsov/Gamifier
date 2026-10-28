import type { Accessory, Character, Mood } from '../core/characters';

/** Встроенные персонажи — оригинальные слаймы, нарисованные в SVG. */
export function Slime({ character, mood }: { character: Character; mood: Mood }) {
  const { body, outline, shine, accessory } = character.look;
  const mouth =
    mood === 'happy'
      ? 'M70 112 Q90 134 110 112'
      : mood === 'think'
        ? 'M76 120 Q90 114 104 120'
        : 'M74 116 Q90 126 106 116';

  return (
    <svg className={`slime slime-${mood}`} viewBox="0 -10 180 180" role="img" aria-label={character.name}>
      <ellipse cx="90" cy="160" rx="62" ry="8" fill="rgba(0,0,0,0.12)" />
      <path
        d="M24 150 C10 150 14 120 22 96 C34 52 58 22 90 22 C122 22 146 52 158 96 C166 120 170 150 156 150 Z"
        fill={body}
        stroke={outline}
        strokeWidth="4"
      />
      <path d="M44 70 C52 50 66 40 80 36" stroke={shine} strokeWidth="8" strokeLinecap="round" fill="none" />
      <circle cx="122" cy="44" r="7" fill={shine} />
      <ellipse cx="68" cy="88" rx="13" ry={mood === 'happy' ? 10 : 15} fill="#fff" />
      <ellipse cx="112" cy="88" rx="13" ry={mood === 'happy' ? 10 : 15} fill="#fff" />
      <circle cx={mood === 'think' ? 72 : 70} cy={mood === 'think' ? 84 : 90} r="6" fill="#1d3b2a" />
      <circle cx={mood === 'think' ? 116 : 114} cy={mood === 'think' ? 84 : 90} r="6" fill="#1d3b2a" />
      <circle cx="50" cy="108" r="8" fill="#ff9fb5" opacity="0.7" />
      <circle cx="130" cy="108" r="8" fill="#ff9fb5" opacity="0.7" />
      <path d={mouth} stroke="#1d3b2a" strokeWidth="5" strokeLinecap="round" fill="none" />
      <AccessoryShape kind={accessory} outline={outline} />
    </svg>
  );
}

function AccessoryShape({ kind, outline }: { kind: Accessory; outline: string }) {
  switch (kind) {
    case 'none':
      return null;
    case 'bow':
      return (
        <g transform="translate(118 30) rotate(20)">
          <path d="M0 0 L-22 -14 L-22 14 Z M0 0 L22 -14 L22 14 Z" fill="#ff4f8b" stroke="#c2185b" strokeWidth="3" />
          <circle r="7" fill="#ff4f8b" stroke="#c2185b" strokeWidth="3" />
        </g>
      );
    case 'sprout':
      return (
        <g>
          <path d="M90 24 L90 2" stroke="#3f9b4f" strokeWidth="5" strokeLinecap="round" />
          <path d="M90 8 C80 -6 64 -2 62 6 C72 12 84 12 90 8 Z" fill="#6fd17c" stroke="#3f9b4f" strokeWidth="3" />
          <path d="M90 4 C100 -10 116 -6 118 2 C108 8 96 8 90 4 Z" fill="#6fd17c" stroke="#3f9b4f" strokeWidth="3" />
        </g>
      );
    case 'glasses':
      return (
        <g fill="none" stroke="#2a2140" strokeWidth="4">
          <circle cx="68" cy="88" r="19" />
          <circle cx="112" cy="88" r="19" />
          <path d="M87 86 Q90 82 93 86" />
          <path d="M49 84 L36 78 M131 84 L144 78" stroke={outline} />
        </g>
      );
    case 'antenna':
      return (
        <g>
          <path d="M90 24 L90 0" stroke={outline} strokeWidth="4" strokeLinecap="round" />
          <path
            d="M90 -9 L93 -2 L100 -2 L94 2 L97 9 L90 5 L83 9 L86 2 L80 -2 L87 -2 Z"
            fill="#ff9f43"
            stroke="#d97706"
            strokeWidth="2"
          />
        </g>
      );
  }
}
