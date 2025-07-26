import { useLanguage } from '../hooks/useLanguage';
import { Language } from '../contexts/LanguageContext';

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
  };

  return (
    <div className="flex items-center gap-1 bg-white/60 backdrop-blur-sm rounded-full p-1 border border-white/40 shadow-lg shadow-black/5">
      <button
        onClick={() => handleSetLanguage('bg')}
        className={`relative px-3 py-1.5 text-xs font-bold rounded-full transition-all duration-300 transform hover:scale-105 ${
          language === 'bg'
            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25'
            : 'text-gray-600 hover:text-gray-900 hover:bg-white/80 hover:shadow-md'
        }`}
      >
        <span className="relative z-10">BG</span>
        {language === 'bg' && (
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full opacity-50 blur-sm"></div>
        )}
      </button>
      <button
        onClick={() => handleSetLanguage('en')}
        className={`relative px-3 py-1.5 text-xs font-bold rounded-full transition-all duration-300 transform hover:scale-105 ${
          language === 'en'
            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25'
            : 'text-gray-600 hover:text-gray-900 hover:bg-white/80 hover:shadow-md'
        }`}
      >
        <span className="relative z-10">EN</span>
        {language === 'en' && (
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full opacity-50 blur-sm"></div>
        )}
      </button>
    </div>
  );
};

export default LanguageSwitcher;