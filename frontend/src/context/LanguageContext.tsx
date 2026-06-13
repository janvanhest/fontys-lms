import { createContext, useContext, useState, type ReactNode } from 'react';

export type ChatLanguage = 'nl' | 'en';

const STORAGE_KEY = 'lms-chat-language';

function readStoredLanguage(): ChatLanguage {
  if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') return 'nl';
  return localStorage.getItem(STORAGE_KEY) === 'en' ? 'en' : 'nl';
}

interface LanguageContextValue {
  language: ChatLanguage;
  setLanguage: (lang: ChatLanguage) => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<ChatLanguage>(readStoredLanguage);

  const setLanguage = (lang: ChatLanguage) => {
    localStorage.setItem(STORAGE_KEY, lang);
    setLanguageState(lang);
  };

  return (
    <LanguageContext value={{ language, setLanguage }}>
      {children}
    </LanguageContext>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
