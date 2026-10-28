import type { Mood } from '../core/characters';

/** Бульк — оригинальный персонаж-слайм, нарисованный в SVG. */
export function Bulk({ mood }: { mood: Mood }) {
  const mouth =
    mood === 'happy'
      ? 'M70 112 Q90 134 110 112'
      : mood === 'think'
        ? 'M76 120 Q90 114 104 120'
        : 'M74 116 Q90 126 106 116';

  return (
    <svg className={`bulk bulk-${mood}`} viewBox="0 0 180 170" role="img" aria-label="Бульк">
      <ellipse cx="90" cy="160" rx="62" ry="8" fill="rgba(0,0,0,0.12)" />
      <path
        d="M24 150 C10 150 14 120 22 96 C34 52 58 22 90 22 C122 22 146 52 158 96 C166 120 170 150 156 150 Z"
        fill="#5fd38d"
        stroke="#2f9e63"
        strokeWidth="4"
      />
      <path d="M44 70 C52 50 66 40 80 36" stroke="#a8f0c6" strokeWidth="8" strokeLinecap="round" fill="none" />
      <circle cx="122" cy="44" r="7" fill="#a8f0c6" />
      <g className="bulk-eyes">
        <ellipse cx="68" cy="88" rx="13" ry={mood === 'happy' ? 10 : 15} fill="#fff" />
        <ellipse cx="112" cy="88" rx="13" ry={mood === 'happy' ? 10 : 15} fill="#fff" />
        <circle cx={mood === 'think' ? 72 : 70} cy={mood === 'think' ? 84 : 90} r="6" fill="#1d3b2a" />
        <circle cx={mood === 'think' ? 116 : 114} cy={mood === 'think' ? 84 : 90} r="6" fill="#1d3b2a" />
      </g>
      <circle cx="50" cy="108" r="8" fill="#ff9fb5" opacity="0.7" />
      <circle cx="130" cy="108" r="8" fill="#ff9fb5" opacity="0.7" />
      <path d={mouth} stroke="#1d3b2a" strokeWidth="5" strokeLinecap="round" fill="none" />
    </svg>
  );
}
