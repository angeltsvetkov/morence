import { Apartment } from '../../../types';

type GalleryItem = {
    id: string;
    url: string;
    file?: File;
};

export type BrochureGalleryItem = {
    id: string;
    url: string;
    title?: string;
    places?: { name: string; mapsUrl: string; phone?: string; workingHours?: { [day: string]: { open: string; close: string } | null } }[];
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

export interface BrochureTabProps extends TabProps {
    brochureItems: { bg: BrochureGalleryItem[]; en: BrochureGalleryItem[] };
    setBrochureItems: React.Dispatch<React.SetStateAction<{ bg: BrochureGalleryItem[]; en: BrochureGalleryItem[] }>>;
    slug?: string;
}

export interface ApartmentShareTabProps {
    slug?: string;
    handleShare: () => void;
    handleCopyUrl: () => void;
} 