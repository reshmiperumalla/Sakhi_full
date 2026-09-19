import React, { createContext, useContext, useState, useEffect } from 'react';
import { dictionaries } from '../translations/index.js';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    return localStorage.getItem('mitra_lang') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('mitra_lang', currentLanguage);
    document.documentElement.lang = currentLanguage;
  }, [currentLanguage]);

  const setLanguage = (lang) => {
    if (dictionaries[lang]) {
      setCurrentLanguage(lang);
      localStorage.setItem('mitra_lang', lang);
    }
  };

  // Translation helper: t('dashboard.money_in', 'Fallback text')
  const t = (path, defaultVal = '') => {
    if (!path) return '';
    const keys = path.split('.');
    let current = dictionaries[currentLanguage] || dictionaries.en;

    for (const key of keys) {
      if (current && current[key] !== undefined) {
        current = current[key];
      } else {
        // Fallback to English dictionary
        let fallback = dictionaries.en;
        for (const fKey of keys) {
          if (fallback && fallback[fKey] !== undefined) {
            fallback = fallback[fKey];
          } else {
            return defaultVal || path;
          }
        }
        return fallback;
      }
    }
    return current;
  };

  return (
    <LanguageContext.Provider value={{
      currentLanguage,
      language: currentLanguage, // alias for backwards compatibility
      setLanguage,
      t
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
