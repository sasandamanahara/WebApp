import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app/App.jsx';
import { AppThemeProvider } from './theme/ThemeContext.jsx';
import './app/index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppThemeProvider>
      <App />
    </AppThemeProvider>
  </React.StrictMode>
);
