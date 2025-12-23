import React from 'react';
import { MapPin, ChevronDown } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';

interface HeroProps {
    mainImage: string;
    setMainImage: (image: string) => void;
    photos: string[];
}

const Hero: React.FC<HeroProps> = ({ mainImage, setMainImage, photos }) => {
    const { t } = useLanguage();

    const discountedPriceEUR = 90;
    const cheapestPackagePriceEUR = discountedPriceEUR;

    return (
        <div className="relative h-screen">
            {/* Main Image with Gradient Overlay */}
            <div className="absolute inset-0">
                <img src={mainImage} alt="Main view" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
            </div>

            {/* Content Over Image */}
            <div className="relative h-full px-4 md:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 h-full max-w-7xl mx-auto">

                    {/* Left Content */}
                    <div className="md:col-span-2 lg:col-span-3 flex flex-col justify-end text-white pb-16">
                        <div className="flex justify-center md:justify-start mb-8">
                            <div>
                                <div className="text-white/80 text-sm md:text-base font-medium mb-1">{t('priceStartsFrom')}</div>
                                <h2 className="text-5xl font-extrabold text-amber-300 drop-shadow-xl">€{cheapestPackagePriceEUR} / {t('perNight')}</h2>
                            </div>
                        </div>
                        <div className="flex flex-wrap justify-center md:justify-start gap-3 mb-4">
                            <div className="bg-black/40 text-white text-base font-medium px-5 py-2 rounded-full border border-white/50 backdrop-blur-sm">
                                {t('groundFloor')}
                            </div>
                            <div className="bg-black/40 text-white text-base font-medium px-5 py-2 rounded-full border border-white/50 backdrop-blur-sm">
                                {t('livingRoomKitchen')}
                            </div>
                            <div className="bg-black/40 text-white text-base font-medium px-5 py-2 rounded-full border border-white/50 backdrop-blur-sm">
                                {t('bedroom')}
                            </div>
                            <div className="bg-black/40 text-white text-base font-medium px-5 py-2 rounded-full border border-white/50 backdrop-blur-sm">
                                {t('sofaBed')}
                            </div>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-extrabold drop-shadow-lg mb-2">{t('title')}</h1>
                        <div className="flex items-center text-lg text-gray-200 mb-4">
                            <MapPin className="w-5 h-5 mr-2" />
                            <span>{t('address')}</span>
                        </div>
                        <p className="max-w-3xl text-gray-200 text-lg leading-relaxed hidden md:block">
                            {t('overviewDesc')}
                        </p>
                    </div>

                    {/* Right Thumbnails / Card */}
                    <div className="hidden md:flex flex-col justify-end pb-16 space-y-2">
                        {photos.slice(1, 5).map((photo, index) => (
                            <img
                                key={index}
                                src={photo}
                                alt={`Thumbnail ${index + 1}`}
                                className={`w-full h-24 object-cover rounded-lg shadow-md cursor-pointer transition-all duration-300 ${mainImage === photo ? 'ring-4 ring-blue-500' : 'hover:opacity-80'}`}
                                onClick={() => setMainImage(photo)}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Scroll Down Indicator */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer animate-bounce">
                <ChevronDown className="w-8 h-8 text-amber-300" />
            </div>
        </div>
    );
};

export default Hero;
