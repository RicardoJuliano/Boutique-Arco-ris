import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Impede o browser de restaurar a posição de scroll ao navegar (ex: botão Voltar)
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
