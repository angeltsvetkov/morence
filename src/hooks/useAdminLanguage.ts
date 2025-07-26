import { useContext } from 'react';
import { LanguageContext, Language } from '../contexts/LanguageContext';

// Import language packs
import enTranslations from '../locales/admin/en.json';
import bgTranslations from '../locales/admin/bg.json';

type AdminTranslations = {
  [key: string]: string;
};

const languagePacks: Record<Language, AdminTranslations> = {
  en: enTranslations,
  bg: bgTranslations,
  ru: enTranslations, // Fallback to English for Russian
};

export function useAdminLanguage() {
  const context = useContext(LanguageContext);
  
  if (!context) {
    throw new Error('useAdminLanguage must be used within a LanguageProvider');
  }

  const { language, setLanguage } = context;

  // Get the admin translation function
  const t = (key: string, replacements?: Record<string, string>): string => {
    const translations = languagePacks[language];
    let translation = translations[key];
    
    // Fallback to English if translation doesn't exist
    if (!translation) {
      translation = languagePacks.en[key];
    }
    
    // Fallback to the key itself if no translation found
    if (!translation) {
      return key;
    }

    // Handle string replacements (e.g., for {key} placeholders)
    if (replacements) {
      Object.entries(replacements).forEach(([placeholder, value]) => {
        translation = translation.replace(`{${placeholder}}`, value);
      });
    }

    return translation;
  };

  return {
    language,
    setLanguage,
    t,
    // Helper to check if we have a translation for a key
    hasTranslation: (key: string) => !!languagePacks[language][key] || !!languagePacks.en[key]
  };
} 