import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App';
import './styles.css';

// Новая версия ставится сама при следующем запуске. Планшет держит приложение
// в памяти, поэтому обновление проверяется и при каждом возвращении в игру.
registerSW({
  immediate: true,
  onRegisteredSW(_url, registration) {
    if (!registration) return;
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState !== 'visible') return;
      registration.update().catch(() => {
        // Нет сети — проверим в следующий раз.
      });
    });
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
