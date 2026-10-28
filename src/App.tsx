import { useEffect, useRef, useState } from 'react';
import { Bulk } from './components/Bulk';
import { ParentScreen } from './components/ParentScreen';
import { bulk, phrase, type Mood } from './core/characters';
import { playCorrect, playTryAgain, speak } from './core/feedback';
import { loadSave, newSave, storeSave } from './core/save';
import { SESSION_LENGTH, advance, answer, isFinished, startSession, type Session } from './core/session';
import type { Question, SaveData } from './core/types';
import { NumberInput } from './exercises/NumberInput';
import { multiplication } from './topics/multiplication';

type Screen = 'home' | 'play' | 'finish' | 'parent';
type Feedback = 'none' | 'correct' | 'try-again' | 'reveal';

const topic = multiplication;
const PARENT_HOLD_MS = 1500;
const NEXT_DELAY_MS = 1300;

export default function App() {
  const [save, setSave] = useState<SaveData>(newSave);
  const [loaded, setLoaded] = useState(false);
  const [screen, setScreen] = useState<Screen>('home');
  const [session, setSession] = useState<Session | null>(null);
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState<Feedback>('none');
  const [speech, setSpeech] = useState(() => phrase(bulk, 'start'));
  const [mood, setMood] = useState<Mood>('idle');
  const holdTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    void loadSave().then((s) => {
      setSave(s);
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (loaded) void storeSave(save);
  }, [save, loaded]);

  const start = () => {
    setSession(startSession(topic, save));
    setInput('');
    setFeedback('none');
    setMood('idle');
    setSpeech(phrase(bulk, 'start'));
    setScreen('play');
  };

  const goNext = (current: Session, currentSave: SaveData) => {
    if (isFinished(current)) {
      setSave({ ...currentSave, sessions: currentSave.sessions + 1 });
      setSpeech(phrase(bulk, 'finish'));
      setMood('happy');
      setScreen('finish');
      return;
    }
    setSession(advance(current, currentSave));
    setInput('');
    setFeedback('none');
    setMood('idle');
  };

  const submit = () => {
    if (!session || feedback === 'correct' || feedback === 'reveal') return;
    const result = answer(session, save, input);
    setSession(result.session);
    setSave(result.save);

    if (result.outcome === 'correct') {
      playCorrect();
      setFeedback('correct');
      setMood('happy');
      setSpeech(phrase(bulk, result.bonus ? 'streak' : 'correct'));
      window.setTimeout(() => goNext(result.session, result.save), NEXT_DELAY_MS);
    } else if (result.outcome === 'try-again') {
      playTryAgain();
      setFeedback('try-again');
      setMood('think');
      setSpeech(`${phrase(bulk, 'tryAgain')} ${topic.hint(session.question, input)}`);
      setInput('');
    } else {
      setFeedback('reveal');
      setMood('think');
      setSpeech(phrase(bulk, 'reveal'));
    }
  };

  // Вход для родителя — долгое нажатие, чтобы Катя не попадала туда случайно.
  const holdStart = () => {
    holdTimer.current = window.setTimeout(() => setScreen('parent'), PARENT_HOLD_MS);
  };
  const holdEnd = () => window.clearTimeout(holdTimer.current);

  if (screen === 'parent') {
    return <ParentScreen save={save} topic={topic} onReplace={setSave} onClose={() => setScreen('home')} />;
  }

  return (
    <div className={`screen ${screen}`}>
      <header className="topbar">
        <div className="coins" aria-label="Монетки">
          <span className="coin">●</span> {save.coins}
        </div>
        {screen === 'play' && session && (
          <div className="dots" aria-label={`Вопрос ${session.index + 1} из ${SESSION_LENGTH}`}>
            {Array.from({ length: SESSION_LENGTH }, (_, i) => (
              <span key={i} className={i < session.index ? 'dot done' : i === session.index ? 'dot now' : 'dot'} />
            ))}
          </div>
        )}
        <button
          className="gear"
          aria-label="Для родителя: удерживайте"
          onPointerDown={holdStart}
          onPointerUp={holdEnd}
          onPointerLeave={holdEnd}
          onContextMenu={(e) => e.preventDefault()}
        >
          ⚙
        </button>
      </header>

      <div className="stage">
        <div className="hero">
          <div className="bubble">{speech}</div>
          <Bulk mood={mood} />
        </div>

        {screen === 'home' && (
          <div className="panel center">
            <h1 className="title">{topic.title}</h1>
            <button className="btn btn-big" onClick={start} disabled={!loaded}>
              Играть
            </button>
          </div>
        )}

        {screen === 'play' && session && (
          <div className="panel">
            <QuestionCard question={session.question} input={input} feedback={feedback} />
            {feedback === 'reveal' ? (
              <button className="btn btn-big" onClick={() => goNext(session, save)}>
                Дальше
              </button>
            ) : (
              <Exercise
                question={session.question}
                value={input}
                onChange={setInput}
                onSubmit={submit}
                disabled={feedback === 'correct'}
              />
            )}
          </div>
        )}

        {screen === 'finish' && session && (
          <div className="panel center">
            <h1 className="title">Готово!</h1>
            <p className="result">
              С первой попытки: {session.firstTryCorrect} из {SESSION_LENGTH}
            </p>
            <p className="result">
              Монеток за игру: <strong>+{session.coinsEarned}</strong>
            </p>
            <div className="row">
              <button className="btn btn-big" onClick={start}>
                Ещё раз
              </button>
              <button className="btn btn-secondary" onClick={() => setScreen('home')}>
                Домой
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function QuestionCard({ question, input, feedback }: { question: Question; input: string; feedback: Feedback }) {
  const shown = feedback === 'reveal' ? question.answer : input || '?';
  return (
    <div className={`question feedback-${feedback}`}>
      <span className="prompt">{question.prompt} =</span>
      <span className="answer">{shown}</span>
      <button className="speak" onClick={() => speak(question.speech)} aria-label="Прочитать вслух">
        🔊
      </button>
    </div>
  );
}

/** Выбирает экран ввода по типу задания. Новые типы добавляются сюда. */
function Exercise(props: {
  question: Question;
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  disabled: boolean;
}) {
  switch (props.question.kind) {
    case 'number-input':
      return (
        <NumberInput
          value={props.value}
          onChange={props.onChange}
          onSubmit={props.onSubmit}
          disabled={props.disabled}
        />
      );
  }
}
