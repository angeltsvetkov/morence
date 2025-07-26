import React, { useState } from 'react';
import { useLanguage } from '../../hooks/useLanguage';

const Pricing: React.FC = () => {
    const { t } = useLanguage();
    const [selectedMonth, setSelectedMonth] = useState(new Date("2025-08-01"));

    const monthNames = [t('january'), t('february'), t('march'), t('april'), t('may'), t('june'), t('july'), t('august'), t('september'), t('october'), t('november'), t('december')];
    const weekDays = [t('su'), t('mo'), t('tu'), t('we'), t('th'), t('fr'), t('sa')];

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        return { daysInMonth, firstDayOfMonth };
    };

    const isDateAvailable = (date: string) => {
        // Dummy availability logic
        return !date.endsWith('5') && !date.endsWith('6');
    };

    const formatDate = (year: number, month: number, day: number) => {
        return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    };

    const nextMonth = () => {
        setSelectedMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    };

    const prevMonth = () => {
        setSelectedMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 sticky top-28">
        <div className="flex justify-between items-baseline mb-4">
            <p className="text-2xl font-bold text-gray-800">
                {t('price')}€ / <span className="text-lg font-normal text-gray-600">{t('period')}</span>
            </p>
            <a href="#reviews" className="text-sm font-medium text-indigo-600 hover:underline">
                4.9 (28 reviews)
            </a>
        </div>

        {/* Calendar */}
        <div className="mt-6">
            <div className="flex justify-between items-center mb-4">
                <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-full">&lt;</button>
                <h4 className="text-lg font-semibold">
                    {monthNames[selectedMonth.getMonth()]} {selectedMonth.getFullYear()}
                </h4>
                <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-full">&gt;</button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-sm text-gray-500">
                {weekDays.map((day: string) => <div key={day} className="font-semibold">{day}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1 mt-2">
                {[...Array(getDaysInMonth(selectedMonth).firstDayOfMonth)].map((_, i) => <div key={`empty-${i}`} />)}
                {[...Array(getDaysInMonth(selectedMonth).daysInMonth)].map((_, i) => {
                    const date = formatDate(selectedMonth.getFullYear(), selectedMonth.getMonth(), i + 1);
                    const available = isDateAvailable(date);
                    return (
                        <div key={i} className={`p-2 text-center rounded-full ${available ? 'bg-green-100 text-green-800 cursor-pointer' : 'text-gray-400 line-through'}`}>
                            {i + 1}
                        </div>
                    );
                })}
            </div>
        </div>

        <button className="mt-6 w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition-colors">
            {t('bookNow')}
        </button>
    </div>
  );
};

export default Pricing;
