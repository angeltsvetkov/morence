import React, { useRef, useState } from 'react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { BrochureTabProps, BrochurePlaceItem, BrochureGroup } from './types';
import { useAdminLanguage } from '../../../hooks/useAdminLanguage';
import { Share2, Check, Trash2, Plus, Phone, MapPin, Clock, ChevronDown, ChevronUp, GripVertical, Tag, Upload, FolderOpen, X, Pencil,
    Utensils, Coffee, Beer, ShoppingBag, ShoppingCart, Landmark, TreePine, Mountain, Waves, Umbrella, Dumbbell, Bike,
    Car, Bus, Plane, Music, Star, Heart, Camera, Building2, Sun, Moon, Ticket, BookOpen, Leaf, Fish, Baby, Palette, Flame
} from 'lucide-react';
import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
    arrayMove
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import OptimizedImage from '../../ui/optimized-image';
import { processImageFiles, getSupportedImageTypes, isSupportedImageFile, isHEICFile } from '../../../utils/imageUtils';
import NavigationIconsSection from './NavigationIconsSection';

const DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;
const DAY_LABELS: Record<string, string> = {
    mon: 'Пон', tue: 'Вт', wed: 'Ср', thu: 'Чет', fri: 'Пет', sat: 'Съб', sun: 'Нед'
};

// ─── icon registry for groups ─────────────────────────────────────────────────
type IconEntry = { name: string; label: string; component: React.FC<{ size?: number; className?: string }> };
const GROUP_ICONS: IconEntry[] = [
    { name: 'Utensils',   label: 'Ресторант',   component: Utensils },
    { name: 'Coffee',     label: 'Кафе',         component: Coffee },
    { name: 'Beer',       label: 'Бар',           component: Beer },
    { name: 'Fish',       label: 'Морска храна', component: Fish },
    { name: 'ShoppingBag',label: 'Пазаруване',   component: ShoppingBag },
    { name: 'ShoppingCart',label:'Супермаркет',  component: ShoppingCart },
    { name: 'Landmark',   label: 'Забележителности', component: Landmark },
    { name: 'Building2',  label: 'Градски',       component: Building2 },
    { name: 'BookOpen',   label: 'Култура',       component: BookOpen },
    { name: 'Palette',    label: 'Изкуство',      component: Palette },
    { name: 'TreePine',   label: 'Природа',       component: TreePine },
    { name: 'Mountain',   label: 'Планини',       component: Mountain },
    { name: 'Waves',      label: 'Плаж / море',   component: Waves },
    { name: 'Umbrella',   label: 'Плаж',          component: Umbrella },
    { name: 'Leaf',       label: 'Еко',           component: Leaf },
    { name: 'Sun',        label: 'На открито',    component: Sun },
    { name: 'Dumbbell',   label: 'Спорт',         component: Dumbbell },
    { name: 'Bike',       label: 'Колоездене',    component: Bike },
    { name: 'Car',        label: 'Транспорт',     component: Car },
    { name: 'Bus',        label: 'Автобус',       component: Bus },
    { name: 'Plane',      label: 'Летище',        component: Plane },
    { name: 'Music',      label: 'Нощен живот',   component: Music },
    { name: 'Moon',       label: 'Вечер',         component: Moon },
    { name: 'Ticket',     label: 'Събития',       component: Ticket },
    { name: 'Camera',     label: 'Фото точки',    component: Camera },
    { name: 'Star',       label: 'Препоръчани',   component: Star },
    { name: 'Heart',      label: 'Любими',        component: Heart },
    { name: 'Flame',      label: 'Популярни',     component: Flame },
    { name: 'Baby',       label: 'Деца',          component: Baby },
    { name: 'MapPin',     label: 'Общо',          component: MapPin },
];

const ICON_MAP: Record<string, React.FC<{ size?: number; className?: string }>> =
    Object.fromEntries(GROUP_ICONS.map(i => [i.name, i.component]));

function GroupIcon({ name, size = 20, className }: { name?: string; size?: number; className?: string }) {
    const Comp = name ? ICON_MAP[name] : null;
    return Comp ? <Comp size={size} className={className} /> : <MapPin size={size} className={className} />;
}

// ─── group card ──────────────────────────────────────────────────────────────
interface GroupCardProps {
    group: BrochureGroup;
    onChange: (updated: BrochureGroup) => void;
    onDelete: () => void;
}

const GroupCard: React.FC<GroupCardProps> = ({ group, onChange, onDelete }) => {
    const [editing, setEditing] = useState(false);
    const [pickingIcon, setPickingIcon] = useState(false);

    return (
        <div className="relative bg-white border border-gray-200 rounded-xl shadow-sm w-36 flex-shrink-0">
            {/* icon area */}
            <button
                className="w-full h-20 bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center gap-1 hover:from-blue-100 hover:to-indigo-200 transition-colors rounded-t-xl"
                onClick={() => setPickingIcon(v => !v)}
                title="Избери икона"
            >
                <GroupIcon name={group.icon} size={28} className="text-blue-500" />
                <span className="text-[9px] text-blue-400 font-medium">Смени икона</span>
            </button>

            {/* icon picker dropdown */}
            {pickingIcon && (
                <div className="absolute top-20 left-0 w-64 bg-white border border-gray-200 rounded-xl shadow-xl z-50 p-2">
                    <div className="grid grid-cols-6 gap-1">
                        {GROUP_ICONS.map(ic => (
                            <button
                                key={ic.name}
                                title={ic.label}
                                onClick={() => { onChange({ ...group, icon: ic.name }); setPickingIcon(false); }}
                                className={`flex items-center justify-center h-8 w-8 rounded-lg transition-colors ${
                                    group.icon === ic.name
                                        ? 'bg-blue-100 text-blue-600'
                                        : 'hover:bg-gray-100 text-gray-500'
                                }`}
                            >
                                <ic.component size={16} />
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* name / edit */}
            <div className="p-2">
                {editing ? (
                    <div className="space-y-1">
                        <Input
                            value={group.name.bg}
                            onChange={e => onChange({ ...group, name: { ...group.name, bg: e.target.value } })}
                            placeholder="БГ"
                            className="h-6 text-xs px-1.5"
                            autoFocus
                        />
                        <Input
                            value={group.name.en}
                            onChange={e => onChange({ ...group, name: { ...group.name, en: e.target.value } })}
                            placeholder="EN"
                            className="h-6 text-xs px-1.5"
                        />
                        <button
                            className="text-xs text-blue-500 hover:text-blue-700 w-full text-center pt-0.5"
                            onClick={() => setEditing(false)}
                        >
                            Запази
                        </button>
                    </div>
                ) : (
                    <div className="flex items-start justify-between gap-1">
                        <div className="min-w-0">
                            <p className="text-xs font-medium text-gray-800 truncate leading-tight">
                                {group.name.bg || group.name.en || <span className="text-gray-400 italic">Без наименование</span>}
                            </p>
                            {group.name.en && group.name.en !== group.name.bg && (
                                <p className="text-[10px] text-gray-400 truncate">{group.name.en}</p>
                            )}
                        </div>
                        <button onClick={() => setEditing(true)} className="text-gray-400 hover:text-blue-500 flex-shrink-0">
                            <Pencil size={11} />
                        </button>
                    </div>
                )}
            </div>

            {/* delete */}
            <button
                onClick={onDelete}
                className="absolute top-1 left-1 bg-white/80 hover:bg-red-50 rounded-full p-0.5 shadow text-gray-400 hover:text-red-500"
                title="Изтрий група"
            >
                <X size={11} />
            </button>
        </div>
    );
};

function newPlace(): BrochurePlaceItem {
    return {
        id: `place-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        name: { bg: '', en: '' },
        description: { bg: '', en: '' },
        mapsUrl: '',
        phone: '',
        workingHours: undefined,
    };
}

// ─── sortable place card ─────────────────────────────────────────────────────
interface PlaceCardProps {
    place: BrochurePlaceItem;
    onChange: (updated: BrochurePlaceItem) => void;
    onDelete: () => void;
    groups: BrochureGroup[];
    onGroupsChange: (groups: BrochureGroup[]) => void;
}

const PlaceCard: React.FC<PlaceCardProps> = ({ place, onChange, onDelete, groups, onGroupsChange }) => {
    const [expanded, setExpanded] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [conversionStatus, setConversionStatus] = useState('');
    const [newGroupBg, setNewGroupBg] = useState('');
    const [newGroupEn, setNewGroupEn] = useState('');
    const [showNewGroupForm, setShowNewGroupForm] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const csvInputRef = useRef<HTMLInputElement>(null);

    const handleCsvImport = (file: File) => {
        const reader = new FileReader();
        reader.onload = e => {
            const text = e.target?.result as string;
            const lines = text.split(/\r?\n/).filter(l => l.trim());
            const imported = lines
                .map(line => {
                    // format: name_bg, name_en, quantity/duration_bg, quantity/duration_en, price (EUR)
                    const cols = line.split(/,|;/).map(c => c.trim().replace(/^"|"$/g, ''));
                    if (cols.length < 5) return null;
                    const [nameBg, nameEn, unitBg, unitEn, price] = cols;
                    return {
                        name: { bg: nameBg, en: nameEn },
                        price,
                        ...((unitBg || unitEn) ? { unit: { bg: unitBg, en: unitEn } } : {}),
                    };
                })
                .filter(Boolean) as { name: { bg: string; en: string }; price: string; unit?: { bg: string; en: string } }[];
            if (imported.length > 0) {
                onChange({ ...place, priceList: [...(place.priceList || []), ...imported] });
            }
        };
        reader.readAsText(file);
    };

    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: place.id });
    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const handleImageSelect = async (files: FileList | null) => {
        if (!files || files.length === 0) return;
        const file = files[0];
        if (!isSupportedImageFile(file) && !isHEICFile(file)) {
            alert('Unsupported image format');
            return;
        }
        setIsProcessing(true);
        setConversionStatus('Обработване…');
        try {
            const { successful } = await processImageFiles([file]);
            if (successful.length > 0) {
                const processedFile = successful[0].file;
                const preview = URL.createObjectURL(processedFile);
                onChange({ ...place, image: preview, imageFile: processedFile });
            }
        } finally {
            setIsProcessing(false);
            setConversionStatus('');
        }
    };

    const setHours = (day: string, val: { open: string; close: string } | null) => {
        const wh = { ...(place.workingHours || {}) };
        if (val === null) {
            wh[day] = null;
        } else {
            wh[day] = val;
        }
        onChange({ ...place, workingHours: wh });
    };

    const toggleDay = (day: string) => {
        const current = place.workingHours?.[day];
        if (current === null || current === undefined) {
            setHours(day, { open: '09:00', close: '18:00' });
        } else {
            setHours(day, null);
        }
    };

    const previewSrc = place.image || '';

    return (
        <div ref={setNodeRef} style={style} className="border border-gray-200 rounded-xl bg-white shadow-sm">
            {/* header row */}
            <div className="flex items-center gap-2 px-4 py-3">
                <button
                    className="cursor-grab text-gray-400 hover:text-gray-600 touch-none"
                    {...attributes}
                    {...listeners}
                >
                    <GripVertical size={18} />
                </button>
                {previewSrc ? (
                    <img src={previewSrc} alt="" className="w-10 h-10 rounded object-cover flex-shrink-0" />
                ) : (
                    <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <MapPin size={16} className="text-gray-400" />
                    </div>
                )}
                <span className="flex-1 font-medium text-sm text-gray-800 truncate">
                    {place.name.bg || place.name.en || <span className="text-gray-400 italic">Ново място</span>}
                </span>
                <button onClick={() => setExpanded(e => !e)} className="text-gray-400 hover:text-gray-600 p-1">
                    {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                <button
                    onClick={onDelete}
                    className="text-red-400 hover:text-red-600 p-1"
                    onPointerDown={e => e.stopPropagation()}
                >
                    <Trash2 size={16} />
                </button>
            </div>

            {expanded && (
                <div className="px-4 pb-4 space-y-4 border-t border-gray-100 pt-4">
                    {/* image */}
                    <div>
                        <p className="text-xs font-medium text-gray-600 mb-2">Снимка</p>
                        <div className="flex items-center gap-3">
                            {previewSrc ? (
                                <div className="relative w-24 h-16 rounded overflow-hidden flex-shrink-0">
                                    <OptimizedImage src={previewSrc} alt="" className="w-full h-full object-cover" />
                                    <button
                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs"
                                        onClick={() => onChange({ ...place, image: undefined, imageFile: undefined })}
                                        onPointerDown={e => e.stopPropagation()}
                                    >×</button>
                                </div>
                            ) : null}
                            <div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept={getSupportedImageTypes()}
                                    className="hidden"
                                    onChange={e => handleImageSelect(e.target.files)}
                                />
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isProcessing}
                                    onPointerDown={e => e.stopPropagation()}
                                >
                                    {isProcessing ? conversionStatus : previewSrc ? 'Смени снимка' : 'Добави снимка'}
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* names */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Ime (БГ)</label>
                            <Input
                                value={place.name.bg}
                                onChange={e => onChange({ ...place, name: { ...place.name, bg: e.target.value } })}
                                placeholder="Ресторант…"
                                onPointerDown={e => e.stopPropagation()}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Name (EN)</label>
                            <Input
                                value={place.name.en}
                                onChange={e => onChange({ ...place, name: { ...place.name, en: e.target.value } })}
                                placeholder="Restaurant…"
                                onPointerDown={e => e.stopPropagation()}
                            />
                        </div>
                    </div>

                    {/* descriptions */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Описание (БГ)</label>
                            <textarea
                                value={place.description?.bg || ''}
                                onChange={e => onChange({ ...place, description: { ...(place.description || { bg: '', en: '' }), bg: e.target.value } })}
                                placeholder="Кратко описание…"
                                rows={2}
                                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-blue-400"
                                onPointerDown={e => e.stopPropagation()}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Description (EN)</label>
                            <textarea
                                value={place.description?.en || ''}
                                onChange={e => onChange({ ...place, description: { ...(place.description || { bg: '', en: '' }), en: e.target.value } })}
                                placeholder="Short description…"
                                rows={2}
                                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-blue-400"
                                onPointerDown={e => e.stopPropagation()}
                            />
                        </div>
                    </div>

                    {/* group */}
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
                            <FolderOpen size={12} /> Групи
                        </label>
                        <div className="space-y-1" onPointerDown={e => e.stopPropagation()}>
                            {groups.map(g => {
                                const checked = (place.groupIds || []).includes(g.id);
                                return (
                                    <label key={g.id} className="flex items-center gap-2 cursor-pointer select-none">
                                        <input
                                            type="checkbox"
                                            checked={checked}
                                            onChange={() => {
                                                const current = place.groupIds || [];
                                                const next = checked
                                                    ? current.filter(id => id !== g.id)
                                                    : [...current, g.id];
                                                onChange({ ...place, groupIds: next.length > 0 ? next : undefined });
                                            }}
                                            className="rounded border-gray-300 text-blue-500"
                                        />
                                        <span className="text-sm text-gray-700">
                                            {g.name.bg}{g.name.en && g.name.en !== g.name.bg ? ` / ${g.name.en}` : ''}
                                        </span>
                                    </label>
                                );
                            })}
                            <button
                                className="text-xs text-blue-500 hover:text-blue-700 mt-1"
                                onClick={() => setShowNewGroupForm(v => !v)}
                            >
                                + Нова група…
                            </button>
                        </div>
                        {showNewGroupForm && (
                            <div className="mt-2 flex items-center gap-2 flex-wrap" onPointerDown={e => e.stopPropagation()}>
                                <Input
                                    value={newGroupBg}
                                    onChange={e => setNewGroupBg(e.target.value)}
                                    placeholder="Название (БГ)"
                                    className="flex-1 min-w-0 h-8 text-xs"
                                />
                                <Input
                                    value={newGroupEn}
                                    onChange={e => setNewGroupEn(e.target.value)}
                                    placeholder="Name (EN)"
                                    className="flex-1 min-w-0 h-8 text-xs"
                                />
                                <button
                                    className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                                    onClick={() => {
                                        if (!newGroupBg.trim() && !newGroupEn.trim()) return;
                                        const id = `group-${Date.now()}-${Math.random().toString(36).slice(2)}`;
                                        const newGroup: BrochureGroup = {
                                            id,
                                            name: { bg: newGroupBg.trim(), en: newGroupEn.trim() },
                                        };
                                        onGroupsChange([...groups, newGroup]);
                                        onChange({ ...place, groupIds: [...(place.groupIds || []), id] });
                                        setNewGroupBg('');
                                        setNewGroupEn('');
                                        setShowNewGroupForm(false);
                                    }}
                                >
                                    Създай
                                </button>
                                <button
                                    className="text-xs text-gray-500 hover:text-gray-700"
                                    onClick={() => setShowNewGroupForm(false)}
                                >
                                    Отказ
                                </button>
                            </div>
                        )}
                    </div>

                    {/* location + phone */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
                                <MapPin size={12} /> Google Maps URL
                            </label>
                            <Input
                                value={place.mapsUrl || ''}
                                onChange={e => onChange({ ...place, mapsUrl: e.target.value })}
                                placeholder="https://maps.google.com/…"
                                onPointerDown={e => e.stopPropagation()}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
                                <Phone size={12} /> Телефон
                            </label>
                            <Input
                                value={place.phone || ''}
                                onChange={e => onChange({ ...place, phone: e.target.value })}
                                placeholder="+359…"
                                onPointerDown={e => e.stopPropagation()}
                            />
                        </div>
                    </div>

                    {/* working hours */}
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Clock size={13} className="text-gray-500" />
                            <span className="text-xs font-medium text-gray-600">Работно време</span>
                        </div>
                        <div className="space-y-1">
                            {DAY_KEYS.map(day => {
                                const entry = place.workingHours?.[day];
                                const isOpen = entry !== null && entry !== undefined;
                                return (
                                    <div key={day} className="flex items-center gap-2">
                                        <button
                                            onClick={() => toggleDay(day)}
                                            onPointerDown={e => e.stopPropagation()}
                                            className={`w-10 text-xs font-medium rounded px-1 py-0.5 border transition-colors ${isOpen ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-gray-50 border-gray-200 text-gray-400'}`}
                                        >
                                            {DAY_LABELS[day]}
                                        </button>
                                        {isOpen && entry ? (
                                            <>
                                                <Input
                                                    type="time"
                                                    value={entry.open}
                                                    onChange={e => setHours(day, { ...entry, open: e.target.value })}
                                                    className="h-7 text-xs w-24"
                                                    onPointerDown={e => e.stopPropagation()}
                                                />
                                                <span className="text-xs text-gray-400">–</span>
                                                <Input
                                                    type="time"
                                                    value={entry.close}
                                                    onChange={e => setHours(day, { ...entry, close: e.target.value })}
                                                    className="h-7 text-xs w-24"
                                                    onPointerDown={e => e.stopPropagation()}
                                                />
                                            </>
                                        ) : (
                                            <span className="text-xs text-gray-400 italic">затворено</span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* pricelist */}
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Tag size={13} className="text-gray-500" />
                            <span className="text-xs font-medium text-gray-600">Ценова листа</span>
                        </div>
                        <div className="space-y-2">
                            {(place.priceList || []).map((item, idx) => (
                                <div key={idx} className="grid grid-cols-[1fr_1fr_80px_80px_28px] gap-2 items-center">
                                    <Input
                                        value={item.name.bg}
                                        onChange={e => {
                                            const list = [...(place.priceList || [])];
                                            list[idx] = { ...item, name: { ...item.name, bg: e.target.value } };
                                            onChange({ ...place, priceList: list });
                                        }}
                                        placeholder="Елемент (БГ)"
                                        className="h-7 text-xs"
                                        onPointerDown={e => e.stopPropagation()}
                                    />
                                    <Input
                                        value={item.name.en}
                                        onChange={e => {
                                            const list = [...(place.priceList || [])];
                                            list[idx] = { ...item, name: { ...item.name, en: e.target.value } };
                                            onChange({ ...place, priceList: list });
                                        }}
                                        placeholder="Item (EN)"
                                        className="h-7 text-xs"
                                        onPointerDown={e => e.stopPropagation()}
                                    />
                                    <Input
                                        value={item.price}
                                        onChange={e => {
                                            const list = [...(place.priceList || [])];
                                            list[idx] = { ...item, price: e.target.value };
                                            onChange({ ...place, priceList: list });
                                        }}
                                        placeholder="Цена"
                                        className="h-7 text-xs"
                                        onPointerDown={e => e.stopPropagation()}
                                    />
                                    <Input
                                        value={item.unit?.bg || ''}
                                        onChange={e => {
                                            const list = [...(place.priceList || [])];
                                            list[idx] = { ...item, unit: { bg: e.target.value, en: item.unit?.en || '' } };
                                            onChange({ ...place, priceList: list });
                                        }}
                                        placeholder="бр/кг…"
                                        className="h-7 text-xs"
                                        onPointerDown={e => e.stopPropagation()}
                                    />
                                    <button
                                        onClick={() => {
                                            const list = (place.priceList || []).filter((_, i) => i !== idx);
                                            onChange({ ...place, priceList: list });
                                        }}
                                        className="text-red-400 hover:text-red-600 flex-shrink-0"
                                        onPointerDown={e => e.stopPropagation()}
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="mt-2 flex items-center gap-3">
                            <button
                                onClick={() => {
                                    const list = [...(place.priceList || []), { name: { bg: '', en: '' }, price: '' }];
                                    onChange({ ...place, priceList: list });
                                }}
                                className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700"
                                onPointerDown={e => e.stopPropagation()}
                            >
                                <Plus size={13} /> Добави ред
                            </button>
                            <button
                                onClick={() => csvInputRef.current?.click()}
                                className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
                                onPointerDown={e => e.stopPropagation()}
                                title="CSV формат: Продукт (BG), Продукт (EN), Количество (BG), Количество (EN), Цена (EUR)"
                            >
                                <Upload size={13} /> Импорт CSV
                            </button>
                            <input
                                ref={csvInputRef}
                                type="file"
                                accept=".csv,text/csv"
                                className="hidden"
                                onChange={e => {
                                    const f = e.target.files?.[0];
                                    if (f) handleCsvImport(f);
                                    e.target.value = '';
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// ─── main tab ────────────────────────────────────────────────────────────────
const ApartmentBrochureTab: React.FC<BrochureTabProps> = ({
    brochureItems,
    setBrochureItems,
    brochureGroups,
    setBrochureGroups,
    slug
}) => {
    const [isLinkCopied, setIsLinkCopied] = useState(false);

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

    const handleCopyBrochureLink = () => {
        if (!slug) return;
        const url = `${window.location.origin}/apartments/${slug}/brochure`;
        navigator.clipboard.writeText(url).then(() => {
            setIsLinkCopied(true);
            window.setTimeout(() => setIsLinkCopied(false), 2000);
        });
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setBrochureItems(prev => {
                const oldIdx = prev.findIndex(i => i.id === active.id);
                const newIdx = prev.findIndex(i => i.id === over.id);
                return arrayMove(prev, oldIdx, newIdx);
            });
        }
    };

    const addPlace = () => setBrochureItems(prev => [...prev, newPlace()]);

    const updatePlace = (id: string, updated: BrochurePlaceItem) =>
        setBrochureItems(prev => prev.map(p => p.id === id ? updated : p));

    const deletePlace = (id: string) =>
        setBrochureItems(prev => prev.filter(p => p.id !== id));

    return (
        <div className="space-y-6 pb-6">
            {/* share link */}
            <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-gray-800">Места в брошурата</h3>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyBrochureLink}
                    disabled={!slug}
                    className="flex items-center gap-2"
                >
                    {isLinkCopied ? <Check size={14} className="text-green-500" /> : <Share2 size={14} />}
                    {isLinkCopied ? 'Копирано!' : 'Сподели линк'}
                </Button>
            </div>

            {/* groups manager */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-gray-600 flex items-center gap-1">
                        <FolderOpen size={12} /> Групи
                    </p>
                    <button
                        className="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1"
                        onClick={() => {
                            const id = `group-${Date.now()}-${Math.random().toString(36).slice(2)}`;
                            setBrochureGroups(prev => [...prev, { id, name: { bg: '', en: '' } }]);
                        }}
                    >
                        <Plus size={12} /> Нова група
                    </button>
                </div>
                {brochureGroups.length > 0 ? (
                    <div className="flex flex-wrap gap-3">
                        {brochureGroups.map(g => (
                            <GroupCard
                                key={g.id}
                                group={g}
                                onChange={updated => setBrochureGroups(prev => prev.map(x => x.id === g.id ? updated : x))}
                                onDelete={() => {
                                    setBrochureGroups(prev => prev.filter(x => x.id !== g.id));
                                    setBrochureItems(prev => prev.map(p =>
                                        p.groupIds?.includes(g.id)
                                            ? { ...p, groupIds: p.groupIds.filter(id => id !== g.id) }
                                            : p
                                    ));
                                }}
                            />
                        ))}
                    </div>
                ) : (
                    <p className="text-xs text-gray-400 italic">Все още няма групи.</p>
                )}
            </div>

            {/* places list */}
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={brochureItems.map(p => p.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-3">
                        {brochureItems.map(place => (
                            <PlaceCard
                                key={place.id}
                                place={place}
                                onChange={updated => updatePlace(place.id, updated)}
                                onDelete={() => deletePlace(place.id)}
                                groups={brochureGroups}
                                onGroupsChange={setBrochureGroups}
                            />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>

            {brochureItems.length === 0 && (
                <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 text-sm">
                    Все още няма добавени места. Кликни „Добави място".
                </div>
            )}

            <Button variant="outline" onClick={addPlace} className="w-full flex items-center gap-2">
                <Plus size={16} /> Добави място
            </Button>

            {/* navigation icons section */}
            <div className="border-t pt-6">
                <NavigationIconsSection
                    navigationIcons={currentApartmentData.navigationIcons}
                    onChange={(icons) => setCurrentApartmentData(prev => ({ ...prev, navigationIcons: icons }))}
                />
            </div>
        </div>
    );
};

export default ApartmentBrochureTab;
