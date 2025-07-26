import React from 'react';
import { useLanguage } from '../../hooks/useLanguage';

const Hero: React.FC = () => {
  const { t } = useLanguage();

  // Extract reusable components for cards
  const FeatureTags = ({ className = "" }) => (
    <div className={`flex flex-wrap justify-center gap-2 sm:gap-6 mb-6 sm:mb-10 max-w-3xl mx-auto ${className}`}>
      <div className="flex items-center gap-1 sm:gap-2 bg-white/10 backdrop-blur-sm px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-full border border-white/20 hover:bg-white/20 transition-colors">
        <span className="text-xs sm:text-base text-shadow-sm">{t('groundFloor')}</span>
      </div>
      <div className="flex items-center gap-1 sm:gap-2 bg-white/10 backdrop-blur-sm px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-full border border-white/20 hover:bg-white/20 transition-colors">
        <span className="text-xs sm:text-base text-shadow-sm">{t('livingRoomKitchen')}</span>
      </div>
      <div className="flex items-center gap-1 sm:gap-2 bg-white/10 backdrop-blur-sm px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-full border border-white/20 hover:bg-white/20 transition-colors">
        <span className="text-xs sm:text-base text-shadow-sm">{t('bedroom')}</span>
      </div>
      <div className="flex items-center gap-1 sm:gap-2 bg-white/10 backdrop-blur-sm px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-full border border-white/20 hover:bg-white/20 transition-colors">
        <span className="text-xs sm:text-base text-shadow-sm">{t('sofaBed')}</span>
      </div>
    </div>
  );

  const PricingCard = ({ className = "" }) => (
    <div className={`bg-gradient-to-br from-blue-600/90 via-blue-500/90 to-blue-600/90 backdrop-blur-sm p-4 sm:p-8 rounded-2xl mb-6 sm:mb-10 border border-blue-400/30 transform hover:scale-105 transition-all duration-300 hover:shadow-[0_0_30px_rgba(37,99,235,0.3)] shadow-[0_0_20px_rgba(37,99,235,0.2)] max-w-2xl mx-auto ${className}`}>
      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-10">
        <div className="text-center sm:text-left">
          <div className="text-blue-100 text-xs sm:text-base mb-1">{t('standardPrice')}</div>
          <div className="text-3xl sm:text-5xl font-bold text-white line-through opacity-80">
            220 лв.
          </div>
          <div className="text-blue-100 text-xs sm:text-sm mt-1">{t('perNight')}</div>
        </div>

        <div className="hidden sm:block w-px h-24 bg-blue-400/30"></div>
        <div className="block sm:hidden w-full h-px bg-blue-400/30"></div>

        <div className="text-center sm:text-left">
          <div className="text-blue-100 text-xs sm:text-base mb-1">{t('discountedPrice')}</div>
          <div className="text-4xl sm:text-6xl font-bold text-white">
            180 лв.
            <span className="text-sm sm:text-lg text-blue-100 ml-1 sm:ml-2 font-normal block sm:inline">{t('perNight')}</span>
          </div>
          <div className="text-blue-100 text-xs sm:text-base font-medium mt-1">
            {t('for14Nights')}
          </div>
        </div>
      </div>

      <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-blue-400/30">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0 text-xs sm:text-base text-blue-100">
          <span>{t('totalSavings')}:</span>
          <span className="font-bold text-white">280 лв. / {t('week')}</span>
        </div>
      </div>

      <div className="absolute -right-2 sm:-right-3 -top-2 sm:-top-3 bg-yellow-400 text-blue-900 px-2 sm:px-4 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-bold transform rotate-12 shadow-lg">
        -20%
      </div>
    </div>
  );

  const ActionButtons = ({ className = "" }) => (
    <div className={`flex flex-col sm:flex-row gap-3 sm:gap-6 justify-center max-w-lg sm:max-w-none mx-auto ${className}`}>
      <a
        href='#overview'
        className="group bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-10 py-3 sm:py-4 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg shadow-lg text-sm sm:text-lg relative overflow-hidden"
      >
        <span className="relative z-10">{t('checkAvailability')}</span>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-800 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
      </a>
      <a 
        href='#gallery' 
        className="group bg-white/10 hover:bg-white/20 text-white px-6 sm:px-10 py-3 sm:py-4 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg border border-white/30 shadow-lg text-sm sm:text-lg backdrop-blur-sm"
      >
        {t('gallery')}
      </a>
    </div>
  );

  return (
    <>
      {/* Hero Section */}
      <div className="relative min-h-[90vh] sm:h-[85vh] bg-cover bg-center bg-fixed motion-safe:animate-kenburns" style={{ backgroundImage: 'url("/photos/10040698_135550664_big.jpg")' }}>
        <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/50 to-black/90" />
        <div className="relative h-full flex items-center justify-center py-8 sm:py-0">
          <div className="text-center text-white max-w-4xl px-4 sm:px-6 animate-fade-in">
            <div className="mb-6 sm:mb-8 inline-block">
              <div className="bg-blue-600/20 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-blue-400/30 mb-3 sm:mb-4 inline-block">
                <span className="text-blue-200 font-medium text-sm sm:text-base">2-стаен апартамент в затворен комплекс</span>
              </div>
            </div>
            <h1 className="text-3xl sm:text-6xl lg:text-7xl font-extrabold mb-4 sm:mb-8 text-shadow-2xl drop-shadow-2xl bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent leading-tight">
              {t('title')}
            </h1>
            <p className="text-lg sm:text-2xl lg:text-3xl font-semibold mb-6 sm:mb-10 text-shadow-xl drop-shadow-xl text-blue-100 leading-relaxed">
              {t('subtitle')}
            </p>

            {/* Desktop Cards - Hidden on Mobile */}
            <FeatureTags className="hidden sm:flex" />
            <PricingCard className="hidden sm:block" />
            <ActionButtons className="hidden sm:flex" />
          </div>
        </div>
      </div>

      {/* Mobile Cards Section - Hidden on Desktop */}
      <div className="block sm:hidden bg-gradient-to-b from-gray-50 to-white py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Feature Tags for Mobile */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">{t('apartmentFeatures')}</h2>
            <div className="flex flex-wrap justify-center gap-3">
              <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full border border-blue-200">
                <span className="text-sm text-blue-800">{t('groundFloor')}</span>
              </div>
              <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full border border-blue-200">
                <span className="text-sm text-blue-800">{t('livingRoomKitchen')}</span>
              </div>
              <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full border border-blue-200">
                <span className="text-sm text-blue-800">{t('bedroom')}</span>
              </div>
              <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full border border-blue-200">
                <span className="text-sm text-blue-800">{t('sofaBed')}</span>
              </div>
            </div>
          </div>

          {/* Pricing Card for Mobile */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">{t('specialOffer')}</h2>
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-6 rounded-2xl text-white relative overflow-hidden">
              <div className="flex flex-col items-center gap-4">
                <div className="text-center">
                  <div className="text-blue-100 text-sm mb-1">{t('standardPrice')}</div>
                  <div className="text-2xl font-bold line-through opacity-80">220 лв.</div>
                  <div className="text-blue-100 text-xs mt-1">{t('perNight')}</div>
                </div>

                <div className="w-full h-px bg-blue-400/30"></div>

                <div className="text-center">
                  <div className="text-blue-100 text-sm mb-1">{t('discountedPrice')}</div>
                  <div className="text-3xl font-bold">
                    180 лв.
                    <span className="text-sm text-blue-100 ml-1 font-normal block">{t('perNight')}</span>
                  </div>
                  <div className="text-blue-100 text-sm font-medium mt-1">{t('for14Nights')}</div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-blue-400/30">
                <div className="flex flex-col items-center gap-1 text-sm text-blue-100">
                  <span>{t('totalSavings')}:</span>
                  <span className="font-bold text-white">280 лв. / {t('week')}</span>
                </div>
              </div>

              <div className="absolute -right-2 -top-2 bg-yellow-400 text-blue-900 px-3 py-1 rounded-full text-xs font-bold transform rotate-12">
                -20%
              </div>
            </div>
          </div>

          {/* Action Buttons for Mobile */}
          <div className="flex flex-col gap-3">
            <a
              href='#overview'
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full font-semibold text-center transition-colors"
            >
              {t('checkAvailability')}
            </a>
            <a 
              href='#gallery' 
              className="bg-gray-100 hover:bg-gray-200 text-gray-900 px-8 py-4 rounded-full font-semibold text-center transition-colors border border-gray-300"
            >
              {t('gallery')}
            </a>
          </div>
        </div>
      </div>
    </>
  );
};


export default Hero;
