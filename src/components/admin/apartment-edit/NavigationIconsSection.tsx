import React, { useState } from 'react';
import { Home, Activity, Clock, MapPin,
    Utensils, Coffee, Beer, ShoppingBag, ShoppingCart, Landmark, TreePine, Mountain, Waves, Umbrella, Dumbbell, Bike,
    Car, Bus, Plane, Music, Star, Heart, Camera, Building2, Sun, Moon, Ticket, BookOpen, Leaf, Fish, Baby, Palette, Flame, ChevronDown
} from 'lucide-react';

// Icon registry
type IconEntry = { name: string; label: string; component: React.FC<{ size?: number; className?: string }> };
const NAVIGATION_ICONS: IconEntry[] = [
    { name: 'Home',       label: 'Начало',         component: Home },
    { name: 'Activity',   label: 'Активност',      component: Activity },
    { name: 'Clock',      label: 'Часовник',       component: Clock },
    { name: 'Utensils',   label: 'Ресторант',      component: Utensils },
    { name: 'Coffee',     label: 'Кафе',           component: Coffee },
    { name: 'Beer',       label: 'Бар',            component: Beer },
    { name: 'Fish',       label: 'Морска храна',   component: Fish },
    { name: 'ShoppingBag',label: 'Пазаруване',     component: ShoppingBag },
    { name: 'ShoppingCart',label:'Супермаркет',    component: ShoppingCart },
    { name: 'Landmark',   label: 'Забележителности', component: Landmark },
    { name: 'Building2',  label: 'Градски',        component: Building2 },
    { name: 'BookOpen',   label: 'Култура',        component: BookOpen },
    { name: 'Palette',    label: 'Изкуство',       component: Palette },
    { name: 'TreePine',   label: 'Природа',        component: TreePine },
    { name: 'Mountain',   label: 'Планини',        component: Mountain },
    { name: 'Waves',      label: 'Плаж / море',    component: Waves },
    { name: 'Umbrella',   label: 'Плаж',           component: Umbrella },
    { name: 'Leaf',       label: 'Еко',            component: Leaf },
    { name: 'Sun',        label: 'На открито',     component: Sun },
    { name: 'Moon',       label: 'Вечер',          component: Moon },
    { name: 'Dumbbell',   label: 'Спорт',          component: Dumbbell },
    { name: 'Bike',       label: 'Колоездене',     component: Bike },
    { name: 'Car',        label: 'Транспорт',      component: Car },
    { name: 'Bus',        label: 'Автобус',        component: Bus },
    { name: 'Plane',      label: 'Летище',         component: Plane },
    { name: 'Music',      label: 'Нощен живот',    component: Music },
    { name: 'Ticket',     label: 'События',        component: Ticket },
    { name: 'Camera',     label: 'Фото точки',     component: Camera },
    { name: 'Star',       label: 'Препоръчани',    component: Star },
    { name: 'Heart',      label: 'Любими',         component: Heart },
    { name: 'Flame',      label: 'Популярни',      component: Flame },
    { name: 'Baby',       label: 'Деца',           component: Baby },
    { name: 'MapPin',     label: 'Общо',           component: MapPin },
];

const ICON_MAP: Record<string, React.FC<{ size?: number; className?: string }>> =
    Object.fromEntries(NAVIGATION_ICONS.map(i => [i.name, i.component]));

function IconDisplay({ name, size = 20, className }: { name?: string; size?: number; className?: string }) {
    const Comp = name ? ICON_MAP[name] : null;
    return Comp ? <Comp size={size} className={className} /> : <MapPin size={size} className={className} />;
}

interface NavIconPickerProps {
    buttonId: 'homeIcon' | 'activitiesIcon' | 'busScheduleIcon';
    buttonLabel: string;
    selectedIcon?: string;
    defaultIcon: string;
    onChange: (iconName: string) => void;
}

const NavIconPicker: React.FC<NavIconPickerProps> = ({ buttonId, buttonLabel, selectedIcon, defaultIcon, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const currentIcon = selectedIcon || defaultIcon;

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-3 space-y-2">
            <p className="text-xs font-medium text-gray-600">{buttonLabel}</p>
            
            <button
                className="w-full h-12 bg-gradient-to-br from-blue-50 to-indigo-100 hover:from-blue-100 hover:to-indigo-200 transition-colors rounded-lg flex items-center justify-between px-3 py-2"
                onClick={() => setIsOpen(!isOpen)}
                title="Избери икона"
            >
                <div className="flex items-center gap-2">
                    <IconDisplay name={currentIcon} size={24} className="text-blue-600" />
                    <span className="text-sm font-medium text-gray-700">{currentIcon}</span>
                </div>
                <ChevronDown size={16} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="border border-gray-200 rounded-lg p-2 bg-gray-50">
                    <div className="grid grid-cols-6 gap-1 max-h-64 overflow-y-auto">
                        {NAVIGATION_ICONS.map(ic => (
                            <button
                                key={ic.name}
                                title={ic.label}
                                onClick={() => {
                                    onChange(ic.name);
                                    setIsOpen(false);
                                }}
                                className={`flex flex-col items-center justify-center h-12 w-12 rounded-lg transition-colors text-center p-1 ${
                                    currentIcon === ic.name
                                        ? 'bg-blue-100 text-blue-600 shadow-sm'
                                        : 'hover:bg-gray-100 text-gray-500'
                                }`}
                            >
                                <IconDisplay name={ic.name} size={18} />
                                <span className="text-[8px] text-gray-600 mt-0.5 line-clamp-1">{ic.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

interface NavigationIconsSectionProps {
    navigationIcons?: {
        homeIcon?: string;
        activitiesIcon?: string;
        busScheduleIcon?: string;
    };
    onChange: (icons: { homeIcon?: string; activitiesIcon?: string; busScheduleIcon?: string }) => void;
}

const NavigationIconsSection: React.FC<NavigationIconsSectionProps> = ({ navigationIcons = {}, onChange }) => {
    return (
        <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-800">Икони на дъното</h3>
            <p className="text-xs text-gray-500">Персонализирайте икините на бутоните за навигация</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <NavIconPicker
                    buttonId="homeIcon"
                    buttonLabel="Начало"
                    selectedIcon={navigationIcons.homeIcon}
                    defaultIcon="Home"
                    onChange={(icon) => onChange({ ...navigationIcons, homeIcon: icon })}
                />
                <NavIconPicker
                    buttonId="activitiesIcon"
                    buttonLabel="Активности"
                    selectedIcon={navigationIcons.activitiesIcon}
                    defaultIcon="Activity"
                    onChange={(icon) => onChange({ ...navigationIcons, activitiesIcon: icon })}
                />
                <NavIconPicker
                    buttonId="busScheduleIcon"
                    buttonLabel="График на автобус"
                    selectedIcon={navigationIcons.busScheduleIcon}
                    defaultIcon="Clock"
                    onChange={(icon) => onChange({ ...navigationIcons, busScheduleIcon: icon })}
                />
            </div>
        </div>
    );
};

export default NavigationIconsSection;
