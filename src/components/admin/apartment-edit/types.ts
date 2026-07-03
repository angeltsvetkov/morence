import { Apartment } from '../../../types';

type GalleryItem = {
    id: string;
    url: string;
    file?: File;
};

export type BrochurePlaceItem = {
    id: string;
    image?: string;    // uploaded URL
    imageFile?: File;  // pending upload
    name: { bg: string; en: string };
    description?: { bg: string; en: string };
    mapsUrl?: string;
    phone?: string;
    workingHours?: { [day: string]: { open: string; close: string } | null };
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

export interface BrochureTabProps extends TabProps {
    brochureItems: BrochurePlaceItem[];
    setBrochureItems: React.Dispatch<React.SetStateAction<BrochurePlaceItem[]>>;
    slug?: string;
}

export interface ApartmentShareTabProps {
    slug?: string;
    handleShare: () => void;
    handleCopyUrl: () => void;
} 