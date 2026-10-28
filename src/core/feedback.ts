/** Короткие звуки через Web Audio, без файлов. */
let ctx: AudioContext | null = null;

function tone(freq: number, start: number, duration: number) {
  ctx ??= new AudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.value = freq;
  const t = ctx.currentTime + start;
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(0.25, t + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + duration);
}

export function playCorrect() {
  try {
    tone(660, 0, 0.15);
    tone(880, 0.12, 0.25);
  } catch {
    // Без звука игра тоже работает.
  }
}

export function playTryAgain() {
  try {
    tone(330, 0, 0.25);
  } catch {
    // Без звука игра тоже работает.
  }
}

export function playChest() {
  try {
    tone(523, 0, 0.15);
    tone(659, 0.1, 0.15);
    tone(784, 0.2, 0.15);
    tone(1047, 0.3, 0.35);
  } catch {
    // Без звука игра тоже работает.
  }
}
