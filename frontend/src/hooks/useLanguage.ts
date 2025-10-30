import { useState, useEffect } from 'react';
import { Language, translations } from '../i18n/translations';

const LANGUAGE_KEY = 'platformvoting_language';

export function useLanguage() {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem(LANGUAGE_KEY);
    return (saved === 'en' || saved === 'zh') ? saved : 'zh';
  });

  useEffect(() => {
    localStorage.setItem(LANGUAGE_KEY, language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'zh' ? 'en' : 'zh');
  };

  const t = translations[language];

  return { language, toggleLanguage, t };
}

