import { Apartment } from '../../../types';

type GalleryItem = {
    id: string;
    url: string;
    file?: File;
};

export interface TabProps {
    currentApartmentData: Partial<Apartment>;
    setCurrentApartmentData: React.Dispatch<React.SetStateAction<Partial<Apartment>>>;
    formLanguage: 'bg' | 'en';
    setFormLanguage: (lang: 'bg' | 'en') => void;
    loading?: boolean;
}

export interface GalleryTabProps extends TabProps {
    galleryItems: GalleryItem[];
    setGalleryItems: React.Dispatch<React.SetStateAction<GalleryItem[]>>;
}

export interface ApartmentShareTabProps {
    slug?: string;
    handleShare: () => void;
    handleCopyUrl: () => void;
} 