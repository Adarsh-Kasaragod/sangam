// frontend/src/main.jsx
// React entry point — mounts App into the DOM.

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/global.css'; // Design system first
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
