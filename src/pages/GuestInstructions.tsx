import React, { useState } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { Microwave, Refrigerator, Coffee, Tv, WashingMachine, Snowflake, Crosshair, Wind, Baby, CheckSquare, Wifi } from 'lucide-react';
import Hero from '../components/guest-instructions/Hero';
import Amenities from '../components/guest-instructions/Amenities';
import InstructionsCard from '../components/guest-instructions/InstructionsCard';
import Rules from '../components/home/Rules';
import PromoOffers from '../components/home/PromoOffers';
import Overview from '../components/home/Overview';
import Pricing from '../components/home/Pricing';
import Gallery from '../components/home/Gallery';

const GuestInstructions: React.FC = () => {
    const { t, loading } = useLanguage();
    const [selectedMonth, setSelectedMonth] = useState(new Date("2025-08-01"));
    const [mainImage, setMainImage] = useState('/photos/10040698_135550663_big.jpg');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    
    if (loading) {
        return <div>Loading translations...</div>;
    }
    
    // Mock available dates (in a real app, this would come from an API)
    const availableDates = [
        '2025-08-10', '2025-08-11',
        '2025-08-12', '2025-08-13', '2025-08-14',
        '2025-08-15', '2025-08-16', '2025-08-17',
        '2025-08-18', '2025-08-19', '2025-08-20',
        '2025-08-21', '2025-08-22', '2025-08-23',
        '2025-08-24', '2025-08-25', '2025-08-26',
        '2025-08-27', '2025-08-28', '2025-08-29',
        '2025-08-30', '2025-08-31'
    ];

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        return { daysInMonth, firstDayOfMonth };
    };

    const isDateAvailable = (date: string) => availableDates.includes(date);

    const formatDate = (year: number, month: number, day: number) => {
        return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    };

    const nextMonth = () => {
        setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1));
    };

    const prevMonth = () => {
        setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1));
    };

    const monthNames = [
        'Януари', 'Февруари', 'Март', 'Април', 'Май', 'Юни',
        'Юли', 'Август', 'Септември', 'Октомври', 'Ноември', 'Декември'
    ];

    const photos = [
        '/photos/10040698_135550663_big.jpg',
        '/photos/10040698_135550664_big.jpg',
        '/photos/10040698_135550665_big.jpg',
        '/photos/10040698_135550666_big.jpg',
        '/photos/10040698_135550667_big.jpg',
        '/photos/10040698_135550668_big.jpg',
        '/photos/10040698_135550669_big.jpg',
        '/photos/10040698_135550671_big.jpg',
        '/photos/10040698_135550685_big.jpg',
        '/photos/Zlatna-ribka-06-1024x768.jpg',
        '/photos/ropotamo-lodki.jpg',
        '/photos/star-grad.jpg',
    ];

    const handleImageClick = (path: string) => {
        setSelectedImage(path);
    };

    const amenities = [
        { key: 'oven', icon: Microwave, text: t('oven') },
        { key: 'refrigerator', icon: Refrigerator, text: t('refrigerator') },
        { key: 'coffeeMachine', icon: Coffee, text: t('coffeeMachine') },
        { key: 'tv', icon: Tv, text: t('tv') },
        { key: 'washingMachine', icon: WashingMachine, text: t('washingMachine') },
        { key: 'airConditioning', icon: Snowflake, text: t('airConditioning') },
        { key: 'freeParking', icon: Crosshair, text: t('freeParking') },
        { key: 'balcony', icon: Wind, text: t('balcony') },
        { key: 'babyCrib', icon: Baby, text: t('babyCrib') },
        { key: 'essentials', icon: CheckSquare, text: t('essentials') },
        { key: 'wifi', icon: Wifi, text: t('wifi') }
    ];

    const instructions = [
        {
            title: t('checkInCheckOut'),
            items: [
                { label: t('checkIn'), value: t('after3pm') },
                { label: t('checkOut'), value: t('before11am') }
            ]
        },
        {
            title: t('wifi'),
            items: [
                { label: t('network'), value: 'Morence-5G' },
                { label: t('password'), value: 'morence123' }
            ]
        }
    ];

    const rules = [
        { key: 'noSmoking', text: t('noSmoking') },
        { key: 'noPets', text: t('noPets') },
        { key: 'noParties', text: t('noParties') }
    ];

    return (
        <div className="bg-gray-50">
            <Hero 
                mainImage={mainImage}
                setMainImage={setMainImage}
                photos={photos}
            />

            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2">
                        <Overview 
                            rooms={{}}
                            selectedMonth={selectedMonth}
                            prevMonth={prevMonth}
                            nextMonth={nextMonth}
                            getDaysInMonth={getDaysInMonth}
                            isDateAvailable={isDateAvailable}
                            formatDate={formatDate}
                            weekDays={[t('su'), t('mo'), t('tu'), t('we'), t('th'), t('fr'), t('sa')]}
                            monthNames={monthNames}
                        />
                        
                        <Amenities amenities={amenities} />

                        <div className="mt-12">
                            <h2 className="text-3xl font-bold text-gray-800 mb-6">{t('guestInstructions')}</h2>
                            <div className="space-y-6">
                                {instructions.map(section => (
                                    <InstructionsCard key={section.title} title={section.title} items={section.items} />
                                ))}
                            </div>
                        </div>

                        <Rules rules={rules} />

                    </div>
                    <div className="lg:col-span-1">
                        <Pricing 
                            price={150}
                            period={t('pricePill')}
                            calendarProps={{
                                selectedMonth,
                                setSelectedMonth,
                                getDaysInMonth,
                                isDateAvailable,
                                formatDate,
                                nextMonth,
                                prevMonth,
                                monthNames,
                                weekDays: [t('su'), t('mo'), t('tu'), t('we'), t('th'), t('fr'), t('sa')]
                            }}
                        />
                        <div className="mt-8">
                            <a href="https://maps.app.goo.gl/your-link" target="_blank" rel="noopener noreferrer" className="block w-full">
                                <img src="/photos/map.jpg" alt={t('viewOnMap')} className="rounded-lg shadow-md hover:opacity-90 transition-opacity" />
                                <p className="text-center mt-2 text-indigo-600 font-semibold">{t('viewOnMap')}</p>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
            
            <Gallery photos={photos} onImageClick={handleImageClick} />

            {selectedImage && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
                    onClick={() => setSelectedImage(null)}
                >
                    <img src={selectedImage} alt="Selected" className="max-w-full max-h-full rounded-lg" />
                </div>
            )}

            <PromoOffers 
                title={t('promoOffersTitle')}
                offers={[
                    { 
                        title: t('promoOffer1Title'),
                        description: t('promoOffer1Desc')
                    },
                    { 
                        title: t('promoOffer2Title'),
                        description: t('promoOffer2Desc')
                    }
                ]}
            />
        </div>
    );
};

export default GuestInstructions;
