import heic2any from 'heic2any';
import { createHeicTestReport } from './debugHeic';

/**
 * Convert PNG blob to JPEG using canvas (fallback method)
 */
const convertPngToJpeg = async (pngBlob: Blob): Promise<Blob> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
            reject(new Error('Canvas context not available'));
            return;
        }
        
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            
            // Fill with white background for JPEG
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw the image
            ctx.drawImage(img, 0, 0);
            
            // Convert to JPEG blob
            canvas.toBlob((jpegBlob) => {
                if (jpegBlob) {
                    resolve(jpegBlob);
                } else {
                    reject(new Error('Failed to convert PNG to JPEG'));
                }
            }, 'image/jpeg', 0.8);
        };
        
        img.onerror = () => {
            reject(new Error('Failed to load PNG image'));
        };
        
        img.src = URL.createObjectURL(pngBlob);
    });
};

export interface ConvertedImage {
    file: File;
    originalName: string;
    wasConverted: boolean;
}

/**
 * Check if a file is a HEIC image
 */
export const isHEICFile = (file: File): boolean => {
    const heicMimeTypes = ['image/heic', 'image/heif'];
    const heicExtensions = ['.heic', '.heif'];
    
    // Check MIME type
    if (heicMimeTypes.includes(file.type.toLowerCase())) {
        return true;
    }
    
    // Check file extension as fallback
    const fileName = file.name.toLowerCase();
    return heicExtensions.some(ext => fileName.endsWith(ext));
};

/**
 * Convert HEIC image to JPEG
 */
export const convertHEICToJPEG = async (file: File): Promise<ConvertedImage> => {
    console.log(`Starting HEIC conversion for: ${file.name}, size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`);
    
    // Generate debug report for problematic files
    const debugReport = await createHeicTestReport(file);
    console.log('HEIC Debug Report:', debugReport);
    
    try {
        // Check file size (limit to 50MB to prevent memory issues)
        const maxSize = 50 * 1024 * 1024; // 50MB
        if (file.size > maxSize) {
            throw new Error(`File too large: ${(file.size / (1024 * 1024)).toFixed(2)}MB. Maximum size is 50MB.`);
        }

        // Validate file is actually a blob
        if (!(file instanceof Blob)) {
            throw new Error('Invalid file object provided');
        }

        console.log('Calling heic2any...');
        
        // Try conversion with multiple strategies
        let convertedBlob: Blob;
        
        try {
            // First attempt with standard settings
            convertedBlob = await heic2any({
                blob: file,
                toType: 'image/jpeg',
                quality: 0.8,
            }) as Blob;
        } catch (firstError) {
            console.warn('First conversion attempt failed, trying with different settings:', firstError);
            
            try {
                // Second attempt with lower quality
                convertedBlob = await heic2any({
                    blob: file,
                    toType: 'image/jpeg',
                    quality: 0.6,
                }) as Blob;
                console.log('Second attempt succeeded with lower quality');
            } catch (secondError) {
                console.warn('Second conversion attempt failed, trying PNG format:', secondError);
                
                try {
                    // Third attempt with PNG format
                    const pngBlob = await heic2any({
                        blob: file,
                        toType: 'image/png',
                    }) as Blob;
                    
                    // Convert PNG to JPEG using canvas for better compatibility
                    convertedBlob = await convertPngToJpeg(pngBlob);
                    console.log('Third attempt succeeded via PNG conversion');
                } catch (thirdError) {
                    console.error('All conversion attempts failed:', { firstError, secondError, thirdError });
                    throw firstError; // Throw the original error
                }
            }
        }

        console.log(`Conversion successful. Original: ${(file.size / 1024).toFixed(1)}KB, Converted: ${(convertedBlob.size / 1024).toFixed(1)}KB`);

        // Validate the converted blob
        if (!convertedBlob || convertedBlob.size === 0) {
            throw new Error('Conversion produced empty result');
        }

        // Create new file from converted blob
        const originalName = file.name;
        const nameWithoutExtension = originalName.replace(/\.(heic|heif)$/i, '');
        const convertedFileName = `${nameWithoutExtension}.jpg`;
        
        const convertedFile = new File(
            [convertedBlob],
            convertedFileName,
            {
                type: 'image/jpeg',
                lastModified: Date.now(),
            }
        );

        return {
            file: convertedFile,
            originalName,
            wasConverted: true,
        };
    } catch (error) {
        console.error('Error converting HEIC file:', {
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            error: error
        });
        
                 // Provide more specific error messages
        let errorMessage = `Failed to convert HEIC image: ${file.name}`;
        
        if (error instanceof Error) {
            if (error.message.includes('File too large')) {
                errorMessage = `${file.name} is too large (${(file.size / (1024 * 1024)).toFixed(2)}MB). Maximum size is 50MB.`;
            } else if (error.message.includes('not supported') || error.message.includes('Invalid')) {
                errorMessage = `${file.name} appears to be corrupted or is not a valid HEIC file.`;
            } else if (error.message.includes('memory') || error.message.includes('Memory')) {
                errorMessage = `Not enough memory to convert ${file.name}. Try uploading smaller images.`;
            } else if (error.message.includes('decode') || error.message.includes('codec')) {
                errorMessage = `${file.name} uses an unsupported HEIC variant. Try re-saving the image or using a different photo.`;
            } else if (error.message.includes('network') || error.message.includes('fetch')) {
                errorMessage = `Network error while processing ${file.name}. Please check your internet connection.`;
            } else {
                errorMessage = `Failed to convert ${file.name}: ${error.message}. The file may be corrupted or use an unsupported HEIC format.`;
            }
        }
        
        throw new Error(errorMessage);
    }
};

/**
 * Process image file - convert HEIC if needed, otherwise return as-is
 */
export const processImageFile = async (file: File): Promise<ConvertedImage> => {
    if (isHEICFile(file)) {
        return await convertHEICToJPEG(file);
    }
    
    return {
        file,
        originalName: file.name,
        wasConverted: false,
    };
};

/**
 * Process multiple image files with individual error handling
 */
export const processImageFiles = async (files: File[]): Promise<{
    successful: ConvertedImage[];
    failed: Array<{ file: File; error: string }>;
}> => {
    const successful: ConvertedImage[] = [];
    const failed: Array<{ file: File; error: string }> = [];
    
    for (const file of files) {
        try {
            const processed = await processImageFile(file);
            successful.push(processed);
        } catch (error) {
            console.error(`Failed to process file ${file.name}:`, error);
            failed.push({
                file,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            });
        }
    }
    
    return { successful, failed };
};

/**
 * Get supported image file extensions for file input accept attribute
 */
export const getSupportedImageTypes = (): string => {
    return 'image/*,.heic,.heif';
};

/**
 * Validate if file is a supported image type
 */
export const isSupportedImageFile = (file: File): boolean => {
    const supportedTypes = [
        'image/jpeg',
        'image/jpg', 
        'image/png',
        'image/gif',
        'image/webp',
        'image/bmp',
        'image/svg+xml',
        'image/heic',
        'image/heif'
    ];
    
    const supportedExtensions = [
        '.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg', '.heic', '.heif'
    ];
    
    // Check MIME type
    if (supportedTypes.includes(file.type.toLowerCase())) {
        return true;
    }
    
    // Check file extension as fallback
    const fileName = file.name.toLowerCase();
    return supportedExtensions.some(ext => fileName.endsWith(ext));
}; 