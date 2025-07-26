import React, { useState, useEffect, useRef } from 'react';

interface HeroImageProps {
    src: string;
    alt: string;
    className?: string;
    onLoad?: () => void;
}

const HeroImage: React.FC<HeroImageProps> = ({ src, alt, className = '', onLoad }) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        if (!src) return;

        const img = new Image();
        img.onload = () => {
            setIsLoaded(true);
            onLoad?.();
        };
        img.onerror = () => {
            setHasError(true);
        };
        img.src = src;

        // Preload the image
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = src;
        document.head.appendChild(link);

        return () => {
            try {
                document.head.removeChild(link);
            } catch (e) {
                // Link might already be removed
            }
        };
    }, [src, onLoad]);

    if (hasError) {
        return (
            <div className={`bg-gray-300 flex items-center justify-center ${className}`}>
                <div className="text-gray-500 text-center">
                    <div className="text-2xl mb-2">📷</div>
                    <p>Image failed to load</p>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Background fallback (shows immediately) */}
            <div 
                className={`${className} transition-opacity duration-500 ${isLoaded ? 'opacity-0' : 'opacity-100'}`}
                style={{ 
                    backgroundImage: `url(${src})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    filter: 'blur(2px)',
                    transform: 'scale(1.05)' // Slightly larger to hide blur edges
                }}
            />
            
            {/* High-quality image (fades in when loaded) */}
            {isLoaded && (
                <img
                    ref={imgRef}
                    src={src}
                    alt={alt}
                    className={`${className} transition-opacity duration-500 opacity-100`}
                    style={{ objectFit: 'cover' }}
                    loading="eager"
                    decoding="async"
                />
            )}
            
            {/* Loading state */}
            {!isLoaded && !hasError && (
                <div className={`${className} bg-gray-200 animate-pulse flex items-center justify-center`}>
                    <div className="text-gray-400">
                        <div className="w-12 h-12 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin mx-auto mb-4"></div>
                        <p>Loading...</p>
                    </div>
                </div>
            )}
        </>
    );
};

export default HeroImage; 