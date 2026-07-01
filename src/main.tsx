import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Intercept global window.fetch to support production backend base API url
const originalFetch = window.fetch;
window.fetch = (input, init) => {
  if (typeof input === 'string' && input.startsWith('/api')) {
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    input = `${apiBase}${input}`;
  }
  return originalFetch(input, init);
};

// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const swPath = import.meta.env.DEV ? '/sw.js' : '/crackplace-frontend/sw.js';
    navigator.serviceWorker.register(swPath)
      .then(reg => console.log('Service Worker registered successfully:', reg.scope))
      .catch(err => console.error('Service Worker registration failed:', err));
  });
}

// Parse redirect query parameter to restore path for client-side routing on GitHub Pages
const params = new URLSearchParams(window.location.search);
const redirect = params.get('redirect');
if (redirect) {
  const base = import.meta.env.DEV ? '' : '/crackplace-frontend';
  window.history.replaceState(null, '', base + redirect);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
