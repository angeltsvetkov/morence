import React, { useMemo, useRef, useState } from 'react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { BrochureTabProps } from './types';
import { useAdminLanguage } from '../../../hooks/useAdminLanguage';
import { Share2, Check, Trash2, AlertCircle } from 'lucide-react';
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
    rectSortingStrategy,
    arrayMove
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import OptimizedImage from '../../ui/optimized-image';
import { processImageFiles, getSupportedImageTypes, isSupportedImageFile, isHEICFile } from '../../../utils/imageUtils';

const ApartmentBrochureTab: React.FC<BrochureTabProps> = ({
    formLanguage,
    setFormLanguage,
    brochureItems,
    setBrochureItems,
    slug
}) => {
    const { t } = useAdminLanguage();
    const [isLinkCopied, setIsLinkCopied] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [conversionStatus, setConversionStatus] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const items = brochureItems[formLanguage];

    const handleCopyBrochureLink = () => {
        if (!slug) return;
        const url = `${window.location.origin}/apartments/${slug}/brochure`;
        navigator.clipboard.writeText(url).then(() => {
            setIsLinkCopied(true);
            window.setTimeout(() => setIsLinkCopied(false), 2000);
        });
    };

    const handleDelete = (id: string) => {
        setBrochureItems(prev => ({
            ...prev,
            [formLanguage]: prev[formLanguage].filter(item => item.id !== id)
        }));
    };

    const handleReorder = (oldIndex: number, newIndex: number) => {
        setBrochureItems(prev => ({
            ...prev,
            [formLanguage]: arrayMove(prev[formLanguage], oldIndex, newIndex)
        }));
    };

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const ids = items.map(i => i.id);
        const oldIndex = ids.indexOf(String(active.id));
        const newIndex = ids.indexOf(String(over.id));
        if (oldIndex !== -1 && newIndex !== -1) handleReorder(oldIndex, newIndex);
    };

    return (
        <div className="space-y-4 pb-16">
            {/* Header */}
            <div className="flex justify-between items-center mb-6 pb-4 border-b">
                <h3 className="text-xl font-semibold text-gray-900">{t('guestBrochure')}</h3>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={handleCopyBrochureLink}
                        disabled={!slug}
                        className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                            isLinkCopied
                                ? 'bg-green-50 text-green-700'
                                : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {isLinkCopied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                        {isLinkCopied ? t('linkCopied') : t('shareLink')}
                    </button>
                    <button
                        onClick={() => setFormLanguage('bg')}
                        className={`px-3 py-1 text-xs rounded-l-md ${formLanguage === 'bg' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                    >BG</button>
                    <button
                        onClick={() => setFormLanguage('en')}
                        className={`px-3 py-1 text-xs rounded-r-md ${formLanguage === 'en' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                    >EN</button>
                </div>
            </div>

            {/* Upload */}
            <div className="flex flex-col gap-2">
                <Button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isProcessing}
                    className="flex items-center gap-2 w-fit"
                >
                    {isProcessing ? (
                        <>
                            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                            {t('processing')}...
                        </>
                    ) : (
                        t('uploadNewPhotos')
                    )}
                </Button>
                <div className="text-xs text-gray-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {t('heicSupportInfo')}
                </div>
                {conversionStatus && (
                    <div className={`text-sm p-2 rounded ${
                        conversionStatus.includes('❌')
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : conversionStatus.includes('✅')
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}>
                        {conversionStatus}
                    </div>
                )}
            </div>

            <Input
                ref={fileInputRef}
                type="file"
                multiple
                accept={getSupportedImageTypes()}
                className="hidden"
                disabled={isProcessing}
                onChange={async (e) => {
                    if (!e.target.files || e.target.files.length === 0) return;
                    const fileArray = Array.from(e.target.files);
                    const invalid = fileArray.filter(f => !isSupportedImageFile(f));
                    if (invalid.length > 0) {
                        alert(`Unsupported file types: ${invalid.map(f => f.name).join(', ')}`);
                        return;
                    }
                    setIsProcessing(true);
                    setConversionStatus('');
                    try {
                        const heicFiles = fileArray.filter(isHEICFile);
                        if (heicFiles.length > 0) setConversionStatus(`Converting ${heicFiles.length} HEIC image(s) to JPEG...`);

                        const { successful, failed } = await processImageFiles(fileArray);
                        if (successful.length > 0) {
                            const newItems = successful.map(img => ({
                                id: `new-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                                url: URL.createObjectURL(img.file),
                                file: img.file
                            }));
                            setBrochureItems(prev => ({
                                ...prev,
                                [formLanguage]: [...prev[formLanguage], ...newItems]
                            }));
                        }
                        let status = '';
                        if (successful.length > 0) {
                            const converted = successful.filter(i => i.wasConverted).length;
                            if (converted > 0) status += `✅ Converted ${converted} HEIC. `;
                            if (successful.length > converted) status += `✅ Added ${successful.length - converted} image(s). `;
                        }
                        if (failed.length > 0) status += `⚠️ Failed: ${failed.map(f => f.file.name).join(', ')}`;
                        if (status) {
                            setConversionStatus(status.trim());
                            setTimeout(() => setConversionStatus(''), failed.length > 0 ? 8000 : 3000);
                        }
                    } catch (err) {
                        setConversionStatus(`❌ Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
                        setTimeout(() => setConversionStatus(''), 5000);
                    } finally {
                        setIsProcessing(false);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                    }
                }}
            />

            {/* Grid */}
            {items.length > 0 ? (
                <>
                    <h4 className="text-sm font-semibold text-gray-700 mt-4">
                        {formLanguage === 'bg' ? 'Изображения (BG)' : 'Images (EN)'} — {items.length}
                    </h4>
                    <p className="text-xs text-gray-400">{t('dragAndDropImages')}</p>
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={items.map(i => i.id)} strategy={rectSortingStrategy}>
                            <div className="flex flex-wrap gap-4">
                                {items.map(item => (
                                    <SortableBrochurePhoto key={item.id} id={item.id}>
                                        <div className={`relative group bg-gray-100 rounded-lg overflow-hidden w-48 h-48 ${item.file ? 'border-4 border-dashed border-blue-400' : ''}`}>
                                            <OptimizedImage
                                                src={item.url}
                                                className="w-full h-full object-cover"
                                                alt="Brochure"
                                                placeholder="skeleton"
                                                lazy={false}
                                                height={192}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(item.id)}
                                                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </SortableBrochurePhoto>
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                </>
            ) : (
                <div className="mt-6 border-2 border-dashed border-gray-200 rounded-xl p-10 text-center text-gray-400 text-sm">
                    {formLanguage === 'bg'
                        ? 'Няма качени изображения за BG версията'
                        : 'No images uploaded for the EN version'}
                </div>
            )}
        </div>
    );
};

const SortableBrochurePhoto: React.FC<{ id: string; children: React.ReactNode }> = ({ id, children }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
    const style: React.CSSProperties = useMemo(() => ({
        transform: CSS.Transform.toString(transform),
        transition,
        cursor: 'grab',
        opacity: isDragging ? 0.6 : 1,
        zIndex: isDragging ? 50 : 'auto'
    }), [transform, transition, isDragging]);

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            {children}
        </div>
    );
};

export default ApartmentBrochureTab;
