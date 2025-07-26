import React, { useState, useRef, useEffect, useCallback } from 'react';

interface OptimizedImageProps {
    src: string;
    alt: string;
    className?: string;
    width?: number;
    height?: number;
    priority?: boolean; // For above-the-fold images
    placeholder?: 'blur' | 'skeleton' | 'none';
    blurDataURL?: string;
    onLoad?: () => void;
    onError?: () => void;
    onClick?: () => void;
    fallbackSrc?: string;
    lazy?: boolean;
    quality?: number;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
    src,
    alt,
    className = '',
    width,
    height,
    priority = false,
    placeholder = 'skeleton',
    blurDataURL,
    onLoad,
    onError,
    onClick,
    fallbackSrc,
    lazy = true,
    quality = 75
}) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isInView, setIsInView] = useState(!lazy || priority);
    const [hasError, setHasError] = useState(false);
    const [currentSrc, setCurrentSrc] = useState<string>('');
    const imgRef = useRef<HTMLImageElement>(null);
    const observerRef = useRef<IntersectionObserver | null>(null);

    // Generate optimized image URLs (in a real app, you'd use a service like Cloudinary, Vercel, or Next.js Image)
    const getOptimizedSrc = useCallback((originalSrc: string, w?: number, q: number = quality) => {
        // For now, return original src - in production you'd transform this
        // Example: return `${originalSrc}?w=${w}&q=${q}&f=webp`
        return originalSrc;
    }, [quality]);

    // Set up intersection observer for lazy loading
    useEffect(() => {
        if (!lazy || priority || isInView) return;

        observerRef.current = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true);
                    observerRef.current?.disconnect();
                }
            },
            {
                rootMargin: '50px', // Start loading 50px before element comes into view
                threshold: 0.1
            }
        );

        if (imgRef.current) {
            observerRef.current.observe(imgRef.current);
        }

        return () => observerRef.current?.disconnect();
    }, [lazy, priority, isInView]);

    // Set source when in view
    useEffect(() => {
        if (isInView && !currentSrc) {
            setCurrentSrc(getOptimizedSrc(src, width));
        }
    }, [isInView, src, width, getOptimizedSrc, currentSrc]);

    // Preload critical images
    useEffect(() => {
        if (priority && src) {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = getOptimizedSrc(src, width);
            document.head.appendChild(link);

            return () => {
                document.head.removeChild(link);
            };
        }
    }, [priority, src, width, getOptimizedSrc]);

    const handleLoad = useCallback(() => {
        setIsLoaded(true);
        onLoad?.();
    }, [onLoad]);

    const handleError = useCallback(() => {
        setHasError(true);
        if (fallbackSrc && currentSrc !== fallbackSrc) {
            setCurrentSrc(fallbackSrc);
            setHasError(false);
        } else {
            onError?.();
        }
    }, [fallbackSrc, currentSrc, onError]);

    // Skeleton loader
    const SkeletonLoader = () => (
        <div className={`bg-gray-200 animate-pulse ${className}`} style={{ width, height }}>
            <div className="w-full h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer"></div>
        </div>
    );

    // Blur placeholder
    const BlurPlaceholder = () => (
        <div 
            className={`transition-opacity duration-300 ${isLoaded ? 'opacity-0' : 'opacity-100'} ${className}`}
            style={{
                backgroundImage: blurDataURL ? `url(${blurDataURL})` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'blur(8px)',
                width,
                height
            }}
        />
    );

    // Don't render anything if not in view and lazy loading
    if (!isInView && lazy && !priority) {
        return (
            <div 
                ref={imgRef}
                className={className}
                style={{ width, height }}
            >
                {placeholder === 'skeleton' && <SkeletonLoader />}
                {placeholder === 'blur' && blurDataURL && <BlurPlaceholder />}
            </div>
        );
    }

    return (
        <div className={`relative overflow-hidden ${className.includes('absolute') ? '' : ''}`} style={{ width, height }}>
            {/* Placeholder */}
            {!isLoaded && placeholder !== 'none' && (
                <div className={`${className.includes('absolute') ? className : 'absolute inset-0'}`}>
                    {placeholder === 'skeleton' && <SkeletonLoader />}
                    {placeholder === 'blur' && blurDataURL && <BlurPlaceholder />}
                </div>
            )}

            {/* Main image */}
            {currentSrc && (
                <img
                    ref={imgRef}
                    src={currentSrc}
                    alt={alt}
                    className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'} ${className}`}
                    style={{ width, height }}
                    onLoad={handleLoad}
                    onError={handleError}
                    onClick={onClick}
                    loading={priority ? 'eager' : 'lazy'}
                    decoding="async"
                />
            )}

            {/* Error state */}
            {hasError && !fallbackSrc && (
                <div className={`flex items-center justify-center bg-gray-100 text-gray-400 ${className.includes('absolute') ? className : 'absolute inset-0'}`} style={{ width, height }}>
                    <div className="text-center">
                        <svg className="w-8 h-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                        </svg>
                        <p className="text-xs">Failed to load</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OptimizedImage; 