import React from 'react';
import { useLanguage } from '../../hooks/useLanguage';

const Hero: React.FC = () => {
  const { t } = useLanguage();
  return (
    <div className="relative min-h-[80vh] sm:h-[85vh] bg-cover bg-center bg-fixed motion-safe:animate-kenburns" style={{ backgroundImage: 'url("/photos/10040698_135550664_big.jpg")' }}>
      <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/50 to-black/90" />
      <div className="relative h-full flex items-center justify-center py-12 sm:py-0">
        <div className="text-center text-white max-w-4xl px-4 animate-fade-in">
          <div className="mb-8 inline-block">
            <div className="bg-blue-600/20 backdrop-blur-sm px-4 py-2 rounded-full border border-blue-400/30 mb-4 inline-block">
              <span className="text-blue-200 font-medium">2-стаем апартамент в затворен комплекс</span>
            </div>
          </div>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold mb-6 sm:mb-8 text-shadow-2xl drop-shadow-2xl bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
            {t('title')}
          </h1>
          <p className="text-xl sm:text-2xl lg:text-3xl font-semibold mb-8 sm:mb-10 text-shadow-xl drop-shadow-xl text-blue-100">
            {t('subtitle')}
          </p>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mb-8 sm:mb-10">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 sm:px-5 py-2 sm:py-2.5 rounded-full border border-white/20 hover:bg-white/20 transition-colors">
              <span className="text-sm sm:text-base text-shadow-sm">{t('groundFloor')}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 sm:px-5 py-2 sm:py-2.5 rounded-full border border-white/20 hover:bg-white/20 transition-colors">
              <span className="text-sm sm:text-base text-shadow-sm">{t('livingRoomKitchen')}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 sm:px-5 py-2 sm:py-2.5 rounded-full border border-white/20 hover:bg-white/20 transition-colors">
              <span className="text-sm sm:text-base text-shadow-sm">{t('bedroom')}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 sm:px-5 py-2 sm:py-2.5 rounded-full border border-white/20 hover:bg-white/20 transition-colors">
              <span className="text-sm sm:text-base text-shadow-sm">{t('sofaBed')}</span>
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-600/90 via-blue-500/90 to-blue-600/90 backdrop-blur-sm p-6 sm:p-8 rounded-2xl mb-8 sm:mb-10 border border-blue-400/30 transform hover:scale-105 transition-all duration-300 hover:shadow-[0_0_30px_rgba(37,99,235,0.3)] shadow-[0_0_20px_rgba(37,99,235,0.2)]">
            <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-10">
              <div className="text-center sm:text-left">
                <div className="text-blue-100 text-sm sm:text-base mb-1">{t('standardPrice')}</div>
                <div className="text-4xl sm:text-5xl font-bold text-white line-through opacity-80">
                  220 лв.
                </div>
                <div className="text-blue-100 text-sm mt-1">{t('perNight')}</div>
              </div>

              <div className="hidden sm:block w-px h-24 bg-blue-400/30"></div>

              <div className="text-center sm:text-left">
                <div className="text-blue-100 text-sm sm:text-base mb-1">{t('discountedPrice')}</div>
                <div className="text-5xl sm:text-6xl font-bold text-white">
                  180 лв.
                  <span className="text-base sm:text-lg text-blue-100 ml-2 font-normal">{t('perNight')}</span>
                </div>
                <div className="text-blue-100 text-sm sm:text-base font-medium mt-1">
                  {t('for14Nights')}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-blue-400/30">
              <div className="flex justify-between items-center text-sm sm:text-base text-blue-100">
                <span>{t('totalSavings')}:</span>
                <span className="font-bold text-white">280 лв. / {t('week')}</span>
              </div>
            </div>

            <div className="absolute -right-3 -top-3 bg-yellow-400 text-blue-900 px-4 py-1 rounded-full text-sm font-bold transform rotate-12 shadow-lg">
              -20%
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
            <a
              href='#overview'
              className="group bg-blue-600 hover:bg-blue-700 text-white px-8 sm:px-10 py-3 sm:py-4 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg shadow-lg text-base sm:text-lg relative overflow-hidden"
            >
              <span className="relative z-10">{t('checkAvailability')}</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-800 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
            </a>
            <a 
              href='#gallery' 
              className="group bg-white/10 hover:bg-white/20 text-white px-8 sm:px-10 py-3 sm:py-4 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg border border-white/30 shadow-lg text-base sm:text-lg backdrop-blur-sm"
            >
              {t('gallery')}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
