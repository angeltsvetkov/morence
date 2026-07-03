import React, { useRef, useState } from 'react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { BrochureTabProps, BrochurePlaceItem } from './types';
import { useAdminLanguage } from '../../../hooks/useAdminLanguage';
import { Share2, Check, Trash2, Plus, Phone, MapPin, Clock, ChevronDown, ChevronUp, GripVertical } from 'lucide-react';
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

const DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;
const DAY_LABELS: Record<string, string> = {
    mon: 'Пон', tue: 'Вт', wed: 'Ср', thu: 'Чет', fri: 'Пет', sat: 'Съб', sun: 'Нед'
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
}

const PlaceCard: React.FC<PlaceCardProps> = ({ place, onChange, onDelete }) => {
    const [expanded, setExpanded] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [conversionStatus, setConversionStatus] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

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
            const processed = await processImageFiles([file]);
            if (processed.length > 0) {
                const { file: processedFile, preview } = processed[0];
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
                </div>
            )}
        </div>
    );
};

// ─── main tab ────────────────────────────────────────────────────────────────
const ApartmentBrochureTab: React.FC<BrochureTabProps> = ({
    brochureItems,
    setBrochureItems,
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
        <div className="space-y-6">
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
        </div>
    );
};

export default ApartmentBrochureTab;
