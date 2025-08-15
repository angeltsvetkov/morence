import React from 'react';
import { Input } from '../../ui/input';
import { Button } from '../../ui/button';
import { useAdminLanguage } from '../../../hooks/useAdminLanguage';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { TabProps } from './types';
import { Amenity } from '../../../types';

interface ApartmentAmenitiesTabProps extends TabProps {
    availableAmenities: Amenity[];
    handleAmenityToggle: (amenityKey: string) => void;
    handleCustomAmenityAdd: (value: string) => void;
    handleAmenityRemove: (amenity: string) => void;
    handleAmenitiesOnDragEnd: (result: DropResult) => void;
    getAmenityTranslation: (amenity: string) => string;
    renderAmenityIcon: (amenity: string) => React.ReactNode;
}

const ApartmentAmenitiesTab: React.FC<ApartmentAmenitiesTabProps> = ({
    currentApartmentData,
    setCurrentApartmentData,
    formLanguage,
    setFormLanguage,
    availableAmenities,
    handleAmenityToggle,
    handleCustomAmenityAdd,
    handleAmenityRemove,
    handleAmenitiesOnDragEnd,
    getAmenityTranslation,
    renderAmenityIcon
}) => {
    const { t } = useAdminLanguage();

    return (
        <div className="space-y-6 pb-16">
            {/* Tab Header */}
            <div className="flex justify-between items-center mb-6 pb-4 border-b">
                <h3 className="text-xl font-semibold text-gray-900">{t('amenities')}</h3>
                <div>
                    <span className="text-sm text-gray-600 mr-2">{t('language')}:</span>
                    <button onClick={() => setFormLanguage('bg')} className={`px-3 py-1 text-xs rounded-l-md ${formLanguage === 'bg' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>BG</button>
                    <button onClick={() => setFormLanguage('en')} className={`px-3 py-1 text-xs rounded-r-md ${formLanguage === 'en' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>EN</button>
                </div>
            </div>

            {/* Predefined Amenities Section */}
            <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    {t('selectCommonAmenities')}
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        formLanguage === 'bg' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                        {formLanguage === 'bg' ? '🇧🇬 BG' : '🇬🇧 EN'}
                    </span>
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {availableAmenities.map((amenityData) => {
                        const amenityKey = amenityData.en; // Store English key in database
                        const isSelected = (currentApartmentData.amenities || []).includes(amenityKey);
                        return (
                            <label
                                key={amenityData.id}
                                className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                                    isSelected 
                                        ? 'bg-blue-50 border-blue-300 text-blue-800' 
                                        : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                                <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => handleAmenityToggle(amenityKey)}
                                    className="mr-3 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                                />
                                <div className="flex items-center gap-2 flex-1">
                                    {amenityData.icon && (
                                        <div className="flex-shrink-0 text-gray-600">
                                            {renderAmenityIcon(amenityKey)}
                                        </div>
                                    )}
                                    <span className="text-sm font-medium">{formLanguage === 'bg' ? amenityData.bg : amenityData.en}</span>
                                </div>
                            </label>
                        );
                    })}
                </div>
            </div>

            {/* Custom Amenities Section */}
            <div className="border-t pt-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    {t('addCustomAmenity')}
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        formLanguage === 'bg' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                        {formLanguage === 'bg' ? '🇧🇬 BG' : '🇬🇧 EN'}
                    </span>
                </h4>
                
                <div className="flex gap-3 mb-4">
                    <Input
                        placeholder={t('enterAmenity')}
                        onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
                            if (e.key === 'Enter') {
                                const input = e.target as HTMLInputElement;
                                handleCustomAmenityAdd(input.value);
                                input.value = '';
                            }
                        }}
                        className="flex-1 border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                    <Button
                        type="button"
                        onClick={(e) => {
                            const input = e.currentTarget.parentElement?.querySelector('input') as HTMLInputElement;
                            if (input) {
                                handleCustomAmenityAdd(input.value);
                                input.value = '';
                            }
                        }}
                        className="bg-green-600 hover:bg-green-700"
                    >
                        {t('add')}
                    </Button>
                </div>
            </div>

            {/* Currently Selected Amenities Section - Reorderable */}
            <div className="border-t pt-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    {t('selectedAmenities')}
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        formLanguage === 'bg' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                        {formLanguage === 'bg' ? '🇧🇬 BG' : '🇬🇧 EN'}
                    </span>
                    <span className="text-sm text-gray-500">
                        ({(currentApartmentData.amenities || []).length} {t('selected')})
                    </span>
                    {(currentApartmentData.amenities || []).length > 1 && (
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                            {formLanguage === 'bg' ? '↕️ Влачете за пренареждане' : '↕️ Drag to reorder'}
                        </span>
                    )}
                </h4>
                
                {(currentApartmentData.amenities || []).length > 0 ? (
                    <DragDropContext onDragEnd={handleAmenitiesOnDragEnd}>
                        <Droppable droppableId="amenities-list" direction="horizontal">
                            {(provided, snapshot) => (
                                <div
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                    className={`flex flex-wrap gap-2 p-4 rounded-lg transition-colors ${
                                        snapshot.isDraggingOver ? 'bg-blue-50 border-2 border-dashed border-blue-300' : 'bg-gray-50'
                                    }`}
                                >
                                    {(currentApartmentData.amenities || []).map((amenity: string, index: number) => (
                                        <Draggable key={amenity} draggableId={amenity} index={index}>
                                            {(provided, snapshot) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm transition-all cursor-move ${
                                                        snapshot.isDragging
                                                            ? 'bg-blue-200 text-blue-900 shadow-lg scale-105 rotate-2'
                                                            : 'bg-blue-100 text-blue-800 hover:bg-blue-200 hover:scale-105'
                                                    }`}
                                                >
                                                    {/* Drag Handle Icon */}
                                                    <div className="flex-shrink-0 text-blue-600 opacity-50">
                                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"/>
                                                        </svg>
                                                    </div>
                                                    
                                                    {/* Amenity Icon */}
                                                    {renderAmenityIcon(amenity) && (
                                                        <div className="flex-shrink-0">
                                                            {renderAmenityIcon(amenity)}
                                                        </div>
                                                    )}
                                                    
                                                    {/* Amenity Name */}
                                                    <span className="font-medium">{getAmenityTranslation(amenity)}</span>
                                                    
                                                    {/* Remove Button */}
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleAmenityRemove(amenity);
                                                        }}
                                                        className="text-blue-600 hover:text-red-600 font-bold text-lg leading-none transition-colors ml-1"
                                                        title={formLanguage === 'bg' ? 'Премахни удобство' : 'Remove amenity'}
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                ) : (
                    <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                        <p>{formLanguage === 'bg' ? 
                            'Все още няма избрани удобства. Изберете от опциите по-горе или добавете персонализирани удобства.' : 
                            'No amenities selected yet. Select from the options above or add custom amenities.'
                        }</p>
                    </div>
                )}
            </div>

            {/* Summary Section */}
            <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-md font-semibold text-gray-800 mb-3">{t('summary')}</h4>
                <div className="text-sm">
                    <span className="font-medium text-gray-700">{formLanguage === 'bg' ? 'Избрани удобства' : 'Selected amenities'} ({(currentApartmentData.amenities || []).length}):</span>
                    <p className="text-gray-600 mt-1">
                        {(currentApartmentData.amenities || []).length > 0 
                            ? (currentApartmentData.amenities || []).map(amenity => getAmenityTranslation(amenity)).join(', ')
                            : (formLanguage === 'bg' ? 'Няма избрани удобства' : 'No amenities selected')
                        }
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ApartmentAmenitiesTab; 