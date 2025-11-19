// client/src/main.jsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './app';
import './styles.css'; // lightweight helpers (optional)

createRoot(document.getElementById('root')).render(<App />);