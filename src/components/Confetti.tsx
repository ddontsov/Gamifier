import type { CSSProperties } from 'react';

const COLORS = ['#ffc531', '#7c5cff', '#2fbf71', '#ff8ab8', '#4fd1ff', '#ff9f43'];
const PIECES = 48;

/** Салют из конфетти. Положение кусочков псевдослучайное, но одинаковое при каждом показе. */
export function Confetti() {
  return (
    <div className="confetti" aria-hidden="true">
      {Array.from({ length: PIECES }, (_, i) => (
        <span
          key={i}
          style={
            {
              left: `${(i * 37) % 100}%`,
              background: COLORS[i % COLORS.length],
              animationDelay: `${((i * 53) % 100) / 80}s`,
              animationDuration: `${2.2 + ((i * 29) % 100) / 60}s`,
              '--turn': `${(i * 71) % 360}deg`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
