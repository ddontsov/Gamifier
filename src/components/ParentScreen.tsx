import { useRef, useState } from 'react';
import { progressKey } from '../core/leitner';
import { downloadSave, newSave, parseSave } from '../core/save';
import type { SaveData, TopicModule } from '../core/types';

interface Props {
  save: SaveData;
  topic: TopicModule;
  onReplace: (save: SaveData) => void;
  onClose: () => void;
}

const BOX_LABEL = ['', 'не знает', 'учит', 'почти', 'знает', 'отлично'];

/** Экран для родителя: карта знаний, экспорт и импорт прогресса. */
export function ParentScreen({ save, topic, onReplace, onClose }: Props) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);
  const range = [2, 3, 4, 5, 6, 7, 8, 9];

  const importFile = async (file: File) => {
    try {
      onReplace(parseSave(await file.text()));
      setMessage('Прогресс загружен.');
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Не получилось прочитать файл.');
    }
  };

  return (
    <div className="screen parent">
      <header className="parent-head">
        <h1>Для родителя</h1>
        <button className="btn btn-secondary" onClick={onClose}>
          Назад к игре
        </button>
      </header>

      <section>
        <h2>{topic.title}</h2>
        <p className="muted">
          Цвет клетки показывает, насколько хорошо Катя знает пример. Занятий: {save.sessions}, монет:{' '}
          {save.coins}.
        </p>
        <table className="grid">
          <thead>
            <tr>
              <th>×</th>
              {range.map((b) => (
                <th key={b}>{b}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {range.map((a) => (
              <tr key={a}>
                <th>{a}</th>
                {range.map((b) => {
                  const p = save.progress[progressKey(topic.id, `${a}x${b}`)];
                  const box = p?.box ?? 0;
                  return (
                    <td
                      key={b}
                      className={p ? `box-${box}` : 'box-none'}
                      title={p ? `${BOX_LABEL[box]}, верно ${p.correct} из ${p.seen}` : 'ещё не было'}
                    >
                      {a * b}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        <p className="legend">
          <span className="box-none">ещё не было</span>
          <span className="box-1">не знает</span>
          <span className="box-3">учит</span>
          <span className="box-5">знает отлично</span>
        </p>
      </section>

      <section>
        <h2>Перенос прогресса</h2>
        <p className="muted">Сохраните файл и откройте его на другом устройстве через «Загрузить из файла».</p>
        <div className="row">
          <button className="btn" onClick={() => downloadSave(save)}>
            Сохранить в файл
          </button>
          <button className="btn btn-secondary" onClick={() => fileInput.current?.click()}>
            Загрузить из файла
          </button>
          <input
            ref={fileInput}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void importFile(file);
              e.target.value = '';
            }}
          />
        </div>
        {message && <p className="message">{message}</p>}
      </section>

      <section>
        <h2>Начать заново</h2>
        {confirmReset ? (
          <div className="row">
            <button
              className="btn btn-danger"
              onClick={() => {
                onReplace(newSave());
                setConfirmReset(false);
                setMessage('Прогресс сброшен.');
              }}
            >
              Да, стереть весь прогресс
            </button>
            <button className="btn btn-secondary" onClick={() => setConfirmReset(false)}>
              Отмена
            </button>
          </div>
        ) : (
          <button className="btn btn-secondary" onClick={() => setConfirmReset(true)}>
            Сбросить прогресс
          </button>
        )}
      </section>

      <p className="muted version">Версия {__APP_BUILD__}</p>
    </div>
  );
}
