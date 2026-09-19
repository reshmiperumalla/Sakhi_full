import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { OfflineProvider } from './context/OfflineContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LanguageProvider>
      <AuthProvider>
        <OfflineProvider>
          <App />
        </OfflineProvider>
      </AuthProvider>
    </LanguageProvider>
  </React.StrictMode>
);
