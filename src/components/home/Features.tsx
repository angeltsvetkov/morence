import React from 'react';
import { Baby, Waves, Shield } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';

const Features: React.FC = () => {
  const { t } = useLanguage();
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <h2 className="text-3xl sm:text-4xl font-bold text-center mb-8 sm:mb-12 reveal-slide-up">
        {t('features')}
      </h2>
      <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto stagger-children">
        <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow hover-lift">
          <div className="text-center mb-6">
            <Baby className="text-blue-600 mb-4 h-12 w-12 mx-auto" />
            <h3 className="text-2xl font-semibold mb-2">{t('spaceAndSafety')}</h3>
          </div>
          <p className="text-gray-600 text-center">{t('spaceAndSafetyDesc')}</p>
        </div>
        <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow hover-lift">
          <div className="text-center mb-6">
            <Waves className="text-blue-600 mb-4 h-12 w-12 mx-auto" />
            <h3 className="text-2xl font-semibold mb-2">{t('everythingNearby')}</h3>
          </div>
          <p className="text-gray-600 text-center">{t('everythingNearbyDesc')}</p>
        </div>
        <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow hover-lift">
          <div className="text-center mb-6">
            <Shield className="text-blue-600 mb-4 h-12 w-12 mx-auto" />
            <h3 className="text-2xl font-semibold mb-2">{t('peaceAndSecurity')}</h3>
          </div>
          <p className="text-gray-600 text-center">{t('peaceAndSecurityDesc')}</p>
        </div>
      </div>
    </div>
  );
};

export default Features;
