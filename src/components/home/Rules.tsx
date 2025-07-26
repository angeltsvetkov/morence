import React from 'react';
import { Clock, DoorClosed, PawPrint, Cigarette } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';

const Rules: React.FC = () => {
  const { t } = useLanguage();

  const rules = [
    { key: 'checkIn', text: t('checkIn') },
    { key: 'checkOut', text: t('checkOut') },
    { key: 'noSmoking', text: t('noSmoking') },
    { key: 'noPets', text: t('noPets') },
    { key: 'noParties', text: t('noParties') },
  ];

  const getIcon = (key: string) => {
    switch (key) {
        case 'noSmoking': return <Cigarette className="h-5 w-5 text-red-600" />;
        case 'noPets': return <PawPrint className="h-5 w-5 text-red-600" />;
        case 'noParties': return <Clock className="h-5 w-5 text-red-600" />;
        default: return <DoorClosed className="h-5 w-5 text-blue-600" />;
    }
  }

  return (
    <div className="mt-16 bg-white p-8 rounded-xl shadow-sm">
      <h3 className="text-2xl font-semibold text-center mb-8 reveal-slide-up">{t('houseRules')}</h3>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-5xl mx-auto stagger-children">
        {rules.map(rule => (
            <div className="bg-gray-50 p-6 rounded-lg" key={rule.key}>
                <div className="flex items-center gap-2 mb-2">
                    {getIcon(rule.key)}
                    <h4 className="font-semibold text-lg">{rule.text}</h4>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};

export default Rules;
