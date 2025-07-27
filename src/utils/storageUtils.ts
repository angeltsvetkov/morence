import { getStorage, ref, deleteObject, getDownloadURL, uploadBytes } from 'firebase/storage';

const storage = getStorage();

/**
 * Generate a storage path for apartment photos
 */
export const getApartmentPhotoPath = (apartmentId: string, fileName: string): string => {
    const timestamp = Date.now();
    const timestampedFileName = `${timestamp}_${fileName}`;
    return `apartments/${apartmentId}/photos/${timestampedFileName}`;
};

/**
 * Generate a temporary storage path for new apartment photos
 */
export const getTempApartmentPhotoPath = (tempSlug: string, fileName: string): string => {
    const timestamp = Date.now();
    const timestampedFileName = `${timestamp}_${fileName}`;
    return `apartments/temp/${tempSlug}/photos/${timestampedFileName}`;
};

/**
 * Move photos from temporary folder to final apartment folder
 * This is useful when creating a new apartment and getting the final apartment ID
 */
export const movePhotosToApartmentFolder = async (
    tempPhotoUrls: string[], 
    apartmentId: string
): Promise<string[]> => {
    const movedUrls: string[] = [];
    
    for (const tempUrl of tempPhotoUrls) {
        try {
            // Extract file name from the temp URL
            const urlParts = tempUrl.split('/');
            const fileName = urlParts[urlParts.length - 1].split('?')[0]; // Remove query parameters
            
            // Download the file from temp location
            const response = await fetch(tempUrl);
            const blob = await response.blob();
            
            // Upload to final location
            const finalPath = getApartmentPhotoPath(apartmentId, fileName.replace(/^\d+_/, '')); // Remove timestamp prefix
            const finalRef = ref(storage, finalPath);
            await uploadBytes(finalRef, blob);
            const finalUrl = await getDownloadURL(finalRef);
            
            movedUrls.push(finalUrl);
            
            // TODO: Delete from temp location (requires additional permissions)
            // This could be done by a cloud function or admin script
            
        } catch (error) {
            console.error('Error moving photo to final location:', error);
            // Keep the original URL if move fails
            movedUrls.push(tempUrl);
        }
    }
    
    return movedUrls;
};

/**
 * Delete photos from storage
 */
export const deleteApartmentPhotos = async (photoUrls: string[]): Promise<void> => {
    const deletePromises = photoUrls.map(async (url) => {
        try {
            // Extract storage path from URL
            const urlParts = url.split('/o/')[1]?.split('?')[0];
            if (urlParts) {
                const filePath = decodeURIComponent(urlParts);
                const fileRef = ref(storage, filePath);
                await deleteObject(fileRef);
            }
        } catch (error) {
            console.error('Error deleting photo:', error);
        }
    });
    
    await Promise.all(deletePromises);
};

/**
 * Generate a unique filename to prevent conflicts
 */
export const generateUniqueFileName = (originalName: string): string => {
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const extension = originalName.split('.').pop();
    const nameWithoutExtension = originalName.replace(/\.[^/.]+$/, '');
    
    return `${timestamp}_${nameWithoutExtension}_${randomSuffix}.${extension}`;
};

/**
 * Get the apartment ID from a photo URL stored in the correct folder structure
 */
export const getApartmentIdFromPhotoUrl = (photoUrl: string): string | null => {
    try {
        const urlParts = photoUrl.split('/o/')[1]?.split('/');
        if (urlParts && urlParts[0] === 'apartments' && urlParts[1] !== 'temp') {
            return urlParts[1]; // This should be the apartment ID
        }
        return null;
    } catch (error) {
        console.error('Error extracting apartment ID from URL:', error);
        return null;
    }
}; 