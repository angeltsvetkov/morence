import React from 'react';
import { Phone } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';

const CallToActionButton: React.FC = () => {
  const { t } = useLanguage();
  return (
    <div className="fixed bottom-6 right-6 z-40">
      <a
        href="tel:+359883460715"
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
      >
        <Phone className="h-5 w-5" />
        <span className="hidden sm:inline">{t('callUs')}: </span>
        <span>+359883460715</span>
      </a>
    </div>
  );
};

export default CallToActionButton;
