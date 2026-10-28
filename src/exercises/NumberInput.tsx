import { useEffect } from 'react';

interface Props {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  maxLength?: number;
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

/** Тип задания «ввод числа»: большая цифровая клавиатура для пальцев. */
export function NumberInput({ value, onChange, onSubmit, disabled, maxLength = 3 }: Props) {
  const press = (digit: string) => {
    if (disabled || value.length >= maxLength) return;
    onChange(value === '0' ? digit : value + digit);
  };
  const erase = () => !disabled && onChange(value.slice(0, -1));
  const submit = () => !disabled && value.length > 0 && onSubmit();

  // Физическая клавиатура тоже работает: удобно при отладке на компьютере.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) press(e.key);
      else if (e.key === 'Backspace') erase();
      else if (e.key === 'Enter') submit();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <div className="keypad">
      {KEYS.map((k) => (
        <button key={k} className="key" onClick={() => press(k)} disabled={disabled}>
          {k}
        </button>
      ))}
      <button className="key key-erase" onClick={erase} disabled={disabled} aria-label="Стереть">
        ⌫
      </button>
      <button className="key" onClick={() => press('0')} disabled={disabled}>
        0
      </button>
      <button
        className="key key-ok"
        onClick={submit}
        disabled={disabled || value.length === 0}
        aria-label="Ответить"
      >
        ✓
      </button>
    </div>
  );
}
