import React, { useRef, useState } from 'react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { useAdminLanguage } from '../../../hooks/useAdminLanguage';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { MoreVertical, Trash2, Home, Star, AlertCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import { GalleryTabProps } from './types';
import OptimizedImage from '../../ui/optimized-image';
import { processImageFiles, getSupportedImageTypes, isSupportedImageFile, isHEICFile } from '../../../utils/imageUtils';

interface ApartmentGalleryTabProps extends GalleryTabProps {
    handleOnDragEnd: (result: DropResult) => void;
    handleSetHeroImage: (url: string) => void;
    handleToggleFavouriteImage: (url: string) => void;
    handleImageDelete: (id: string) => void;
}

const ApartmentGalleryTab: React.FC<ApartmentGalleryTabProps> = ({
    currentApartmentData,
    setCurrentApartmentData,
    galleryItems,
    setGalleryItems,
    handleOnDragEnd,
    handleSetHeroImage,
    handleToggleFavouriteImage,
    handleImageDelete
}) => {
    const { t } = useAdminLanguage();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isProcessingImages, setIsProcessingImages] = useState(false);
    const [conversionStatus, setConversionStatus] = useState<string>('');

    return (
        <div className="pb-16">
            {/* Tab Header */}
            <div className="flex justify-between items-center mb-6 pb-4 border-b">
                <h3 className="text-xl font-semibold text-gray-900">{t('gallery')}</h3>
            </div>

            <div className="flex flex-col gap-2">
                <Button 
                    type="button" 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isProcessingImages}
                    className="flex items-center gap-2"
                >
                    {isProcessingImages ? (
                        <>
                            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                            {t('processing')}...
                        </>
                    ) : (
                        t('uploadNewPhotos')
                    )}
                </Button>
                
                {/* HEIC Support Info */}
                <div className="text-xs text-gray-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {t('heicSupportInfo')}
                </div>
                
                {/* Conversion Status */}
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
                id="photos"
                type="file"
                multiple
                accept={getSupportedImageTypes()}
                onChange={async (e) => {
                    if (!e.target.files || e.target.files.length === 0) return;

                    const fileArray = Array.from(e.target.files);
                    
                    // Validate all files are supported image types
                    const invalidFiles = fileArray.filter(file => !isSupportedImageFile(file));
                    if (invalidFiles.length > 0) {
                        alert(`Unsupported file types: ${invalidFiles.map(f => f.name).join(', ')}`);
                        return;
                    }

                    setIsProcessingImages(true);
                    setConversionStatus('');

                    try {
                        // Check if we have HEIC files
                        const heicFiles = fileArray.filter(isHEICFile);
                        if (heicFiles.length > 0) {
                            setConversionStatus(`Converting ${heicFiles.length} HEIC image(s) to JPEG...`);
                        }

                        // Process all files (convert HEIC if needed)
                        const { successful, failed } = await processImageFiles(fileArray);
                        
                        // Create gallery items from successful conversions
                        if (successful.length > 0) {
                            const newItems = successful.map((img, index) => ({
                                id: `new-${Date.now()}-${index}`,
                                url: URL.createObjectURL(img.file),
                                file: img.file
                            }));
                            setGalleryItems(prev => [...prev, ...newItems]);
                        }
                        
                        // Show results summary
                        let statusMessage = '';
                        
                        if (successful.length > 0) {
                            const convertedCount = successful.filter(img => img.wasConverted).length;
                            if (convertedCount > 0) {
                                statusMessage += `✅ Successfully converted ${convertedCount} HEIC image(s) to JPEG. `;
                            }
                            if (successful.length > convertedCount) {
                                statusMessage += `✅ Added ${successful.length - convertedCount} standard image(s). `;
                            }
                        }
                        
                        if (failed.length > 0) {
                            statusMessage += `⚠️ Failed to process ${failed.length} file(s): ${failed.map(f => f.file.name).join(', ')}. `;
                            console.error('Failed files details:', failed);
                            
                            // Show detailed error for failed files
                            const detailedErrors = failed.map(f => `• ${f.file.name}: ${f.error}`).join('\n');
                            setTimeout(() => {
                                alert(`Some files could not be processed:\n\n${detailedErrors}\n\nThe other files were uploaded successfully.`);
                            }, 100);
                        }
                        
                        if (statusMessage) {
                            setConversionStatus(statusMessage.trim());
                            setTimeout(() => setConversionStatus(''), failed.length > 0 ? 8000 : 3000);
                        }
                        
                    } catch (error) {
                        console.error('Error processing images:', error);
                        setConversionStatus(`❌ Error processing images: ${error instanceof Error ? error.message : 'Unknown error'}`);
                        setTimeout(() => setConversionStatus(''), 5000);
                    } finally {
                        setIsProcessingImages(false);
                        // Reset file input
                        if (fileInputRef.current) {
                            fileInputRef.current.value = '';
                        }
                    }
                }}
                disabled={isProcessingImages}
                className="hidden"
            />

            <h3 className="text-lg font-semibold mt-6 mb-2">{t('currentGallery')}</h3>
            <p className="text-sm text-gray-500 mb-4">{t('dragAndDropImages')}</p>
            <DragDropContext onDragEnd={handleOnDragEnd}>
                <Droppable droppableId="photos" direction="horizontal">
                    {(provided) => (
                        <div
                            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                        >
                            {galleryItems.map((item, index) => (
                                <Draggable key={item.id} draggableId={item.id} index={index}>
                                    {(provided) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            className={`relative group bg-gray-100 rounded-lg overflow-hidden ${currentApartmentData.heroImage === item.url ? 'border-4 border-yellow-400' : item.file ? 'border-4 border-dashed border-blue-400' : ''}`}
                                        >
                                            <OptimizedImage 
                                                src={item.url} 
                                                className="w-full h-40 object-cover" 
                                                alt="Apartment"
                                                placeholder="skeleton"
                                                lazy={false} // Admin images load immediately
                                                height={160} // h-40 = 160px
                                            />
                                            <div className="absolute top-2 left-2 flex items-center gap-x-1 z-10">
                                                {currentApartmentData.heroImage === item.url && (
                                                    <div className="bg-yellow-400 p-1 rounded-full">
                                                        <Home className="h-4 w-4 text-white" />
                                                    </div>
                                                )}
                                                {(currentApartmentData.favouriteImages || []).includes(item.url) && (
                                                    <div className="bg-pink-500 p-1 rounded-full">
                                                        <Star className="h-4 w-4 text-white" />
                                                    </div>
                                                )}
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild className="absolute top-2 right-2 bg-white/70 hover:bg-white z-10">
                                                    <Button variant="secondary" size="icon">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    <DropdownMenuItem onClick={() => handleSetHeroImage(item.url)}>
                                                        <Home className="mr-2 h-4 w-4" />
                                                        <span>{t('setAsHomeImage')}</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleToggleFavouriteImage(item.url)}>
                                                        <Star className="mr-2 h-4 w-4" />
                                                        <span>{(currentApartmentData.favouriteImages || []).includes(item.url) ? t('removeFromFavourites') : t('addToFavourites')}</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleImageDelete(item.id)} className="text-red-500">
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        <span>{t('delete')}</span>
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>
        </div>
    );
};

export default ApartmentGalleryTab; 