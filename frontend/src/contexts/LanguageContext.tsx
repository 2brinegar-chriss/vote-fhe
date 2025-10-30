import { createContext, useContext, ReactNode } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { Translations } from '../i18n/translations';

interface LanguageContextType {
  language: 'zh' | 'en';
  toggleLanguage: () => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { language, toggleLanguage, t } = useLanguage();

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguageContext() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguageContext must be used within LanguageProvider');
  }
  return context;
}

