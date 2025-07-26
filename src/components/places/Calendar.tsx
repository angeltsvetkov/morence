import { useState } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Calendar = () => {
  const { t } = useLanguage();
  const [currentDate, setCurrentDate] = useState(new Date());

  const weekDays = [t('su'), t('mo'), t('tu'), t('we'), t('th'), t('fr'), t('sa')];
  const months = [t('jan'), t('feb'), t('mar'), t('apr'), t('may'), t('jun'), t('jul'), t('aug'), t('sep'), t('oct'), t('nov'), t('dec')];

  if (!weekDays || !months) {
    return null; 
  }

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = months[month];

  // Adjust for Sunday-first week
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const today = new Date();
  const isToday = (day: number) => {
    return year === today.getFullYear() && month === today.getMonth() && day === today.getDate();
  }

  const renderDays = () => {
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="text-center p-2"></div>);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(
        <div key={day} className={`text-center p-1 flex items-center justify-center`}>
           <span className={`w-10 h-10 flex items-center justify-center rounded-full ${isToday(day) ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`}>
            {day}
           </span>
        </div>
      );
    }
    return days;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-8">
      <div className="flex justify-between items-center mb-4">
        <button onClick={goToPreviousMonth} className="p-2 rounded-full hover:bg-gray-100">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h2 className="text-lg sm:text-xl font-bold">{monthName} {year}</h2>
        <button onClick={goToNextMonth} className="p-2 rounded-full hover:bg-gray-100">
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-gray-500 text-sm mb-2">
        {weekDays.map((day: string) => <div key={day} className="font-medium">{day}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1 text-sm">
        {renderDays()}
      </div>
    </div>
  );
};

export default Calendar;
