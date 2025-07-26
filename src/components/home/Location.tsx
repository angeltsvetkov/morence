import React, { useState } from 'react';
import { MapPin, Maximize2, X } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';

const Location: React.FC = () => {
  const { t } = useLanguage();
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);

  return (
    <>
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center reveal-slide-up">{t('location')}</h2>
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-8 reveal-slide-left">
              <div>
                <h3 className="text-2xl font-semibold mb-4">{t('greenlifeKavaci')}</h3>
                <p className="text-gray-600 mb-6">
                  {t('locationDesc')}
                  {t('nearby')}
                </p>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-center gap-2">
                    <MapPin className="text-blue-600" />
                    <span>{t('beach')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <MapPin className="text-blue-600" />
                    <span>{t('playgrounds')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <MapPin className="text-blue-600" />
                    <span>{t('pools')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <MapPin className="text-blue-600" />
                    <span>{t('restaurants')}</span>
                  </li>
                </ul>
              </div>

              <div className="flex flex-col gap-4">
                <button
                  className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                  onClick={() => setIsMapFullscreen(true)}
                >
                  <Maximize2 className="h-5 w-5" />
                  {t('showMap')}
                </button>
              </div>
            </div>
            <div className="relative rounded-lg overflow-hidden shadow-lg reveal-slide-right">
              <img src="/photos/map.jpg" alt={t('mapAlt')} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/10"></div>
            </div>
          </div>
        </div>
      </div>
      {isMapFullscreen && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
          <div className="relative w-full h-full">
            <button onClick={() => setIsMapFullscreen(false)} className="absolute top-4 right-4 text-white text-3xl z-50">
              <X size={40} />
            </button>
            <img src="/photos/map.jpg" alt={t('mapAlt')} className="w-full h-full object-contain" />
          </div>
        </div>
      )}
    </>
  );
};

export default Location;
