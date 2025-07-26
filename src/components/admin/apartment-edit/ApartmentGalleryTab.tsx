import React, { useRef } from 'react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { useAdminLanguage } from '../../../hooks/useAdminLanguage';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { MoreVertical, Trash2, Home, Star } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import { GalleryTabProps } from './types';

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

    return (
        <div>
            {/* Tab Header */}
            <div className="flex justify-between items-center mb-6 pb-4 border-b">
                <h3 className="text-xl font-semibold text-gray-900">{t('gallery')}</h3>
            </div>

            <Button type="button" onClick={() => fileInputRef.current?.click()}>
                {t('uploadNewPhotos')}
            </Button>
            <Input
                ref={fileInputRef}
                id="photos"
                type="file"
                multiple
                onChange={e => {
                    if (e.target.files) {
                        const newFiles = Array.from(e.target.files);
                        const newItems = newFiles.map((file, index) => ({
                            id: `new-${Date.now()}-${index}`,
                            url: URL.createObjectURL(file),
                            file: file
                        }));
                        setGalleryItems(prev => [...prev, ...newItems]);
                    }
                }}
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
                                            <img src={item.url} className="w-full h-40 object-cover" alt="Apartment" />
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