import { useEffect, useState, useCallback } from 'react';

interface PreloadedImage {
    src: string;
    loaded: boolean;
    error: boolean;
}

interface UseImagePreloaderOptions {
    timeout?: number; // Timeout for each image in ms
    priority?: boolean; // Whether to preload immediately or defer
}

export const useImagePreloader = (
    imageSources: string[], 
    options: UseImagePreloaderOptions = {}
) => {
    const { timeout = 5000, priority = false } = options;
    const [preloadedImages, setPreloadedImages] = useState<PreloadedImage[]>([]);
    const [allLoaded, setAllLoaded] = useState(false);
    const [loadedCount, setLoadedCount] = useState(0);

    const preloadImage = useCallback((src: string): Promise<PreloadedImage> => {
        return new Promise((resolve) => {
            const img = new Image();
            const timeoutId = setTimeout(() => {
                resolve({ src, loaded: false, error: true });
            }, timeout);

            img.onload = () => {
                clearTimeout(timeoutId);
                resolve({ src, loaded: true, error: false });
            };

            img.onerror = () => {
                clearTimeout(timeoutId);
                resolve({ src, loaded: false, error: true });
            };

            img.src = src;
        });
    }, [timeout]);

    const preloadImages = useCallback(async () => {
        if (imageSources.length === 0) return;

        setPreloadedImages(imageSources.map(src => ({ src, loaded: false, error: false })));

        // Preload images in batches to avoid overwhelming the browser
        const batchSize = 3;
        const results: PreloadedImage[] = [];

        for (let i = 0; i < imageSources.length; i += batchSize) {
            const batch = imageSources.slice(i, i + batchSize);
            const batchResults = await Promise.all(batch.map(preloadImage));
            results.push(...batchResults);
            
            // Update state with current progress
            setPreloadedImages(prev => {
                const updated = [...prev];
                batchResults.forEach(result => {
                    const index = updated.findIndex(item => item.src === result.src);
                    if (index !== -1) {
                        updated[index] = result;
                    }
                });
                return updated;
            });

            setLoadedCount(results.filter(r => r.loaded).length);
        }

        setAllLoaded(true);
    }, [imageSources, preloadImage]);

    useEffect(() => {
        if (priority) {
            // Preload immediately
            preloadImages();
        } else {
            // Defer preloading to avoid blocking initial page load
            const timeoutId = setTimeout(preloadImages, 100);
            return () => clearTimeout(timeoutId);
        }
    }, [preloadImages, priority]);

    const getImageStatus = useCallback((src: string) => {
        return preloadedImages.find(img => img.src === src) || { src, loaded: false, error: false };
    }, [preloadedImages]);

    const loadedPercentage = imageSources.length > 0 ? (loadedCount / imageSources.length) * 100 : 0;

    return {
        preloadedImages,
        allLoaded,
        loadedCount,
        loadedPercentage,
        getImageStatus
    };
}; 