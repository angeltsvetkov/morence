import React from 'react';
import { Wifi, Clock, DoorClosed } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';

interface InstructionItem {
    label: string;
    value: string;
}

interface InstructionsCardProps {
    title: string;
    items: InstructionItem[];
}

const InstructionsCard: React.FC<InstructionsCardProps> = ({ title, items }) => {
    const { t } = useLanguage();
    // A simple mapping from title to icon. In a real app, you might want a more robust solution.
    const getIcon = (title: string) => {
        if (title === t('checkInCheckOut')) return <Clock className="text-cyan-600 w-6 h-6 mr-3" />;
        if (title === t('wifi')) return <Wifi className="text-cyan-600 w-6 h-6 mr-3" />;
        if (title === t('houseRules')) return <DoorClosed className="text-cyan-600 w-6 h-6 mr-3" />;
        return null;
    }

    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-2">
                {getIcon(title)}
                <h4 className="text-xl font-semibold text-gray-700">{title}</h4>
            </div>
            <div className="ml-9 text-gray-600">
                {items.map(item => (
                    <p key={item.label}><strong>{item.label}:</strong> {item.value}</p>
                ))}
            </div>
        </div>
    );
};

export default InstructionsCard;
