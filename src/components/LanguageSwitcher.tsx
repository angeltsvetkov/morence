import { useLanguage } from '../contexts/LanguageContext';

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-gray-200 shadow-lg">
        <button
          onClick={() => setLanguage('bg')}
          className={`px-2 py-1 rounded-md transition-colors ${
            language === 'bg' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          БГ
        </button>
        <button
          onClick={() => setLanguage('en')}
          className={`px-2 py-1 rounded-md transition-colors ${
            language === 'en' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          EN
        </button>
      </div>
    </div>
  );
} 