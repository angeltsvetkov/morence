import { useContext } from 'react';
import { LanguageContext, Language } from '../contexts/LanguageContext';
import enTranslations from '../locales/public/en.json';
import bgTranslations from '../locales/public/bg.json';

type PublicTranslations = Record<string, string | string[] | Record<string, string>>;

const languagePacks: Record<Language, PublicTranslations> = {
  en: enTranslations,
  bg: bgTranslations,
  ru: enTranslations, // Fallback to English for Russian
};

export function usePublicLanguage() {
  const context = useContext(LanguageContext);
  
  if (!context) {
    throw new Error('usePublicLanguage must be used within a LanguageProvider');
  }

  const { language, setLanguage } = context;

  // Get the public translation function
  const t = (key: string, replacements?: Record<string, string>): string => {
    const translations = languagePacks[language];
    let translation = translations[key];
    
    // Handle complex nested objects (like rooms)
    if (typeof translation === 'object' && !Array.isArray(translation)) {
      return JSON.stringify(translation); // Or handle differently based on your needs
    }
    
    // Handle arrays (like weekDays)
    if (Array.isArray(translation)) {
      return translation.join(', '); // Or handle differently based on your needs
    }
    
    // Fallback to English if translation doesn't exist
    if (!translation || typeof translation !== 'string') {
      const fallbackTranslation = languagePacks.en[key];
      if (typeof fallbackTranslation === 'string') {
        translation = fallbackTranslation;
      }
    }
    
    // Fallback to the key itself if no translation found
    if (!translation || typeof translation !== 'string') {
      return key;
    }

    // Handle string replacements (e.g., for {key} placeholders)
    if (replacements) {
      Object.entries(replacements).forEach(([placeholder, value]) => {
        translation = (translation as string).replace(`{${placeholder}}`, value);
      });
    }

    return translation as string;
  };

  // Special function to get complex objects (like rooms)
  const getObject = (key: string): Record<string, string> | null => {
    const translations = languagePacks[language];
    const translation = translations[key];
    
    if (typeof translation === 'object' && !Array.isArray(translation)) {
      return translation as Record<string, string>;
    }
    
    // Fallback to English
    const fallbackTranslation = languagePacks.en[key];
    if (typeof fallbackTranslation === 'object' && !Array.isArray(fallbackTranslation)) {
      return fallbackTranslation as Record<string, string>;
    }
    
    return null;
  };

  // Special function to get arrays (like weekDays)
  const getArray = (key: string): string[] | null => {
    const translations = languagePacks[language];
    const translation = translations[key];
    
    if (Array.isArray(translation)) {
      return translation;
    }
    
    // Fallback to English
    const fallbackTranslation = languagePacks.en[key];
    if (Array.isArray(fallbackTranslation)) {
      return fallbackTranslation;
    }
    
    return null;
  };

  return {
    language,
    setLanguage,
    t,
    getObject,
    getArray,
    // Helper to check if we have a translation for a key
    hasTranslation: (key: string) => !!languagePacks[language][key] || !!languagePacks.en[key],
    // For backward compatibility, remove loading since we don't need to fetch from Firestore
    loading: false
  };
} 