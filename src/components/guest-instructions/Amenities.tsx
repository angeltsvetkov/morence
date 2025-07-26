import React from 'react';
import { LucideIcon } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';

interface Amenity {
    key: string;
    icon: LucideIcon;
    text: string;
}

interface AmenitiesProps {
    amenities: Amenity[];
}

const Amenities: React.FC<AmenitiesProps> = ({ amenities }) => {
    const { t } = useLanguage();
    return (
        <div className="lg:col-span-2">
            <h2 className="text-4xl font-bold text-gray-800 mb-8">{t('amenities')}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-6">
                {amenities.map(({ key, icon: Icon, text }) => (
                    <div key={key} className="flex items-center text-lg text-gray-700">
                        <Icon className="w-6 h-6 mr-3 text-cyan-600" />
                        <span>{text}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Amenities;
