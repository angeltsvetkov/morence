import React, { useState, useCallback, useMemo } from 'react';
import { ChevronLeft, ChevronRight, X, Camera } from 'lucide-react';
import OptimizedImage from './optimized-image';
import { useImagePreloader } from '../../hooks/useImagePreloader';

interface ImageGalleryOptimizedProps {
    images: string[];
    className?: string;
    showThumbnails?: boolean;
    initialIndex?: number;
    onClose?: () => void;
    isLightbox?: boolean;
}

const ImageGalleryOptimized: React.FC<ImageGalleryOptimizedProps> = ({
    images,
    className = '',
    showThumbnails = true,
    initialIndex = 0,
    onClose,
    isLightbox = false
}) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [isFullscreen, setIsFullscreen] = useState(isLightbox);

    // Preload all images for smooth navigation
    const { getImageStatus, loadedPercentage } = useImagePreloader(images, { priority: true });

    const goToPrevious = useCallback(() => {
        setCurrentIndex(prev => prev === 0 ? images.length - 1 : prev - 1);
    }, [images.length]);

    const goToNext = useCallback(() => {
        setCurrentIndex(prev => prev === images.length - 1 ? 0 : prev + 1);
    }, [images.length]);

    const goToIndex = useCallback((index: number) => {
        setCurrentIndex(index);
    }, []);

    const openFullscreen = useCallback(() => {
        setIsFullscreen(true);
    }, []);

    const closeFullscreen = useCallback(() => {
        setIsFullscreen(false);
        onClose?.();
    }, [onClose]);

    // Handle keyboard navigation
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (!isFullscreen) return;

        switch (e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                goToPrevious();
                break;
            case 'ArrowRight':
                e.preventDefault();
                goToNext();
                break;
            case 'Escape':
                e.preventDefault();
                closeFullscreen();
                break;
        }
    }, [isFullscreen, goToPrevious, goToNext, closeFullscreen]);

    React.useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    // Memoize the current image status
    const currentImageStatus = useMemo(() => {
        return images[currentIndex] ? getImageStatus(images[currentIndex]) : null;
    }, [images, currentIndex, getImageStatus]);

    if (images.length === 0) {
        return (
            <div className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`}>
                <div className="text-center text-gray-500">
                    <Camera className="w-12 h-12 mx-auto mb-2" />
                    <p>No images available</p>
                </div>
            </div>
        );
    }

    const galleryContent = (
        <div className={`relative ${isFullscreen ? 'w-full h-full' : className}`}>
            {/* Loading Progress Bar */}
            {loadedPercentage < 100 && (
                <div className="absolute top-0 left-0 right-0 z-50 bg-gray-200 h-1">
                    <div 
                        className="bg-blue-500 h-full transition-all duration-300"
                        style={{ width: `${loadedPercentage}%` }}
                    />
                </div>
            )}

            {/* Main Image Container */}
            <div className="relative w-full h-full bg-black rounded-lg overflow-hidden">
                <OptimizedImage
                    src={images[currentIndex]}
                    alt={`Gallery image ${currentIndex + 1}`}
                    className="w-full h-full object-contain cursor-pointer"
                    priority={true}
                    placeholder="skeleton"
                    lazy={false}
                    onClick={!isFullscreen ? openFullscreen : undefined}
                />

                {/* Navigation Arrows */}
                {images.length > 1 && (
                    <>
                        <button
                            onClick={goToPrevious}
                            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-all duration-200 z-40"
                            aria-label="Previous image"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button
                            onClick={goToNext}
                            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-all duration-200 z-40"
                            aria-label="Next image"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>
                    </>
                )}

                {/* Close Button (only in fullscreen) */}
                {isFullscreen && (
                    <button
                        onClick={closeFullscreen}
                        className="absolute top-4 right-4 w-12 h-12 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-all duration-200 z-50"
                        aria-label="Close gallery"
                    >
                        <X className="w-6 h-6" />
                    </button>
                )}

                {/* Image Counter */}
                {images.length > 1 && (
                    <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm z-40">
                        {currentIndex + 1} / {images.length}
                    </div>
                )}

                {/* Loading Status */}
                {currentImageStatus && !currentImageStatus.loaded && !currentImageStatus.error && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-30">
                        <div className="bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2">
                            <div className="flex items-center space-x-2">
                                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-sm text-gray-700">Loading...</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Thumbnails */}
            {showThumbnails && images.length > 1 && !isFullscreen && (
                <div className="flex space-x-2 mt-4 overflow-x-auto pb-2">
                    {images.map((image, index) => {
                        const imageStatus = getImageStatus(image);
                        return (
                            <button
                                key={index}
                                onClick={() => goToIndex(index)}
                                className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                                    index === currentIndex 
                                        ? 'border-blue-500 ring-2 ring-blue-200' 
                                        : 'border-gray-300 hover:border-gray-400'
                                }`}
                            >
                                <OptimizedImage
                                    src={image}
                                    alt={`Thumbnail ${index + 1}`}
                                    className="w-full h-full object-cover"
                                    placeholder="skeleton"
                                    lazy={true}
                                />
                                {!imageStatus.loaded && !imageStatus.error && (
                                    <div className="absolute inset-0 bg-gray-200 animate-pulse" />
                                )}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );

    // Render fullscreen overlay if needed
    if (isFullscreen) {
        return (
            <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
                {galleryContent}
            </div>
        );
    }

    return galleryContent;
};

export default ImageGalleryOptimized; 