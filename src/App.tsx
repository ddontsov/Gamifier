import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { BossView } from './components/BossView';
import { Celebration } from './components/Celebration';
import { Confetti } from './components/Confetti';
import { ParentScreen } from './components/ParentScreen';
import { Slime } from './components/Slime';
import { WorldMap } from './components/WorldMap';
import { BOSS_LIVES, answerBoss, startBoss, type BossFight } from './core/boss';
import { bossPhrase, characterById, greeting, phrase, type Mood } from './core/characters';
import { playChest, playCorrect, playFanfare, playTryAgain } from './core/feedback';
import { lockState, openChest } from './core/rewards';
import { loadSave, newSave, storeSave } from './core/save';
import { SESSION_LENGTH, advance, answer, isFinished, startSession, type Session } from './core/session';
import type { Question, SaveData, TopicModule, WorldBoss, WorldItem, WorldLocation } from './core/types';
import { NumberInput } from './exercises/NumberInput';
import { multiplication } from './topics/multiplication';
import { locationById, locations } from './world/locations';

type Screen = 'home' | 'play' | 'finish' | 'map' | 'parent' | 'boss';
type Feedback = 'none' | 'correct' | 'try-again' | 'reveal';
type Chest = { state: 'closed' } | { state: 'open'; item: WorldItem | null; coins: number };

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
  const [speech, setSpeech] = useState('');
  const [mood, setMood] = useState<Mood>('idle');
  const [chest, setChest] = useState<Chest>({ state: 'closed' });
  // Всплывающее «+2» или «−4» у счётчика монет; id перезапускает анимацию.
  const [coinDelta, setCoinDelta] = useState<{ id: number; value: number } | null>(null);
  // Бой с боссом. Вопрос на экране меняется с задержкой, а здоровье и жизни — сразу.
  const [fight, setFight] = useState<BossFight | null>(null);
  const [bossQuestion, setBossQuestion] = useState<Question | null>(null);
  const [bossEnd, setBossEnd] = useState<'won' | 'lost' | null>(null);
  const [celebration, setCelebration] = useState<WorldLocation | null>(null);
  const holdTimer = useRef<number | undefined>(undefined);

  const location = locationById(save.location);
  const character = characterById(location.characterId);

  useEffect(() => {
    void loadSave().then((s) => {
      setSave(s);
      setSpeech(phrase(characterById(locationById(s.location).characterId), 'start'));
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
    setSpeech(phrase(character, 'start'));
    setScreen('play');
  };

  const goHome = () => {
    setMood('idle');
    setSpeech(phrase(character, 'start'));
    setScreen('home');
  };

  const changeFromMap = (next: SaveData) => {
    setSave(next);
    if (next.location === save.location) return;
    const place = locationById(next.location);
    setSpeech(greeting(characterById(place.characterId)));
    setMood('happy');
    setScreen('home');
    if (next.unlocked.length > save.unlocked.length) {
      setCelebration(place);
      playFanfare();
    }
  };

  const goNext = (current: Session, currentSave: SaveData) => {
    if (isFinished(current)) {
      setSave({ ...currentSave, sessions: currentSave.sessions + 1 });
      setSpeech(phrase(character, 'finish'));
      setMood('happy');
      setChest({ state: 'closed' });
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
    if (result.coins !== 0) setCoinDelta((d) => ({ id: (d?.id ?? 0) + 1, value: result.coins }));

    if (result.outcome === 'correct') {
      playCorrect();
      setFeedback('correct');
      setMood('happy');
      setSpeech(phrase(character, result.bonus ? 'streak' : 'correct'));
      window.setTimeout(() => goNext(result.session, result.save), NEXT_DELAY_MS);
    } else if (result.outcome === 'try-again') {
      playTryAgain();
      setFeedback('try-again');
      setMood('think');
      setSpeech(`${phrase(character, 'tryAgain')} ${topic.hint(session.question, input)}`);
      setInput('');
    } else {
      setFeedback('reveal');
      setMood('think');
      setSpeech(phrase(character, 'reveal'));
    }
  };

  const open = () => {
    const result = openChest(save, location);
    setSave(result.save);
    setChest({ state: 'open', item: result.item, coins: result.coins });
    setSpeech(result.item ? `Смотри, что в сундучке: ${result.item.name}!` : 'Коллекция собрана! Держи монетки!');
    playChest();
  };

  const startFight = (boss: WorldBoss) => {
    const next = startBoss(topic, boss);
    setFight(next);
    setBossQuestion(next.question);
    setBossEnd(null);
    setInput('');
    setFeedback('none');
    setSpeech(bossPhrase('start'));
    setScreen('boss');
  };

  const submitBoss = () => {
    if (!fight || feedback === 'correct' || feedback === 'reveal') return;
    const result = answerBoss(fight, save, input);
    setFight(result.fight);
    setSave(result.save);
    if (result.outcome === 'hit' || result.outcome === 'won') {
      playCorrect();
      setFeedback('correct');
      setSpeech(bossPhrase(result.outcome === 'won' ? 'won' : 'hit'));
      window.setTimeout(() => {
        if (result.outcome === 'won') {
          playFanfare();
          setBossEnd('won');
        } else {
          setBossQuestion(result.fight.question);
          setInput('');
          setFeedback('none');
        }
      }, NEXT_DELAY_MS);
    } else {
      playTryAgain();
      setFeedback('reveal');
      setSpeech(bossPhrase(result.outcome === 'lost' ? 'lost' : 'miss'));
    }
  };

  const afterBossMiss = () => {
    if (!fight) return;
    if (fight.lives === 0) {
      setBossEnd('lost');
      return;
    }
    setBossQuestion(fight.question);
    setInput('');
    setFeedback('none');
  };

  // Вход для родителя — долгое нажатие, чтобы Катя не попадала туда случайно.
  const holdStart = () => {
    holdTimer.current = window.setTimeout(() => setScreen('parent'), PARENT_HOLD_MS);
  };
  const holdEnd = () => window.clearTimeout(holdTimer.current);

  if (screen === 'parent') {
    return <ParentScreen save={save} topic={topic} onReplace={setSave} onClose={goHome} />;
  }

  const theme = {
    '--bg': location.background[0],
    '--bg-2': location.background[1],
  } as CSSProperties;

  return (
    <div className={`screen ${screen}`} style={theme}>
      <header className="topbar">
        <div className="coins" aria-label="Монетки">
          <span className="coin">●</span> {save.coins}
          {coinDelta && (
            <span key={coinDelta.id} className={coinDelta.value > 0 ? 'coin-delta plus' : 'coin-delta minus'}>
              {signed(coinDelta.value)}
            </span>
          )}
        </div>
        {screen === 'boss' && fight && !bossEnd && (
          <div className="lives" aria-label={`Жизни: ${fight.lives} из ${BOSS_LIVES}`}>
            {Array.from({ length: BOSS_LIVES }, (_, i) => (
              <span key={i} className={i < fight.lives ? 'life' : 'life lost'}>
                ❤️
              </span>
            ))}
          </div>
        )}
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

      {screen === 'map' ? (
        <WorldMap save={save} onChange={changeFromMap} onClose={goHome} />
      ) : (
        <div className="stage">
          <div className="hero">
            <div className="bubble">{speech}</div>
            {screen === 'boss' && fight ? (
              <BossView boss={fight.boss} hp={fight.hp} maxHp={fight.maxHp} />
            ) : (
              <Slime character={character} mood={mood} />
            )}
          </div>

          {screen === 'home' && (
            <div className="panel center">
              <div className="place-badge">
                {location.icon} {location.name}
              </div>
              <h1 className="title">{topic.title}</h1>
              <button className="btn btn-big" onClick={start} disabled={!loaded}>
                Играть
              </button>
              <button className="btn btn-secondary" onClick={() => setScreen('map')}>
                🗺️ Карта мира
              </button>
              <BossList bosses={location.bosses} save={save} topic={topic} onFight={startFight} />
              <NextGoal save={save} />
            </div>
          )}

          {screen === 'boss' && fight && bossQuestion && !bossEnd && (
            <div className="panel">
              <QuestionCard question={bossQuestion} input={input} feedback={feedback} />
              {feedback === 'reveal' ? (
                <button className="btn btn-big" onClick={afterBossMiss}>
                  Дальше
                </button>
              ) : (
                <Exercise
                  question={bossQuestion}
                  value={input}
                  onChange={setInput}
                  onSubmit={submitBoss}
                  disabled={feedback === 'correct'}
                />
              )}
            </div>
          )}

          {screen === 'boss' && fight && bossEnd === 'won' && (
            <div className="panel center">
              <Confetti />
              <h1 className="title">Победа!</h1>
              <div className="prize">
                <span className="prize-icon">🏆</span>
                <span>
                  Трофей: {fight.boss.icon} {fight.boss.name}
                </span>
              </div>
              <button className="btn btn-big" onClick={goHome}>
                Дальше
              </button>
            </div>
          )}

          {screen === 'boss' && fight && bossEnd === 'lost' && (
            <div className="panel center">
              <h1 className="title">Босс устоял</h1>
              <p className="result">Повтори столбик и попробуй ещё раз:</p>
              <ColumnTable topic={topic} groupId={fight.boss.group} />
              <div className="row">
                <button className="btn btn-big" onClick={() => startFight(fight.boss)}>
                  Ещё раз
                </button>
                <button className="btn btn-secondary" onClick={goHome}>
                  Назад
                </button>
              </div>
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
                Монеток за игру: <strong>{signed(session.coinsEarned)}</strong>
              </p>
              {chest.state === 'closed' ? (
                <button className="chest" onClick={open} aria-label="Открыть сундучок">
                  <span className="chest-icon">🎁</span>
                  <span>Открой сундучок!</span>
                </button>
              ) : (
                <>
                  <div className="prize">
                    <span className="prize-icon">{chest.item ? chest.item.icon : '💰'}</span>
                    <span>{chest.item ? chest.item.name : `+${chest.coins} монеток`}</span>
                  </div>
                  <NextGoal save={save} />
                  <div className="row">
                    <button className="btn btn-big" onClick={start}>
                      Ещё раз
                    </button>
                    <button className="btn btn-secondary" onClick={() => setScreen('map')}>
                      🗺️ Карта мира
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {celebration && <Celebration location={celebration} onClose={() => setCelebration(null)} />}
    </div>
  );
}

function signed(n: number): string {
  return n > 0 ? `+${n}` : n < 0 ? `−${-n}` : '0';
}

/** Подсказка, зачем копить монетки: сколько осталось до следующей локации. */
function NextGoal({ save }: { save: SaveData }) {
  const next = locations.find((l) => !save.unlocked.includes(l.id));
  if (!next) return <p className="goal">Ты открыла весь мир! Собирай коллекции.</p>;
  if (lockState(save, locations, next) === 'can-unlock') {
    return (
      <p className="goal goal-ready">
        Хватает монеток, чтобы открыть {next.icon} {next.name}! Загляни на карту.
      </p>
    );
  }
  return (
    <p className="goal">
      Ещё <span className="coin">●</span> {next.price - save.coins} — и откроется {next.icon} {next.name}
    </p>
  );
}

/** Боссы текущей локации: с кем можно сразиться и кто уже побеждён. */
function BossList(props: {
  bosses: WorldBoss[];
  save: SaveData;
  topic: TopicModule;
  onFight: (boss: WorldBoss) => void;
}) {
  const groups = props.topic.groups();
  return (
    <div className="boss-list">
      {props.bosses.map((boss) => {
        const beaten = props.save.bosses.includes(boss.id);
        return (
          <button key={boss.id} className={beaten ? 'boss-btn beaten' : 'boss-btn'} onClick={() => props.onFight(boss)}>
            <span className="boss-btn-icon">{boss.icon}</span>
            <span className="boss-btn-text">
              <span>
                {beaten ? '🏆' : '⚔️'} {boss.name}
              </span>
              <small>{groups.find((g) => g.id === boss.group)?.title}</small>
            </span>
          </button>
        );
      })}
    </div>
  );
}

/** Весь столбик с ответами, чтобы повторить его после проигрыша боссу. */
function ColumnTable({ topic, groupId }: { topic: TopicModule; groupId: string }) {
  const group = topic.groups().find((g) => g.id === groupId);
  if (!group) return null;
  return (
    <div className="column-table">
      {group.items.map((id) => {
        const q = topic.question(id);
        return (
          <span key={id}>
            {q.prompt} = <strong>{q.answer}</strong>
          </span>
        );
      })}
    </div>
  );
}

function QuestionCard({ question, input, feedback }: { question: Question; input: string; feedback: Feedback }) {
  const shown = feedback === 'reveal' ? question.answer : input || '?';
  return (
    <div className={`question feedback-${feedback}`}>
      <span className="prompt">{question.prompt} =</span>
      <span className="answer">{shown}</span>
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
