import React, { useState } from 'react';
import { Microwave, Refrigerator, Crosshair, Coffee, Tv, WashingMachine, Snowflake, Wifi, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';

const Overview: React.FC = () => {
  const { t } = useLanguage();
  const [selectedMonth, setSelectedMonth] = useState(new Date("2025-08-01"));

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

  const weekDays = [t('su'), t('mo'), t('tu'), t('we'), t('th'), t('fr'), t('sa')];

  return (
    <div id="overview" className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-gray-800 mb-4 text-center">{t('overview')}</h2>
        <p className="text-lg text-gray-600 mb-8 text-center max-w-3xl mx-auto">
          {t('overviewDesc')}
        </p>
        <div className="grid md:grid-cols-2 gap-12">
          <div className="reveal-slide-left">
            <h3 className="text-2xl font-bold mb-4">{t('amenities')}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center">
                <Microwave className="text-blue-600 mr-2" />
                <span>{t('oven')}</span>
              </div>
              <div className="flex items-center">
                <Refrigerator className="text-blue-600 mr-2" />
                <span>{t('fridge')}</span>
              </div>
              <div className="flex items-center">
                <Crosshair className="text-blue-600 mr-2" />
                <span>{t('fireplace')}</span>
              </div>
              <div className="flex items-center">
                <Coffee className="text-blue-600 mr-2" />
                <span>{t('coffeeMachine')}</span>
              </div>
              <div className="flex items-center">
                <Tv className="text-blue-600 mr-2" />
                <span>{t('tv')}</span>
              </div>
              <div className="flex items-center">
                <WashingMachine className="text-blue-600 mr-2" />
                <span>{t('washingMachine')}</span>
              </div>
              <div className="flex items-center">
                <Snowflake className="text-blue-600 mr-2" />
                <span>{t('airConditioner')}</span>
              </div>
              <div className="flex items-center">
                <Wifi className="text-blue-600 mr-2" />
                <span>{t('wifi')}</span>
              </div>
            </div>
          </div>
          <div className="reveal-slide-right">
            <h3 className="text-2xl font-bold mb-4">{t('availability')}</h3>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between items-center mb-2">
                <button onClick={prevMonth} className="p-2 hover:bg-gray-200 rounded-full">
                  <ChevronLeft />
                </button>
                <span className="font-bold">
                  {monthNames[selectedMonth.getMonth()]} {selectedMonth.getFullYear()}
                </span>
                <button onClick={nextMonth} className="p-2 hover:bg-gray-200 rounded-full">
                  <ChevronRight />
                </button>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center">
                {weekDays.map(day => (
                  <div key={day} className="font-bold">{day}</div>
                ))}
                {[...Array(getDaysInMonth(selectedMonth).firstDayOfMonth)].map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                {[...Array(getDaysInMonth(selectedMonth).daysInMonth)].map((_, i) => {
                  const date = formatDate(selectedMonth.getFullYear(), selectedMonth.getMonth(), i + 1);
                  const available = isDateAvailable(date);
                  return (
                    <div key={i} className={`p-2 rounded-full ${available ? 'bg-green-200' : 'bg-red-200'}`}>
                      {i + 1}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
