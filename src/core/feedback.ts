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

/** Читает вопрос вслух русским голосом планшета, если он есть. */
export function speak(text: string) {
  if (!('speechSynthesis' in window)) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ru-RU';
  const voice = speechSynthesis.getVoices().find((v) => v.lang.startsWith('ru'));
  if (voice) utterance.voice = voice;
  speechSynthesis.cancel();
  speechSynthesis.speak(utterance);
}
