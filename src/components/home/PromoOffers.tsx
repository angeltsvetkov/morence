import React from 'react';
import { CalendarDays } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';

const PromoOffers: React.FC = () => {
  const { t } = useLanguage();

  const offers = [
    {
      title: t('promoOffer1Title'),
      description: t('promoOffer1Desc'),
    },
    {
      title: t('promoOffer2Title'),
      description: t('promoOffer2Desc'),
    },
    {
        title: t('promoOffer3Title'),
        description: t('promoOffer3Desc'),
    }
  ];

  return (
    <div className="mt-8 bg-gradient-to-br from-blue-600 to-blue-800 p-8 sm:p-12 rounded-xl shadow-lg relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-white/[0.1] bg-[size:20px_20px]"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-blue-600/50 to-transparent"></div>
      
      <h3 className="text-2xl sm:text-3xl font-semibold text-center mb-12 text-white relative reveal-slide-up">
        {t('promoOffersTitle')}
      </h3>

      <div className="grid md:grid-cols-1 gap-6 max-w-4xl mx-auto relative stagger-children">
        {offers.map((offer, index) => (
          <div key={index} className="group bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20 hover-lift cursor-pointer transition-all duration-300 hover:bg-white/20">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-blue-500/20 rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                <CalendarDays className="h-8 w-8 text-blue-100" />
              </div>
              <p className="font-medium text-lg text-white">
                {offer.title}
              </p>
              <p className="text-sm text-blue-100">
                {offer.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="absolute -left-12 -bottom-8 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl"></div>
      <div className="absolute -right-12 -top-8 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl"></div>
    </div>
  );
};

export default PromoOffers;
