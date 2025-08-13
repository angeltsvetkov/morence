import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { useLanguage } from '../hooks/useLanguage';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS, bg } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Booking, PricingOffer } from '../types';
import BookingModal from '../components/BookingModal';
import ImageGallery from 'react-image-gallery';
import "react-image-gallery/styles/css/image-gallery.css";
import { Language } from '../contexts/LanguageContext';
import {
    Link as LinkIcon, MapPin, Milestone, CreditCard, Star, ChevronDown,
    Wifi, Snowflake, Thermometer, ChefHat, RefrigeratorIcon, Zap,
    FlameKindling, Car, Tv, WashingMachine, Wind, Utensils,
    Trees, Flame, Waves, Mountain, Heart, Ban, Baby,
    ArrowUp, Home, Bath, CloudRain, Droplets, Plus,
    Shield, Lock, Package, Building, Coffee, Microwave,
    AirVent, Sofa, Bed, Shirt, Sparkles, Sun, UserCheck,
    Flower, Camera, Music, Gamepad2, Dumbbell,
    WifiOff, TreePine, Palmtree, Users, Accessibility, Check,
    Laptop, Smartphone, Headphones, Speaker, Router, Monitor,
    Armchair, Lamp, Fan, Clock, Phone, Mail,
    Cigarette, Wine, BookOpen, Newspaper, Globe,
    Stethoscope, Activity, Bike, Bus, Train, Plane, Ship, Fuel,
    Briefcase, Printer, FileText, Calculator,
    Umbrella, Glasses, Watch, Key, Bell, AlertTriangle,
    Dog, Cat, Fish, Bird, Store, ShoppingBag, Gift, Award,
    Cloud, CloudSnow, CloudLightning, Sunrise, Sandwich, Apple
} from 'lucide-react';
import { formatPrice } from '../lib/utils';
import { Amenity } from '../types';
import SocialMetaTags from '../components/SocialMetaTags';
import TestimonialsCarousel from '../components/TestimonialsCarousel';
import OptimizedImage from '../components/ui/optimized-image';

const locales = {
    'en': enUS,
    'bg': bg,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

// Available icons for amenities (same as in admin)
const AVAILABLE_ICONS = [
    { id: 'wifi', name: 'Wi-Fi', icon: Wifi },
    { id: 'air-conditioning', name: 'Air Conditioning', icon: Snowflake },
    { id: 'heating', name: 'Heating', icon: Thermometer },
    { id: 'kitchen', name: 'Kitchen', icon: ChefHat },
    { id: 'refrigerator', name: 'Refrigerator', icon: RefrigeratorIcon },
    { id: 'microwave', name: 'Microwave', icon: Microwave },
    { id: 'oven', name: 'Oven', icon: FlameKindling },
    { id: 'stovetop', name: 'Stovetop', icon: Zap },
    { id: 'dishwasher', name: 'Dishwasher', icon: Utensils },
    { id: 'coffee-maker', name: 'Coffee Maker', icon: Coffee },
    { id: 'balcony', name: 'Balcony', icon: Home },
    { id: 'terrace', name: 'Terrace', icon: Sun },
    { id: 'parking', name: 'Parking', icon: Car },
    { id: 'tv', name: 'TV', icon: Tv },
    { id: 'washing-machine', name: 'Washing Machine', icon: WashingMachine },
    { id: 'hair-dryer', name: 'Hair Dryer', icon: Wind },
    { id: 'iron', name: 'Iron', icon: Shirt },
    { id: 'bed-sheets', name: 'Bed Sheets', icon: Bed },
    { id: 'towels', name: 'Towels', icon: Sparkles },
    { id: 'pool-access', name: 'Pool Access', icon: Waves },
    { id: 'garden', name: 'Garden', icon: Trees },
    { id: 'bbq', name: 'BBQ', icon: Flame },
    { id: 'near-beach', name: 'Near Beach', icon: Palmtree },
    { id: 'sea-view', name: 'Sea View', icon: Mountain },
    { id: 'mountain-view', name: 'Mountain View', icon: TreePine },
    { id: 'pets-allowed', name: 'Pets Allowed', icon: Heart },
    { id: 'non-smoking', name: 'Non-smoking', icon: Ban },
    { id: 'family-friendly', name: 'Family Friendly', icon: Baby },
    { id: 'elevator', name: 'Elevator', icon: ArrowUp },
    { id: 'ground-floor', name: 'Ground Floor', icon: Building },
    { id: 'private-bathroom', name: 'Private Bathroom', icon: Bath },
    { id: 'bathtub', name: 'Bathtub', icon: Bath },
    { id: 'shower', name: 'Shower', icon: CloudRain },
    { id: 'hot-water', name: 'Hot Water', icon: Droplets },
    { id: 'first-aid-kit', name: 'First Aid Kit', icon: Plus },
    { id: 'fire-extinguisher', name: 'Fire Extinguisher', icon: Shield },
    { id: 'safe', name: 'Safe', icon: Lock },
    { id: 'luggage-storage', name: 'Luggage Storage', icon: Package },
    { id: 'accessible', name: 'Accessible', icon: Accessibility },
    { id: 'fitness', name: 'Fitness/Gym', icon: Dumbbell },
    { id: 'entertainment', name: 'Entertainment', icon: Gamepad2 },
    { id: 'music', name: 'Music System', icon: Music },
    { id: 'photo-area', name: 'Photo Area', icon: Camera },
    { id: 'relaxation', name: 'Relaxation Area', icon: Sofa },
    { id: 'outdoor-space', name: 'Outdoor Space', icon: Flower },
    { id: 'location', name: 'Prime Location', icon: MapPin },
    { id: 'host-services', name: 'Host Services', icon: UserCheck },
    { id: 'group-friendly', name: 'Group Friendly', icon: Users },
    { id: 'ventilation', name: 'Ventilation', icon: AirVent },

    // Technology & Electronics
    { id: 'laptop-workspace', name: 'Laptop Workspace', icon: Laptop },
    { id: 'smartphone-charging', name: 'Phone Charging', icon: Smartphone },
    { id: 'headphones', name: 'Headphones Available', icon: Headphones },
    { id: 'speakers', name: 'Sound System', icon: Speaker },
    { id: 'router', name: 'High-Speed Router', icon: Router },
    { id: 'monitor', name: 'External Monitor', icon: Monitor },
    { id: 'phone-landline', name: 'Landline Phone', icon: Phone },
    { id: 'email-service', name: 'Email Service', icon: Mail },

    // Furniture & Comfort
    { id: 'armchair', name: 'Comfortable Armchair', icon: Armchair },
    { id: 'desk-lamp', name: 'Desk Lamp', icon: Lamp },
    { id: 'ceiling-fan', name: 'Ceiling Fan', icon: Fan },
    { id: 'clock', name: 'Clock', icon: Clock },

    // Entertainment & Leisure
    { id: 'books', name: 'Books Available', icon: BookOpen },
    { id: 'newspapers', name: 'Newspapers', icon: Newspaper },
    { id: 'local-info', name: 'Local Information', icon: Globe },
    { id: 'wine-glasses', name: 'Wine Service', icon: Wine },

    // Health & Wellness
    { id: 'first-aid-advanced', name: 'Medical Kit', icon: Stethoscope },
    { id: 'exercise-area', name: 'Exercise Area', icon: Activity },
    { id: 'bike-rental', name: 'Bike Rental', icon: Bike },

    // Transportation
    { id: 'bus-stop', name: 'Near Bus Stop', icon: Bus },
    { id: 'train-station', name: 'Near Train Station', icon: Train },
    { id: 'airport-shuttle', name: 'Airport Shuttle', icon: Plane },
    { id: 'boat-trips', name: 'Boat Trips', icon: Ship },
    { id: 'fuel-station', name: 'Near Fuel Station', icon: Fuel },

    // Business & Work
    { id: 'business-center', name: 'Business Center', icon: Briefcase },
    { id: 'booking-service', name: 'Booking Service', icon: Briefcase },
    { id: 'printer-access', name: 'Printer Access', icon: Printer },
    { id: 'documents', name: 'Document Service', icon: FileText },
    { id: 'calculator', name: 'Calculator', icon: Calculator },

    // Weather & Safety
    { id: 'umbrella', name: 'Umbrella Available', icon: Umbrella },
    { id: 'sunglasses', name: 'Sunglasses', icon: Glasses },
    { id: 'watch-service', name: 'Time Service', icon: Watch },
    { id: 'keys-service', name: 'Key Service', icon: Key },
    { id: 'bell-service', name: 'Bell Service', icon: Bell },
    { id: 'emergency', name: 'Emergency Info', icon: AlertTriangle },
    { id: 'weather-info', name: 'Weather Information', icon: Cloud },
    { id: 'winter-amenities', name: 'Winter Amenities', icon: CloudSnow },
    { id: 'storm-shelter', name: 'Storm Shelter', icon: CloudLightning },
    { id: 'sunrise-view', name: 'Sunrise View', icon: Sunrise },

    // Pet Services
    { id: 'dog-friendly', name: 'Dog Friendly', icon: Dog },
    { id: 'cat-friendly', name: 'Cat Friendly', icon: Cat },
    { id: 'fish-watching', name: 'Fish Watching', icon: Fish },
    { id: 'bird-watching', name: 'Bird Watching', icon: Bird },

    // Shopping & Services
    { id: 'nearby-shops', name: 'Nearby Shops', icon: Store },
    { id: 'shopping-assistance', name: 'Shopping Service', icon: ShoppingBag },
    { id: 'gift-service', name: 'Gift Service', icon: Gift },
    { id: 'rated-service', name: 'Rated Service', icon: Star },
    { id: 'award-winning', name: 'Award Winning', icon: Award },

    // Food & Dining
    { id: 'snacks', name: 'Snacks Available', icon: Sandwich },
    { id: 'fresh-fruit', name: 'Fresh Fruit', icon: Apple },
    { id: 'smoking-area', name: 'Smoking Area', icon: Cigarette }
];

interface Apartment {
    id: string;
    name: { [key in Language]?: string };
    description: { [key: string]: string };
    floor?: number;
    minimumNights?: number; // Minimum number of nights for booking
    amenities: string[];
    amenityOrder?: string[]; // Custom order for amenities display
    photos: string[];
    pricing: {
        perNight: { [key in Language]?: number };
        perWeek?: number;
        perMonth?: number;
    };
    pricingOffers?: PricingOffer[];
    availabilityStart?: string;
    availabilityEnd?: string;
    slug: string;
    contactPhone?: string;
    contactEmail?: string;
    contacts?: {
        [key in Language]?: {
            name: string;
            phone?: string;
        }
    };
    heroImage?: string;
    favouriteImages?: string[];
    hideName?: boolean; // Whether to hide the apartment name on the public page
    hideNameOnPublicPage?: boolean; // Whether to hide the apartment name on the public page
    smokingAllowed?: boolean; // Whether smoking is allowed in this apartment
    maxGuests?: number; // Maximum number of guests allowed
}

interface Place {
    id: string;
    title: { [key in Language]?: string };
    description: { [key in Language]?: string };
    imageUrl: string;
    url?: string;
    distance?: number;
    location?: string;
}

const ApartmentDetail: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const { language, t } = useLanguage();
    const [apartment, setApartment] = useState<Apartment | null>(null);
    const [places, setPlaces] = useState<Place[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [currentHeroImage, setCurrentHeroImage] = useState<string>('');
    const [showHeader, setShowHeader] = useState(false);
    const [availableAmenities, setAvailableAmenities] = useState<Amenity[]>([]);
    const [showLightbox, setShowLightbox] = useState(false);
    const [lightboxStartIndex, setLightboxStartIndex] = useState(0);

    const apartmentName = useMemo(() => {
        if (!apartment) return '';
        return apartment.name?.[language] || apartment.name?.en || apartment.name?.bg || 'Unknown Apartment';
    }, [apartment, language]);

    // Helper function to open lightbox with specific image
    const openLightbox = (imageIndex: number) => {
        setLightboxStartIndex(imageIndex);
        setShowLightbox(true);
    };

    // Helper function to render amenity icon
    const renderAmenityIcon = (amenity: string) => {
        // First try to find icon from Firebase amenities
        const amenityData = availableAmenities.find(a => a.en === amenity || a.bg === amenity || a.id === amenity);
        if (amenityData?.icon) {
            const iconData = AVAILABLE_ICONS.find(icon => icon.id === amenityData.icon);
            if (iconData) {
                const IconComponent = iconData.icon;
                return <IconComponent className="w-6 h-6 text-blue-600" />;
            }
        }

        // Fallback: try to match by name
        const fallbackIcon = AVAILABLE_ICONS.find(icon =>
            icon.name.toLowerCase() === amenity.toLowerCase() ||
            amenity.toLowerCase().includes(icon.id)
        );
        if (fallbackIcon) {
            const IconComponent = fallbackIcon.icon;
            return <IconComponent className="w-6 h-6 text-blue-600" />;
        }

        // Default checkmark if no icon found
        return <Check className="w-6 h-6 text-green-500" />;
    };

    // Helper function to get amenities in the correct order
    const getApartmentAmenities = (apartment: Apartment | null): string[] => {
        if (!apartment) return [];
        
        const amenities = apartment.amenities || [];
        const customOrder = apartment.amenityOrder;
        
        // If there's a custom order, use it
        if (customOrder && customOrder.length > 0) {
            // Start with the custom ordered amenities
            const orderedAmenities = customOrder.filter(amenity => amenities.includes(amenity));
            // Add any amenities that are not in the custom order at the end
            const unorderedAmenities = amenities.filter(amenity => !customOrder.includes(amenity));
            return [...orderedAmenities, ...unorderedAmenities];
        }
        
        // Fallback to original order
        return amenities;
    };

    // Helper function to check if pets are allowed
    const arePetsAllowed = (): boolean => {
        if (!apartment) return false;
        const apartmentAmenities = getApartmentAmenities(apartment);
        return apartmentAmenities.some(amenity =>
            amenity === 'Pets Allowed' ||
            amenity === 'pets-allowed' ||
            amenity === 'Домашни любимци разрешени'
        );
    };

    // Helper function to check if smoking is allowed
    const isSmokingAllowed = (): boolean => {
        if (!apartment) return false;
        // Use the dedicated smoking policy field if available
        if (apartment.smokingAllowed !== undefined) {
            return apartment.smokingAllowed;
        }
        // Fallback to amenities-based logic for backwards compatibility
        const apartmentAmenities = getApartmentAmenities(apartment);
        // Check for smoking area amenity (indicates smoking is allowed in designated area)
        const hasSmokingArea = apartmentAmenities.some(amenity =>
            amenity === 'Smoking Area' ||
            amenity === 'smoking-area'
        );
        // Check for non-smoking amenity (indicates smoking is not allowed)
        const isNonSmoking = apartmentAmenities.some(amenity =>
            amenity === 'Non-smoking' ||
            amenity === 'non-smoking' ||
            amenity === 'Непушачи'
        );
        // If it's explicitly non-smoking, return false
        // If there's a smoking area, return true
        // Default is false (no smoking) for safety
        return hasSmokingArea && !isNonSmoking;
    };

    // Helper function to get ordinal suffix for numbers (1st, 2nd, 3rd, etc.)
    const getOrdinalSuffix = (num: number): string => {
        const j = num % 10;
        const k = num % 100;
        if (j === 1 && k !== 11) return 'st';
        if (j === 2 && k !== 12) return 'nd';
        if (j === 3 && k !== 13) return 'rd';
        return 'th';
    };

    // Helper function to get owner phone number
    const getOwnerPhone = (): string | null => {
        if (!apartment?.contacts) return null;

        // Try current language first, then fallback to other languages
        const currentLangContact = apartment.contacts[language];
        if (currentLangContact?.phone) {
            return currentLangContact.phone;
        }

        // Fallback to any available phone number
        const allContacts = Object.values(apartment.contacts);
        for (const contact of allContacts) {
            if (contact?.phone) {
                return contact.phone;
            }
        }

        return null;
    };

    // Helper function to get owner/contact name
    const getContactName = (): string | null => {
        if (!apartment?.contacts) return null;

        // Try current language first, then fallback to other languages
        const currentLangContact = apartment.contacts[language];
        if (currentLangContact?.name) {
            return currentLangContact.name;
        }

        // Fallback to any available contact name
        const allContacts = Object.values(apartment.contacts);
        for (const contact of allContacts) {
            if (contact?.name) {
                return contact.name;
            }
        }

        return null;
    };

    // Helper function to initiate call
    const handleCallOwner = () => {
        if (apartment?.contactPhone) {
            // Clean the phone number and create tel: link
            const cleanPhone = apartment.contactPhone.replace(/[^\d+]/g, '');
            window.location.href = `tel:${cleanPhone}`;
        }
    };

    // Helper function to translate amenity names
    const getAmenityTranslation = (amenity: string): string => {
        // First try to find the amenity in the available amenities list from Firebase
        const availableAmenity = availableAmenities.find(a => a.en === amenity || a.bg === amenity || a.id === amenity);
        if (availableAmenity) {
            return language === 'bg' ? availableAmenity.bg : availableAmenity.en;
        }

        // Fallback to hardcoded translations for backward compatibility
        const amenityTranslations: Record<string, { en: string; bg: string }> = {
            'Wi-Fi': { en: 'Wi-Fi', bg: 'Wi-Fi' },
            'Air Conditioning': { en: 'Air Conditioning', bg: 'Климатик' },
            'Heating': { en: 'Heating', bg: 'Отопление' },
            'Kitchen': { en: 'Kitchen', bg: 'Кухня' },
            'Refrigerator': { en: 'Refrigerator', bg: 'Хладилник' },
            'Microwave': { en: 'Microwave', bg: 'Микровълнова' },
            'Oven': { en: 'Oven', bg: 'Фурна' },
            'Stovetop': { en: 'Stovetop', bg: 'Котлони' },
            'Dishwasher': { en: 'Dishwasher', bg: 'Съдомиялна' },
            'Coffee Maker': { en: 'Coffee Maker', bg: 'Кафемашина' },
            'Balcony': { en: 'Balcony', bg: 'Балкон' },
            'Terrace': { en: 'Terrace', bg: 'Тераса' },
            'Parking': { en: 'Parking', bg: 'Паркинг' },
            'Free Parking': { en: 'Free Parking', bg: 'Безплатен паркинг' },
            'TV': { en: 'TV', bg: 'Телевизор' },
            'Cable TV': { en: 'Cable TV', bg: 'Кабелна телевизия' },
            'Smart TV': { en: 'Smart TV', bg: 'Смарт телевизор' },
            'Washing Machine': { en: 'Washing Machine', bg: 'Пералня' },
            'Hair Dryer': { en: 'Hair Dryer', bg: 'Сешоар' },
            'Iron': { en: 'Iron', bg: 'Ютия' },
            'Bed Sheets': { en: 'Bed Sheets', bg: 'Спално бельо' },
            'Towels': { en: 'Towels', bg: 'Хавлии' },
            'Pool Access': { en: 'Pool Access', bg: 'Достъп до басейн' },
            'Garden': { en: 'Garden', bg: 'Градина' },
            'BBQ': { en: 'BBQ', bg: 'Барбекю' },
            'Near Beach': { en: 'Near Beach', bg: 'Близо до плаж' },
            'Sea View': { en: 'Sea View', bg: 'Изглед към морето' },
            'Mountain View': { en: 'Mountain View', bg: 'Планински изглед' },
            'Pets Allowed': { en: 'Pets Allowed', bg: 'Домашни любимци разрешени' },
            'Non-smoking': { en: 'Non-smoking', bg: 'Непушачи' },
            'Family Friendly': { en: 'Family Friendly', bg: 'Подходящо за семейства' },
            'Elevator': { en: 'Elevator', bg: 'Асансьор' },
            'Ground Floor': { en: 'Ground Floor', bg: 'Партер' },
            'Private Bathroom': { en: 'Private Bathroom', bg: 'Собствена баня' },
            'Bathtub': { en: 'Bathtub', bg: 'Вана' },
            'Shower': { en: 'Shower', bg: 'Душ' },
            'Hot Water': { en: 'Hot Water', bg: 'Топла вода' },
            'First Aid Kit': { en: 'First Aid Kit', bg: 'Аптечка' },
            'Fire Extinguisher': { en: 'Fire Extinguisher', bg: 'Пожарогасител' },
            'Safe': { en: 'Safe', bg: 'Сейф' },
            'Luggage Storage': { en: 'Luggage Storage', bg: 'Багажно помещение' }
        };

        if (amenityTranslations[amenity]) {
            return language === 'bg' ? amenityTranslations[amenity].bg : amenityTranslations[amenity].en;
        }

        // Return original if no translation found (for custom amenities)
        return amenity;
    };

    // Fetch amenities from Firebase
    const fetchAvailableAmenities = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "amenities"));
            const amenitiesList = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Amenity));
            setAvailableAmenities(amenitiesList);
        } catch (error) {
            console.error("Error fetching amenities: ", error);
            // Continue without amenities translations if fetch fails
        }
    };

    const slideshowImages = useMemo(() => {
        if (!apartment) return [];
        const images = new Set<string>();
        if (apartment.heroImage) {
            images.add(apartment.heroImage);
        }
        if (apartment.favouriteImages) {
            apartment.favouriteImages.forEach(img => images.add(img));
        }
        return Array.from(images);
    }, [apartment]);

    useEffect(() => {
        const fetchApartmentAndBookings = async () => {
            if (!slug) return;
            setLoading(true);
            try {
                // Fetch apartment details by slug
                const apartmentsRef = collection(db, "apartments");
                const q = query(apartmentsRef, where("slug", "==", slug));
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    const docSnap = querySnapshot.docs[0];
                    const apartmentData = { id: docSnap.id, ...docSnap.data() } as Apartment;
                    setApartment(apartmentData);
                    setCurrentHeroImage(apartmentData.heroImage || (apartmentData.photos.length > 0 ? apartmentData.photos[0] : ''));

                    // Helper function to safely convert date fields
                    const safeToDate = (dateField: any): Date => {
                        if (dateField instanceof Date) {
                            return dateField;
                        }
                        if (dateField && typeof dateField.toDate === 'function') {
                            return dateField.toDate();
                        }
                        if (typeof dateField === 'string') {
                            return new Date(dateField);
                        }
                        return new Date(); // fallback
                    };

                    // Fetch bookings from both locations (subcollection and old main collection)
                    const allBookings: Booking[] = [];

                    // Fetch from new subcollection
                    const newBookingsSnapshot = await getDocs(collection(db, `apartments/${docSnap.id}/bookings`));
                    const newBookingsData = newBookingsSnapshot.docs.map(doc => {
                        const data = doc.data();
                        return {
                            id: doc.id,
                            ...data,
                            start: safeToDate(data.start),
                            end: safeToDate(data.end),
                        } as Booking;
                    });
                    allBookings.push(...newBookingsData);

                    // Fetch from old main collection for this apartment
                    try {
                        const oldBookingsQuery = query(collection(db, "bookings"), where("apartmentId", "==", docSnap.id));
                        const oldBookingsSnapshot = await getDocs(oldBookingsQuery);
                        const oldBookingsData = oldBookingsSnapshot.docs.map(doc => {
                            const data = doc.data();
                            return {
                                id: doc.id,
                                apartmentId: docSnap.id,
                                start: safeToDate(data.start),
                                end: safeToDate(data.end),
                                title: data.title || 'Reserved',
                                ...data
                            } as Booking;
                        });
                        allBookings.push(...oldBookingsData);
                    } catch (error) {
                        console.log("No old bookings found or permission denied:", error);
                    }

                    setBookings(allBookings);
                } else {
                    console.log("No such document!");
                }

            } catch (error) {
                console.error("Error fetching data: ", error);
            } finally {
                setLoading(false);
            }
        };

        const fetchPlaces = async () => {
            const placesCollection = collection(db, 'places');
            const placesSnapshot = await getDocs(placesCollection);
            const placesList = placesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Place));
            setPlaces(placesList);
        };

        fetchApartmentAndBookings();
        fetchPlaces();
        fetchAvailableAmenities();
    }, [slug]);

    // Effect for auto-switching hero image
    useEffect(() => {
        if (slideshowImages.length <= 1) {
            return; // Don't start slideshow if there are not enough images
        }

        const timer = setTimeout(() => {
            const currentIndex = slideshowImages.indexOf(currentHeroImage);
            // If the current hero image isn't in the favourites, start from the first favourite.
            // Otherwise, go to the next one.
            const nextIndex = (currentIndex + 1) % slideshowImages.length;
            setCurrentHeroImage(slideshowImages[nextIndex]);
        }, 5000); // 5 seconds

        return () => clearTimeout(timer); // Cleanup the timer
    }, [currentHeroImage, slideshowImages]);

    // Scroll detection for header visibility
    useEffect(() => {
        let ticking = false;

        const handleScroll = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    const scrollY = window.scrollY;
                    // Show header when user scrolls down past 20% of viewport height (minimum 100px)
                    const threshold = Math.max(window.innerHeight * 0.2, 100);
                    setShowHeader(scrollY > threshold);
                    ticking = false;
                });
                ticking = true;
            }
        };

        // Add scroll event listener
        window.addEventListener('scroll', handleScroll, { passive: true });

        // Cleanup
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    // Effect to manage header visibility via CSS class
    useEffect(() => {
        const body = document.body;
        if (showHeader) {
            body.classList.add('apartment-header-visible');
            body.classList.remove('apartment-header-hidden');
        } else {
            body.classList.add('apartment-header-hidden');
            body.classList.remove('apartment-header-visible');
        }

        // Cleanup on unmount
        return () => {
            body.classList.remove('apartment-header-visible', 'apartment-header-hidden');
        };
    }, [showHeader]);

    // Set initial state on mount and ensure proper scroll position
    useEffect(() => {
        // Prevent browser scroll restoration
        if ('scrollRestoration' in history) {
            history.scrollRestoration = 'manual';
        }

        // Hide header initially when apartment page loads
        document.body.classList.add('apartment-header-hidden');

        // Multiple attempts to ensure we start at the top
        const resetScroll = () => {
            window.scrollTo(0, 0);
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;
        };

        // Reset immediately
        resetScroll();

        // Reset after a small delay to handle any async content loading
        const timeoutId = setTimeout(resetScroll, 100);

        // Reset when all content is loaded
        const handleLoad = () => resetScroll();
        window.addEventListener('load', handleLoad);

        return () => {
            clearTimeout(timeoutId);
            window.removeEventListener('load', handleLoad);
            // Clean up classes when leaving the page
            document.body.classList.remove('apartment-header-visible', 'apartment-header-hidden');
            // Restore scroll restoration
            if ('scrollRestoration' in history) {
                history.scrollRestoration = 'auto';
            }
        };
    }, []);

    // Helper function to find the nearest available date
    const findNearestAvailableDate = useCallback(() => {
        if (!apartment) return new Date();

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Check apartment's availability period
        const availabilityStart = apartment.availabilityStart ? new Date(apartment.availabilityStart) : null;
        const availabilityEnd = apartment.availabilityEnd ? new Date(apartment.availabilityEnd) : null;
        
        // Start searching from today or availability start date, whichever is later
        let searchDate = new Date(today);
        if (availabilityStart && availabilityStart > today) {
            searchDate = new Date(availabilityStart);
        }
        
        // Search for the next available date (limit search to 1 year)
        const maxSearchDate = new Date(today);
        maxSearchDate.setFullYear(maxSearchDate.getFullYear() + 1);
        
        while (searchDate <= maxSearchDate) {
            // Check if date is within availability period
            const isWithinAvailability = (!availabilityStart || searchDate >= availabilityStart) && 
                                       (!availabilityEnd || searchDate <= availabilityEnd);
            
            if (isWithinAvailability) {
                // Check if date is not booked
                const isBooked = bookings.some(booking => {
                    const bookingStart = new Date(booking.start);
                    const bookingEnd = new Date(booking.end);
                    bookingStart.setHours(0, 0, 0, 0);
                    bookingEnd.setHours(0, 0, 0, 0);
                    return searchDate >= bookingStart && searchDate <= bookingEnd;
                });
                
                if (!isBooked) {
                    return searchDate;
                }
            }
            
            // Move to next day
            searchDate.setDate(searchDate.getDate() + 1);
        }
        
        // If no available date found within 1 year, return today
        return today;
    }, [apartment, bookings]);

    // Additional scroll reset when apartment data is loaded
    useEffect(() => {
        if (apartment) {
            // Ensure we're at the top when apartment data is fully loaded
            const resetScroll = () => {
                window.scrollTo(0, 0);
                document.documentElement.scrollTop = 0;
                document.body.scrollTop = 0;
            };

            resetScroll();
            // Double-check after a brief delay
            setTimeout(resetScroll, 50);

            // Set calendar to the month containing the nearest available date
            const nearestAvailableDate = findNearestAvailableDate();
            setCurrentDate(nearestAvailableDate);
        }
    }, [apartment, findNearestAvailableDate]);

    // Force calendar re-render when language changes
    useEffect(() => {
        // Force calendar to re-render when language changes by creating a new date instance
        if (apartment && currentDate) {
            // Create a new date object to trigger calendar re-render
            setCurrentDate(new Date(currentDate.getTime()));
        }
    }, [language]);

    const handleBookingConfirmed = () => {
        // Refetch data to show the new booking
        const fetchBookings = async () => {
            if (!apartment) return;

            // Helper function to safely convert date fields
            const safeToDate = (dateField: any): Date => {
                if (dateField instanceof Date) {
                    return dateField;
                }
                if (dateField && typeof dateField.toDate === 'function') {
                    return dateField.toDate();
                }
                if (typeof dateField === 'string') {
                    return new Date(dateField);
                }
                return new Date(); // fallback
            };

            const allBookings: Booking[] = [];

            // Fetch from new subcollection
            const newBookingsSnapshot = await getDocs(collection(db, `apartments/${apartment.id}/bookings`));
            const newBookingsData = newBookingsSnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    start: safeToDate(data.start),
                    end: safeToDate(data.end),
                } as Booking;
            });
            allBookings.push(...newBookingsData);

            // Fetch from old main collection for this apartment
            try {
                const oldBookingsQuery = query(collection(db, "bookings"), where("apartmentId", "==", apartment.id));
                const oldBookingsSnapshot = await getDocs(oldBookingsQuery);
                const oldBookingsData = oldBookingsSnapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        apartmentId: apartment.id,
                        start: safeToDate(data.start),
                        end: safeToDate(data.end),
                        title: data.title || 'Reserved',
                        ...data
                    } as Booking;
                });
                allBookings.push(...oldBookingsData);
            } catch (error) {
                console.log("No old bookings found or permission denied:", error);
            }

            setBookings(allBookings);
        };
        fetchBookings();
    };



    const handleNavigate = (newDate: Date) => {
        // Allow free navigation for viewing purposes
        // Booking restrictions are handled at the booking level, not navigation level
            setCurrentDate(newDate);
    };

    // Helper function to check if a date is booked
    const isDateBooked = useCallback((date: Date) => {
        const dateToCheck = new Date(date);
        dateToCheck.setHours(0, 0, 0, 0);
        
        return bookings.some(booking => {
            const bookingStart = new Date(booking.start);
            const bookingEnd = new Date(booking.end);
            bookingStart.setHours(0, 0, 0, 0);
            bookingEnd.setHours(0, 0, 0, 0);
            return dateToCheck >= bookingStart && dateToCheck <= bookingEnd;
        });
    }, [bookings]);



    if (loading) {
        return <LoadingSpinner />;
    }

    if (!apartment) {
        return <div className="text-center py-10">{t('i2DqHwbtTRDPlkvS5liF')}</div>;
    }

    const galleryImages = apartment.photos.map(photo => ({ original: photo, thumbnail: photo }));

    return (
        <div className="bg-gray-50">
            {/* Social Media Meta Tags */}
            {apartment && <SocialMetaTags apartment={apartment} />}
            
            {/* Full Viewport Hero Section */}
            {currentHeroImage && (
                <div className="hero-section relative h-screen w-full group overflow-hidden">
                    {/* Direct hero image with immediate loading */}
                    <img
                        src={currentHeroImage}
                        alt="Apartment hero view"
                        className="absolute inset-0 w-full h-full object-cover z-0"
                        loading="eager"
                        decoding="async"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/60 z-10">
                        {/* Apartment Name - Top Left Corner (conditionally displayed) */}
                        {!apartment.hideName && (
                            <div className="absolute top-6 left-6 md:top-8 md:left-8 z-30">
                                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white drop-shadow-lg tracking-tight">
                                    {apartmentName}
                                </h1>
                            </div>
                        )}





                        {/* Mobile Pricing Card - Centered Top */}
                        <div className="block sm:hidden absolute top-8 left-1/2 -translate-x-1/2 w-80 max-w-[calc(100vw-2rem)] z-30">
                            {apartment?.pricing?.perNight && (
                                <div className="group/price relative">
                                    {/* Animated background glow */}
                                    <div className="absolute -inset-4 bg-gradient-to-r from-cyan-400/20 via-blue-500/20 to-purple-600/20 rounded-3xl blur-2xl opacity-75 group-hover/price:opacity-100 group-hover/price:scale-110 transition-all duration-500"></div>

                                    {/* Main sleek card */}
                                    <div className="relative bg-gradient-to-br from-white/15 via-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl hover:shadow-cyan-500/25 transition-all duration-500 overflow-hidden group-hover/price:scale-105">
                                        {/* Animated border gradient */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 via-cyan-400/30 to-purple-500/0 opacity-0 group-hover/price:opacity-100 transition-opacity duration-500 rounded-3xl"></div>

                                        {/* Content */}
                                        <div className="relative px-6 py-5">
                                            {/* Price label */}
                                            <div className="text-xs font-semibold text-cyan-100 tracking-wider uppercase mb-2 opacity-90 text-center">
                                                {t('lSTBd7fnvyXx34YwC5tL')}
                                            </div>

                                            {/* Main price - Dual currency display */}
                                            <div className="relative">
                                                {/* Price highlight background */}
                                                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-cyan-400/20 rounded-xl blur-sm"></div>
                                                <div className="relative text-center">
                                                    {language === 'bg' ? (
                                                        <>
                                                            {/* Primary: BGN */}
                                                            <div className="text-4xl font-black tracking-tight text-white drop-shadow-2xl px-4 py-2">
                                                                {apartment.pricing.perNight.bg} <span className="text-2xl font-bold text-cyan-200">лв</span>
                                                            </div>
                                                            {/* Secondary: EUR */}
                                                            {apartment.pricing.perNight.en && (
                                                                <div className="text-sm font-semibold text-cyan-100 opacity-80 mt-1">
                                                                    ≈ €{apartment.pricing.perNight.en}
                                                                </div>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <>
                                                            {/* Primary: EUR */}
                                                            <div className="text-4xl font-black tracking-tight text-white drop-shadow-2xl px-4 py-2">
                                                                €{apartment.pricing.perNight.en}
                                                            </div>
                                                            {/* Secondary: BGN */}
                                                            {apartment.pricing.perNight.bg && (
                                                                <div className="text-sm font-semibold text-cyan-100 opacity-80 mt-1">
                                                                    ≈ {apartment.pricing.perNight.bg} лв
                                                                </div>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Minimum nights info */}
                                            {apartment.minimumNights && (
                                                <div className="mt-4 text-center">
                                                    <div className="inline-flex items-center bg-white/15 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
                                                        <span className="text-sm font-medium text-cyan-100">
                                                            {t('minimumStay')}: {apartment.minimumNights} {apartment.minimumNights === 1 ? t('night') : t('nights')}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Bottom accent */}
                                            <div className="mt-4 h-0.5 bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent rounded-full"></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Left Side Cards Container - Hidden on Mobile */}
                        <div className="hidden sm:block absolute left-4 md:left-8 top-1/2 -translate-y-1/2 space-y-6">
                            {/* Pricing Card */}
                            {apartment?.pricing?.perNight && (
                                <div className="group/price relative max-w-xs">
                                    {/* Animated background glow */}
                                    <div className="absolute -inset-4 bg-gradient-to-r from-cyan-400/20 via-blue-500/20 to-purple-600/20 rounded-3xl blur-2xl opacity-75 group-hover/price:opacity-100 group-hover/price:scale-110 transition-all duration-500"></div>

                                    {/* Main sleek card */}
                                    <div className="relative bg-gradient-to-br from-white/15 via-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl hover:shadow-cyan-500/25 transition-all duration-500 overflow-hidden group-hover/price:scale-105">
                                        {/* Animated border gradient */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 via-cyan-400/30 to-purple-500/0 opacity-0 group-hover/price:opacity-100 transition-opacity duration-500 rounded-3xl"></div>

                                        {/* Content */}
                                        <div className="relative px-6 py-5">
                                            {/* Top section with icon */}


                                            {/* Price label */}
                                            <div className="text-xs font-semibold text-cyan-100 tracking-wider uppercase mb-2 opacity-90">
                                                {t('lSTBd7fnvyXx34YwC5tL')}
                                            </div>

                                            {/* Main price - Dual currency display */}
                                            <div className="relative">
                                                {/* Price highlight background */}
                                                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-cyan-400/20 rounded-xl blur-sm"></div>
                                                <div className="relative text-center">
                                                    {language === 'bg' ? (
                                                        <>
                                                            {/* Primary: BGN */}
                                                            <div className="text-5xl font-black tracking-tight text-white drop-shadow-2xl px-4 py-2">
                                                                {apartment.pricing.perNight.bg} <span className="text-3xl font-bold text-cyan-200">лв</span>
                                                            </div>
                                                            {/* Secondary: EUR */}
                                                            {apartment.pricing.perNight.en && (
                                                                <div className="text-lg font-semibold text-cyan-100 opacity-80 mt-1">
                                                                    ≈ €{apartment.pricing.perNight.en}
                                                                </div>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <>
                                                            {/* Primary: EUR */}
                                                            <div className="text-5xl font-black tracking-tight text-white drop-shadow-2xl px-4 py-2">
                                                                €{apartment.pricing.perNight.en}
                                                            </div>
                                                            {/* Secondary: BGN */}
                                                            {apartment.pricing.perNight.bg && (
                                                                <div className="text-lg font-semibold text-cyan-100 opacity-80 mt-1">
                                                                    ≈ {apartment.pricing.perNight.bg} лв
                                                                </div>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Minimum nights info */}
                                            {apartment.minimumNights && (
                                                <div className="mt-4 text-center">
                                                    <div className="inline-flex items-center bg-white/15 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
                                                        <span className="text-sm font-medium text-cyan-100">
                                                            {t('minimumStay')}: {apartment.minimumNights} {apartment.minimumNights === 1 ? t('night') : t('nights')}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Bottom accent */}
                                            <div className="mt-4 h-0.5 bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent rounded-full"></div>


                                        </div>
                                    </div>


                                </div>
                            )}





                            {/* Small Info Tiles Container */}
                            <div className="flex flex-wrap gap-3">
                                {/* Maximum Guests Tile - Highlighted */}
                                {apartment.maxGuests && (
                                    <div className="group/guests relative w-24 h-20">
                                        {/* Enhanced glow effect for highlighting */}
                                        <div className="absolute -inset-3 rounded-2xl blur-xl opacity-80 group-hover/guests:opacity-100 transition-all duration-500 bg-gradient-to-r from-purple-400/30 via-blue-500/35 to-cyan-400/30 animate-pulse"></div>

                                        {/* Highlighted main container */}
                                        <div className="relative backdrop-blur-xl rounded-2xl border-2 border-purple-400/40 shadow-xl transition-all duration-300 overflow-hidden group-hover/guests:scale-105 h-full bg-gradient-to-br from-white/20 via-purple-500/15 to-blue-500/20">
                                            
                                            {/* Content */}
                                            <div className="relative px-4 py-3 h-full flex flex-col justify-center">
                                                {/* Icon display */}
                                                <div className="flex items-center justify-center mb-2">
                                                    <div className="relative">
                                                        <Users className="w-6 h-6 text-purple-200 drop-shadow-lg" />
                                                        <div className="absolute -top-1 -right-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center border border-white/30">
                                                            {apartment.maxGuests}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Status text */}
                                                <div className="text-center">
                                                    <div className="text-xs font-bold text-white drop-shadow-lg">
                                                        {language === 'bg' ? 'Гости' : 'Guests'}
                                                    </div>
                                                </div>

                                                {/* Accent line */}
                                                <div className="mt-2 h-0.5 rounded-full bg-gradient-to-r from-transparent via-purple-400/50 to-transparent"></div>
                                            </div>

                                            {/* Tooltip */}
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover/guests:opacity-100 transition-all duration-300 pointer-events-none z-50">
                                                <div className="text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap shadow-lg backdrop-blur-sm border bg-purple-800/90 border-purple-400/30">
                                                    {language === 'bg' ? 
                                                        `Максимално ${apartment.maxGuests} ${apartment.maxGuests === 1 ? 'гост' : 'гости'}` : 
                                                        `Maximum ${apartment.maxGuests} ${apartment.maxGuests === 1 ? 'guest' : 'guests'}`
                                                    }
                                                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-3 border-r-3 border-t-3 border-l-transparent border-r-transparent border-t-purple-800/90"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Floor Number Tile */}
                            {apartment?.floor !== undefined && (
                                    <div className="group/floor relative w-24 h-20">
                                        {/* Glow effect */}
                                        <div className="absolute -inset-2 rounded-2xl blur-lg opacity-60 group-hover/floor:opacity-90 transition-all duration-500 bg-gradient-to-r from-orange-400/20 via-yellow-500/20 to-amber-400/15"></div>

                                        {/* Main container */}
                                        <div className="relative backdrop-blur-xl rounded-2xl border shadow-lg transition-all duration-300 overflow-hidden group-hover/floor:scale-105 h-full bg-gradient-to-br from-white/15 via-orange-500/8 to-yellow-500/10 border-orange-300/25 hover:shadow-orange-500/20">

                                        {/* Content */}
                                            <div className="relative px-4 py-3 h-full flex flex-col justify-center">
                                                {/* Icon display */}
                                                <div className="flex items-center justify-center mb-2">
                                                    <div className="relative">
                                                        <Building className="w-6 h-6 text-orange-200 drop-shadow-lg" />
                                                        <div className="absolute -top-1 -right-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center border border-white/30">
                                                            {apartment.floor}
                                                        </div>
                                                    </div>
                                            </div>

                                                {/* Status text */}
                                                <div className="text-center">
                                                    <div className="text-xs font-bold text-white drop-shadow-lg">
                                                        {apartment.floor === 0 ? (
                                                            language === 'bg' ? 'Партер' : 'Ground'
                                                        ) : (
                                                            language === 'bg' ? 'Етаж' : 'Floor'
                                                        )}
                                                    </div>
                                            </div>

                                                {/* Accent line */}
                                                <div className="mt-2 h-0.5 rounded-full bg-gradient-to-r from-transparent via-orange-400/40 to-transparent"></div>
                                            </div>

                                            {/* Tooltip */}
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover/floor:opacity-100 transition-all duration-300 pointer-events-none z-50">
                                                <div className="text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap shadow-lg backdrop-blur-sm border bg-orange-800/90 border-orange-400/30">
                                                    {apartment.floor === 0 ? (
                                                        language === 'bg' ? 'Партерен етаж' : 'Ground floor'
                                                    ) : (
                                                        language === 'bg' ? `${apartment.floor}-ти етаж` : `${apartment.floor}${getOrdinalSuffix(apartment.floor)} floor`
                                                    )}
                                                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-3 border-r-3 border-t-3 border-l-transparent border-r-transparent border-t-orange-800/90"></div>
                                                </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                                {/* Compact Pets Policy Tile */}
                                <div className="group/pets relative w-24 h-20">
                                    {/* Compact glow effect */}
                                    <div className={`absolute -inset-2 rounded-2xl blur-lg opacity-60 group-hover/pets:opacity-90 transition-all duration-500 ${arePetsAllowed()
                                            ? 'bg-gradient-to-r from-green-400/20 via-emerald-500/20 to-teal-400/15'
                                            : 'bg-gradient-to-r from-red-400/25 via-rose-500/25 to-orange-400/20 animate-pulse'
                                        }`}></div>

                                    {/* Compact main container */}
                                    <div className={`relative backdrop-blur-xl rounded-2xl border shadow-lg transition-all duration-300 overflow-hidden group-hover/pets:scale-105 h-full ${arePetsAllowed()
                                            ? 'bg-gradient-to-br from-white/15 via-white/8 to-white/5 border-white/20 hover:shadow-emerald-500/20'
                                            : 'bg-gradient-to-br from-white/15 via-red-500/8 to-rose-500/10 border-red-300/25 hover:shadow-red-500/25'
                                        }`}>
                                        
                                        {/* Content */}
                                        <div className="relative px-4 py-3 h-full flex flex-col justify-center">
                                            {/* Compact icon display */}
                                            <div className="flex items-center justify-center mb-2">
                                                <div className="relative">
                                                    {arePetsAllowed() ? (
                                                        /* Pet icons when allowed */
                                                        <div className="flex flex-col items-center gap-0.5">
                                                            <Dog className="w-4 h-4 text-green-200" />
                                                        </div>
                                                    ) : (
                                                        /* Pet icon with ban overlay when not allowed */
                                                        <div className="flex items-center justify-center">
                                                            <div className="relative">
                                                                <Dog className="w-5 h-5 text-white/60" />
                                                                <div className="absolute inset-0 flex items-center justify-center">
                                                                    <Ban className="w-6 h-6 text-red-400 drop-shadow-lg animate-pulse" />
                                                                </div>
                                                                <div className="absolute inset-0 bg-red-400/10 rounded-full blur-sm animate-pulse"></div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Compact status text */}
                                            <div className="text-center">
                                                <div className={`text-xs font-bold text-white drop-shadow-lg ${!arePetsAllowed() ? 'animate-pulse' : ''}`}>
                                                    {arePetsAllowed() ? (
                                                        language === 'bg' ? 'Домашни любимци' : 'Allowed'
                                                    ) : (
                                                        language === 'bg' ? 'Без любимци' : 'Pet-free'
                                                    )}
                                                </div>
                                            </div>

                                            {/* Tiny accent line */}
                                            <div className={`mt-2 h-0.5 rounded-full ${arePetsAllowed()
                                                    ? 'bg-gradient-to-r from-transparent via-green-400/40 to-transparent'
                                                    : 'bg-gradient-to-r from-transparent via-red-400/50 to-transparent'
                                                }`}></div>
                                        </div>

                                        {/* Tooltip */}
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover/pets:opacity-100 transition-all duration-300 pointer-events-none z-50">
                                            <div className={`text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap shadow-lg backdrop-blur-sm border ${arePetsAllowed()
                                                    ? 'bg-green-800/90 border-green-400/30'
                                                    : 'bg-red-800/90 border-red-400/30'
                                                }`}>
                                                {arePetsAllowed() ? (
                                                    language === 'bg' ? 
                                                        'Домашни любимци разрешени' : 
                                                        'Pets welcome'
                                                ) : (
                                                    language === 'bg' ? 
                                                        'Съжаляваме, това е среда без домашни любимци' : 
                                                        'Sorry, this is a pet-free environment'
                                                )}
                                                <div className={`absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-3 border-r-3 border-t-3 border-l-transparent border-r-transparent ${arePetsAllowed()
                                                        ? 'border-t-green-800/90'
                                                        : 'border-t-red-800/90'
                                                    }`}></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Compact Smoking Policy Tile */}
                                <div className="group/smoking relative w-24 h-20">
                                    {/* Compact glow effect */}
                                    <div className={`absolute -inset-2 rounded-2xl blur-lg opacity-60 group-hover/smoking:opacity-90 transition-all duration-500 ${isSmokingAllowed()
                                            ? 'bg-gradient-to-r from-blue-400/20 via-cyan-500/20 to-sky-400/15'
                                            : 'bg-gradient-to-r from-red-400/25 via-orange-500/25 to-yellow-400/20 animate-pulse'
                                        }`}></div>

                                    {/* Compact main container */}
                                    <div className={`relative backdrop-blur-xl rounded-2xl border shadow-lg transition-all duration-300 overflow-hidden group-hover/smoking:scale-105 h-full ${isSmokingAllowed()
                                            ? 'bg-gradient-to-br from-white/15 via-white/8 to-white/5 border-white/20 hover:shadow-blue-500/20'
                                            : 'bg-gradient-to-br from-white/15 via-orange-500/8 to-red-500/10 border-orange-300/25 hover:shadow-orange-500/25'
                                        }`}>
                                        
                                        {/* Content */}
                                        <div className="relative px-4 py-3 h-full flex flex-col justify-center">
                                            {/* Compact icon display */}
                                            <div className="flex items-center justify-center mb-2">
                                                <div className="relative">
                                                    {/* Cigarette icon */}
                                                    <Cigarette className={`w-6 h-6 ${isSmokingAllowed() ? 'text-blue-200' : 'text-white/50'}`} />
                                                    
                                                    {/* Ban overlay when not allowed */}
                                                    {!isSmokingAllowed() && (
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            <Ban className="w-6 h-6 text-red-400 drop-shadow-lg animate-pulse" />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Compact status text */}
                                            <div className="text-center">
                                                <div className={`text-xs font-bold text-white drop-shadow-lg ${!isSmokingAllowed() ? 'animate-pulse' : ''}`}>
                                                    {isSmokingAllowed() ? (
                                                        language === 'bg' ? 'Пушенето Позволено' : 'Allowed'
                                                    ) : (
                                                        language === 'bg' ? 'Пушенето Забранено' : 'No Smoking'
                                                    )}
                                                </div>
                                            </div>

                                            {/* Tiny accent line */}
                                            <div className={`mt-2 h-0.5 rounded-full ${isSmokingAllowed()
                                                    ? 'bg-gradient-to-r from-transparent via-blue-400/40 to-transparent'
                                                    : 'bg-gradient-to-r from-transparent via-orange-400/50 to-transparent'
                                                }`}></div>
                                        </div>

                                        {/* Tooltip */}
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover/smoking:opacity-100 transition-all duration-300 pointer-events-none z-50">
                                            <div className={`text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap shadow-lg backdrop-blur-sm border ${isSmokingAllowed()
                                                    ? 'bg-blue-800/90 border-blue-400/30'
                                                    : 'bg-orange-800/90 border-orange-400/30'
                                                }`}>
                                                {isSmokingAllowed() ? (
                                                    language === 'bg' ? 
                                                        'Пушенето е разрешено в определени зони' : 
                                                        'Smoking allowed in designated areas'
                                                ) : (
                                                    language === 'bg' ? 
                                                        'Пушенето е строго забранено' : 
                                                        'Smoking is strictly prohibited'
                                                )}
                                                <div className={`absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-3 border-r-3 border-t-3 border-l-transparent border-r-transparent ${isSmokingAllowed()
                                                        ? 'border-t-blue-800/90'
                                                        : 'border-t-orange-800/90'
                                                    }`}></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* End Small Info Tiles Container */}
                            </div>

                            {/* Description Card - Separate */}
                            {apartment?.description && (
                                <div className="group/desc max-w-sm">
                                    {/* Subtle glow effect */}
                                    <div className="absolute -inset-3 bg-gradient-to-r from-emerald-400/15 via-teal-500/15 to-cyan-400/15 rounded-2xl blur-xl opacity-60 group-hover/desc:opacity-80 transition-all duration-500"></div>

                                    {/* Description card */}
                                    <div className="relative bg-gradient-to-br from-white/12 via-white/8 to-white/4 backdrop-blur-lg rounded-2xl border border-white/15 shadow-xl hover:shadow-emerald-500/20 transition-all duration-500 overflow-hidden">
                                        {/* Subtle border animation */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/0 via-emerald-400/20 to-teal-500/0 opacity-0 group-hover/desc:opacity-100 transition-opacity duration-500 rounded-2xl"></div>

                                        {/* Content */}
                                        <div className="relative px-5 py-4">
                                            {/* Header with accent */}
                                            <div className="flex items-center mb-3">
                                                <div className="w-3 h-3 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full shadow-md"></div>
                                                <div className="ml-3 flex-1 h-0.5 bg-gradient-to-r from-emerald-400/40 to-transparent rounded-full"></div>
                                            </div>

                                            {/* Description text */}
                                            <div className="text-sm leading-relaxed text-white/90 font-light">
                                                {apartment.description[language] || apartment.description['bg'] || apartment.description['en']}
                                            </div>

                                            {/* Bottom accent */}
                                            <div className="mt-3 h-0.5 bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent rounded-full"></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Combined Special Offers Button / Scroll Down Indicator */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center z-20">
                            {(apartment?.pricing?.perNight?.bg || apartment?.pricing?.perNight?.en || (apartment.pricingOffers && apartment.pricingOffers.length > 0)) ? (
                                // Special Offers Section with Connected Design
                                <div className="relative flex flex-col items-center">
                                    {/* Connecting Line */}
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-0.5 h-4 bg-gradient-to-b from-orange-400 to-white/30 opacity-80"></div>

                                    {/* Special Offers Text */}
                                    <div
                                        onClick={() => {
                                            const offersSection = document.getElementById('offers-section');
                                            if (offersSection) {
                                                offersSection.scrollIntoView({
                                                    behavior: 'smooth',
                                                    block: 'start'
                                                });
                                            }
                                        }}
                                        className="cursor-pointer group relative z-10 px-4 py-2"
                                    >
                                        <div className="text-white text-lg font-bold tracking-wide text-center drop-shadow-2xl group-hover:text-orange-200 transition-all duration-300">
                                            {apartment.pricingOffers && apartment.pricingOffers.length > 0 
                                                ? (t('viewSpecialOffers') || `${t('view')} ${t('specialOffers')}`)
                                                : (t('viewPricing') || `${t('view')} ${t('pricing')}`)
                                            }
                                        </div>
                                        {/* Underline indicator */}
                                        <div className="w-0 h-0.5 bg-gradient-to-r from-orange-400 to-amber-400 mx-auto mt-1 group-hover:w-full transition-all duration-300 rounded-full shadow-lg"></div>
                                        {/* Text glow effect */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-orange-400/0 via-orange-400/10 to-orange-400/0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
                                    </div>

                                    {/* Scroll Down Arrow - Connected */}
                                    <div className="mt-4 animate-bounce relative z-10">
                                        <div
                                            className="bg-gradient-to-r from-amber-400/20 via-orange-500/20 to-red-500/20 backdrop-blur-md rounded-full p-3 border border-orange-300/40 hover:border-orange-300/60 hover:bg-gradient-to-r hover:from-amber-400/30 hover:via-orange-500/30 hover:to-red-500/30 transition-all duration-300 cursor-pointer shadow-lg"
                                            onClick={() => {
                                                const offersSection = document.getElementById('offers-section');
                                                if (offersSection) {
                                                    offersSection.scrollIntoView({
                                                        behavior: 'smooth',
                                                        block: 'start'
                                                    });
                                                }
                                            }}
                                        >
                                            <ChevronDown className="w-6 h-6 text-orange-200" />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                // Generic Scroll Down Indicator
                            <div className="animate-bounce">
                                <div
                                    className="bg-white/20 backdrop-blur-md rounded-full p-3 border border-white/30 hover:bg-white/30 transition-all duration-300 cursor-pointer"
                                    onClick={() => {
                                        window.scrollTo({
                                            top: window.innerHeight,
                                            behavior: 'smooth'
                                        });
                                    }}
                                >
                                    <ChevronDown className="w-6 h-6 text-white" />
                                </div>
                            </div>
                            )}
                        </div>
                    </div>

                    {/* Vertical Image Thumbnails - Right Side */}
                    {slideshowImages.length > 0 && (
                        <div className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 flex flex-col space-y-3 z-10">
                            {/* Show up to 5 thumbnails */}
                            {slideshowImages.slice(0, 5).map((img, index) => (
                                <div
                                    key={index}
                                    className="group/thumb relative"
                                >
                                    {/* Glow effect for active thumbnail */}
                                    {currentHeroImage === img && (
                                        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400/50 to-purple-500/50 rounded-xl blur-sm"></div>
                                    )}
                                    <img
                                        src={img}
                                        alt={`Image ${index + 1}`}
                                        className={`relative w-16 h-16 md:w-20 md:h-20 object-cover rounded-xl cursor-pointer border-2 transition-all duration-300 hover:scale-105 ${currentHeroImage === img
                                                ? 'border-white scale-110 shadow-2xl'
                                                : 'border-white/30 hover:border-white/70 shadow-lg hover:shadow-xl'
                                            }`}
                                        onClick={() => {
                                            // Stop the slideshow at the current image when user interacts
                                            if (img !== currentHeroImage) {
                                                setCurrentHeroImage(img);
                                            }
                                        }}
                                    />
                                </div>
                            ))}

                            {/* "See more" thumbnail */}
                            <div className="group/thumb relative">
                                {/* Glow effect */}
                                <div className="absolute -inset-1 bg-gradient-to-r from-purple-400/50 to-pink-500/50 rounded-xl blur-sm opacity-0 group-hover/thumb:opacity-100 transition-opacity duration-300"></div>
                                <div
                                    className="relative w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-black/60 to-black/80 backdrop-blur-sm rounded-xl cursor-pointer border-2 border-white/30 hover:border-white/70 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl flex flex-col items-center justify-center group-hover/thumb:from-purple-600/60 group-hover/thumb:to-pink-600/60 p-1"
                                    onClick={() => {
                                        // Scroll to gallery section
                                        const gallerySection = document.getElementById('gallery-section');
                                        if (gallerySection) {
                                            gallerySection.scrollIntoView({
                                                behavior: 'smooth',
                                                block: 'start'
                                            });
                                        }
                                    }}
                                >
                                    <svg className="w-5 h-5 md:w-6 md:h-6 text-white mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                    </svg>
                                    <span className="text-[10px] md:text-xs text-white font-medium text-center leading-none">{t('seeMore')}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Mobile Cards Section - Hidden on Desktop */}
            {apartment && (
                <div className="block sm:hidden bg-gradient-to-b from-gray-50 to-white py-8">
                    <div className="max-w-4xl mx-auto px-4">

                        {/* Info Tiles for Mobile */}
                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">{t('apartmentInfo')}</h2>
                            <div className="grid grid-cols-2 gap-4">
                                {/* Max Guests */}
                                {apartment.maxGuests && (
                                    <div className="bg-gradient-to-br from-purple-600 to-blue-600 p-4 rounded-xl text-white text-center">
                                        <Users className="w-8 h-8 mx-auto mb-2 text-purple-200" />
                                        <div className="text-2xl font-bold">{apartment.maxGuests}</div>
                                        <div className="text-xs text-purple-100">
                                            {language === 'bg' ? 'Гости' : 'Guests'}
                                        </div>
                                    </div>
                                )}

                                {/* Floor Info */}
                                {typeof apartment.floor !== 'undefined' && (
                                    <div className="bg-gradient-to-br from-orange-600 to-red-600 p-4 rounded-xl text-white text-center">
                                        <Building className="w-8 h-8 mx-auto mb-2 text-orange-200" />
                                        <div className="text-lg font-bold">
                                            {apartment.floor === 0 ? (
                                                language === 'bg' ? 'Партер' : 'Ground'
                                            ) : (
                                                `${apartment.floor}${language === 'en' ? getOrdinalSuffix(apartment.floor) : '-ти'}`
                                            )}
                                        </div>
                                        <div className="text-xs text-orange-100">
                                            {language === 'bg' ? 'Етаж' : 'Floor'}
                                        </div>
                                    </div>
                                )}

                                {/* Pets Policy */}
                                <div className={`p-4 rounded-xl text-white text-center ${
                                    arePetsAllowed() 
                                        ? 'bg-gradient-to-br from-green-600 to-emerald-600' 
                                        : 'bg-gradient-to-br from-red-600 to-rose-600'
                                }`}>
                                    {arePetsAllowed() ? (
                                        <Dog className="w-8 h-8 mx-auto mb-2 text-green-200" />
                                    ) : (
                                        <div className="relative w-8 h-8 mx-auto mb-2">
                                            <Dog className="w-8 h-8 text-white/60" />
                                            <Ban className="absolute inset-0 w-8 h-8 text-red-300" />
                                        </div>
                                    )}
                                    <div className="text-sm font-bold">
                                        {arePetsAllowed() ? (
                                            language === 'bg' ? 'Разрешени' : 'Allowed'
                                        ) : (
                                            language === 'bg' ? 'Забранени' : 'Not Allowed'
                                        )}
                                    </div>
                                    <div className="text-xs opacity-80">
                                        {language === 'bg' ? 'Домашни любимци' : 'Pets'}
                                    </div>
                                </div>

                                {/* Smoking Policy */}
                                <div className={`p-4 rounded-xl text-white text-center ${
                                    isSmokingAllowed() 
                                        ? 'bg-gradient-to-br from-blue-600 to-indigo-600' 
                                        : 'bg-gradient-to-br from-orange-600 to-amber-600'
                                }`}>
                                    {isSmokingAllowed() ? (
                                        <Cigarette className="w-8 h-8 mx-auto mb-2 text-blue-200" />
                                    ) : (
                                        <div className="relative w-8 h-8 mx-auto mb-2">
                                            <Cigarette className="w-8 h-8 text-white/60" />
                                            <Ban className="absolute inset-0 w-8 h-8 text-orange-300" />
                                        </div>
                                    )}
                                    <div className="text-sm font-bold">
                                        {isSmokingAllowed() ? (
                                            language === 'bg' ? 'Разрешено' : 'Allowed'
                                        ) : (
                                            language === 'bg' ? 'Забранено' : 'Prohibited'
                                        )}
                                    </div>
                                    <div className="text-xs opacity-80">
                                        {language === 'bg' ? 'Пушене' : 'Smoking'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Pricing Offers Section */}
            {(apartment?.pricing?.perNight?.bg || apartment?.pricing?.perNight?.en || (apartment.pricingOffers && apartment.pricingOffers.length > 0)) && (
                <div id="offers-section" className="py-16 sm:py-24 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
                    <div className="w-full px-4 sm:px-6 lg:px-8">
                        {/* Special Offers Header */}
                        <div className="mb-16">
                            <div className="flex items-center justify-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-pink-600 rounded-xl flex items-center justify-center">
                                    <Gift className="w-6 h-6 text-white" />
                    </div>
                                <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-orange-700 to-pink-800 bg-clip-text text-transparent">
                                    {apartment.pricingOffers && apartment.pricingOffers.length > 0 ? t('specialOffers') : t('pricing')}
                                </h2>
                </div>
                            <p className="text-xl text-gray-600 text-center max-w-3xl mx-auto">
                                {apartment.pricingOffers && apartment.pricingOffers.length > 0 ? t('specialOffersDescription') : t('pricingDescription')}
                            </p>
            </div>
                        <div className="flex flex-wrap justify-center gap-6 mx-auto max-w-full">
                            {/* Base Price Card */}
                            <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 border-2 border-gray-300 hover:border-gray-400 transform hover:-translate-y-2 w-96 flex-shrink-0">
                                {/* Standard background */}
                                <div className="absolute inset-0 bg-gradient-to-br from-gray-500/5 via-slate-500/5 to-gray-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                                {/* Content */}
                                <div className="relative p-8">
                                    {/* Base Price Badge */}
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                        <div className="bg-gradient-to-r from-gray-500 to-slate-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                                            {t('standardRate')}
                                            </div>
                                        </div>

                                    {/* Price Name */}
                                    <div className="text-center mt-4 mb-6">
                                        <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('regularPrice')}</h3>
                                        <div className="w-16 h-1 bg-gradient-to-r from-gray-500 to-slate-500 rounded-full mx-auto"></div>
                                                    </div>

                                    {/* Main Price Display */}
                                    <div className="text-center mb-6">
                                        <div className="relative">
                                            {/* Price circle background */}
                                            <div className="w-32 h-32 mx-auto bg-gradient-to-br from-gray-500 to-slate-600 rounded-full flex items-center justify-center shadow-xl group-hover:scale-105 transition-transform duration-300">
                                                <div className="text-center">
                                                    {language === 'bg' ? (
                                                        <>
                                                            {/* Primary: BGN */}
                                                            <div className="text-3xl font-black text-white">
                                                                {apartment.pricing.perNight.bg}
                                                                <span className="text-lg font-bold text-gray-100 block">лв</span>
                                                            </div>
                                                            {/* Secondary: EUR */}
                                                            {apartment.pricing.perNight.en && (
                                                                <div className="text-sm font-semibold text-gray-200 opacity-75 mt-1">
                                                                    ≈ €{apartment.pricing.perNight.en}
                                                                </div>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <>
                                                            {/* Primary: EUR */}
                                                            <div className="text-3xl font-black text-white">
                                                                €{apartment.pricing.perNight.en}
                                                            </div>
                                                            {/* Secondary: BGN */}
                                                            {apartment.pricing.perNight.bg && (
                                                                <div className="text-sm font-semibold text-gray-200 opacity-75 mt-1">
                                                                    ≈ {apartment.pricing.perNight.bg} лв
                                                                </div>
                                                            )}
                                                        </>
                                                    )}
                                            </div>
                                                </div>
                                            {/* Floating per night label */}
                                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white border border-gray-200 rounded-full px-4 py-1 text-sm font-semibold text-gray-700 shadow-md">
                                                {t('perNight')}
                                        </div>
                                    </div>
                        </div>

                                    {/* Standard Details */}
                                    <div className="space-y-4">
                                        {/* Minimum stay requirement */}
                                        <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
                                            <div className="text-sm text-gray-600 mb-1">{t('appliesTo')}</div>
                                            <div className="font-bold text-gray-900">
                                                {apartment.minimumNights ? (
                                                    `${t('staysOf')} ${apartment.minimumNights}+ ${apartment.minimumNights === 1 ? t('night') : t('nights')}`
                                                ) : (
                                                    t('allStays')
                                                )}
                    </div>
                </div>


                                    </div>

                                    {/* Standard description */}
                                    <div className="mt-6 pt-6 border-t border-gray-100">
                                        <p className="text-sm text-gray-600 text-center italic leading-relaxed">
                                            {apartment.minimumNights ? (
                                                t('standardRateDescriptionWithMinimum').replace('{nights}', apartment.minimumNights.toString())
                                            ) : (
                                                t('standardRateDescription')
                                            )}
                                        </p>
                        </div>

                                    {/* Decorative elements */}
                                    <div className="absolute top-4 right-4 w-2 h-2 bg-gray-400 rounded-full opacity-60"></div>
                                    <div className="absolute bottom-4 left-4 w-1 h-1 bg-slate-400 rounded-full opacity-60"></div>
                                    </div>
                                    </div>

                            {/* Special Offers Cards */}
                            {apartment.pricingOffers?.map((offer, index) => {
                                // Get per-night prices (now stored directly as per-night rates)
                                const bgnPerNight = (offer as any).priceBGN || Math.round(offer.price * 1.95583);
                                const eurPerNight = (offer as any).priceEUR || offer.price;

                                return (
                                    <div
                                        key={offer.id}
                                        className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-blue-200 transform hover:-translate-y-2 w-96 flex-shrink-0"
                                        style={{ animationDelay: `${index * 150}ms` }}
                                    >
                                        {/* Gradient background on hover */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                                        {/* Content */}
                                        <div className="relative p-8">
                                            {/* Offer Badge */}
                                            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                                <div className="bg-gradient-to-r from-orange-400 to-pink-500 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                                                    {t('specialOffer')}
                                    </div>
                                </div>

                                            {/* Offer Name */}
                                            <div className="text-center mt-4 mb-6">
                                                <h3 className="text-2xl font-bold text-gray-900 mb-2">{offer.name}</h3>
                                                <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto"></div>
                            </div>

                                            {/* Main Price Display */}
                                            <div className="text-center mb-6">
                                                <div className="relative">
                                                    {/* Price circle background */}
                                                    <div className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-xl group-hover:scale-105 transition-transform duration-300">
                                                        <div className="text-center">
                                                            {language === 'bg' ? (
                                                                <>
                                                                    {/* Primary: BGN */}
                                                                    <div className="text-3xl font-black text-white">
                                                                        {Math.round(bgnPerNight)}
                                                                        <span className="text-lg font-bold text-blue-100 block">лв</span>
                                                                    </div>
                                                                    {/* Secondary: EUR */}
                                                                    <div className="text-sm font-semibold text-blue-200 opacity-75 mt-1">
                                                                        ≈ €{Math.round(eurPerNight)}
                                                                    </div>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    {/* Primary: EUR */}
                                                                    <div className="text-3xl font-black text-white">
                                                                        €{Math.round(eurPerNight)}
                                                                    </div>
                                                                    {/* Secondary: BGN */}
                                                                    <div className="text-sm font-semibold text-blue-200 opacity-75 mt-1">
                                                                        ≈ {Math.round(bgnPerNight)} лв
                                                                    </div>
                                                                </>
                                                            )}
                </div>
            </div>
                                                    {/* Floating per night label */}
                                                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white border border-gray-200 rounded-full px-4 py-1 text-sm font-semibold text-gray-700 shadow-md">
                                                        {t('perNight')}
                                                </div>
                                            </div>
                                                </div>

                                            {/* Offer Details */}
                                            <div className="space-y-4">
                                                {/* Minimum Stay */}
                                                <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
                                                    <div className="text-sm text-gray-600 mb-1">{t('appliesTo')}</div>
                                                    <div className="font-bold text-gray-900">
                                                        {t('staysOf')} {offer.days}+ {offer.days === 1 ? t('night') : t('nights')}
                                                </div>
                                                </div>


                                            </div>

                                            {/* Description */}
                                        {offer.description && (
                                                <div className="mt-6 pt-6 border-t border-gray-100">
                                                    <p className="text-sm text-gray-600 text-center italic leading-relaxed">
                                                        {offer.description}
                                                    </p>
                                            </div>
                                        )}

                                            {/* Decorative elements */}
                                            <div className="absolute top-4 right-4 w-2 h-2 bg-blue-400 rounded-full opacity-60"></div>
                                            <div className="absolute bottom-4 left-4 w-1 h-1 bg-purple-400 rounded-full opacity-60"></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Testimonials Section */}
            {apartment && (
                <div className="py-16 sm:py-24 bg-gradient-to-br from-indigo-50 via-white to-blue-50">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <TestimonialsCarousel apartmentId={apartment.id} />
                    </div>
                </div>
            )}

            {/* Amenities Section */}
            <div id="amenities-section" className="py-16 sm:py-24 bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Amenities Header */}
                    <div className="mb-12">
                        <div className="flex items-center justify-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                                <Star className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent">
                                {t('amenities')}
                            </h3>
                        </div>
                        <p className="text-xl text-gray-600 text-center max-w-3xl mx-auto">
                            {language === 'bg' ?
                                'Всичко необходимо за комфортния ви престой' :
                                'Everything you need for a comfortable stay'
                            }
                        </p>
                    </div>

                    {/* Amenities Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                        {getApartmentAmenities(apartment).map((amenity) => (
                            <div
                                key={amenity}
                                className="group flex flex-col items-center text-center p-6 hover:bg-white/60 hover:backdrop-blur-sm rounded-2xl transition-all duration-300 hover:shadow-lg hover:shadow-blue-100/50 hover:-translate-y-1"
                            >
                                {/* Icon */}
                                <div className="w-14 h-14 mb-4 flex items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 group-hover:from-blue-100 group-hover:to-indigo-100 group-hover:scale-110 transition-all duration-300 shadow-sm group-hover:shadow-md">
                                    {renderAmenityIcon(amenity)}
                                </div>

                                {/* Text */}
                                <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900 transition-colors duration-300 leading-tight">
                                    {getAmenityTranslation(amenity)}
                                </span>
                            </div>
                        ))}
                            </div>
                        </div>
                    </div>

            {/* Availability Calendar Section */}
            <div id="availability-section" className="py-16 sm:py-24 bg-gradient-to-br from-indigo-50/30 via-slate-50 to-emerald-50/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        {/* Calendar Header */}
                    <div className="mb-12">
                        <div className="flex items-center justify-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                                <Clock className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-emerald-700 to-teal-800 bg-clip-text text-transparent">
                                {t('availability')}
                            </h3>
                        </div>
                        <p className="text-xl text-gray-600 text-center max-w-3xl mx-auto mb-8">
                            {language === 'bg' ? 
                                'Проверете наличността за избраните дати' : 
                                'Check availability for your desired dates'
                            }
                        </p>



                                                                                {/* Modern Legend */}
                            <div className="flex flex-wrap justify-center gap-8 mb-8">
                                <div className="flex items-center space-x-3 text-sm">
                                    <div className="w-10 h-10 bg-white rounded border border-gray-200 shadow-sm flex items-center justify-center">
                                        <div className="w-7 h-7 rounded-full bg-green-500 border-2 border-white shadow-sm"></div>
                                    </div>
                                    <span className="text-gray-700 font-medium">{language === 'bg' ? 'Свободно' : 'Available'}</span>
                                </div>
                                <div className="flex items-center space-x-3 text-sm">
                                    <div className="w-10 h-10 bg-white rounded border border-gray-200 shadow-sm flex items-center justify-center">
                                        <div className="w-7 h-7 rounded-full bg-red-500 border-2 border-white shadow-sm"></div>
                                    </div>
                                    <span className="text-gray-700 font-medium">{language === 'bg' ? 'Заето' : 'Booked'}</span>
                                </div>
                            </div>
                        </div>

                                        {/* Calendar */}
                    <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                        <style>
                            {`
                                .rbc-calendar {
                                    border: 1px solid #e5e7eb !important;
                                    border-radius: 8px !important;
                                    overflow: hidden !important;
                                }
                                .rbc-calendar .rbc-month-view .rbc-date-cell {
                                    padding: 0 !important;
                                    border: none !important;
                                    border-right: 1px solid #e5e7eb !important;
                                    border-bottom: 1px solid #e5e7eb !important;
                                    min-height: 60px !important;
                                    position: relative !important;
                                    overflow: hidden !important;
                                    background: transparent !important;
                                }
                                .rbc-calendar .rbc-month-view .rbc-date-cell:last-child {
                                    border-right: none !important;
                                }
                                .rbc-calendar .rbc-month-view .rbc-row:last-child .rbc-date-cell {
                                    border-bottom: none !important;
                                }
                                .rbc-calendar .rbc-month-view .rbc-date-cell:hover {
                                    background-color: transparent !important;
                                }
                                .rbc-calendar .rbc-month-view .rbc-row {
                                    border: none !important;
                                }
                                .rbc-calendar .rbc-month-view .rbc-row-content {
                                    border: none !important;
                                }
                                .rbc-calendar .rbc-month-view .rbc-row-bg {
                                    border: none !important;
                                }
                                .rbc-calendar .rbc-month-view .rbc-row-bg .rbc-day-bg {
                                    border: none !important;
                                    background: transparent !important;
                                }
                                .rbc-calendar .rbc-month-view .rbc-header {
                                    border-bottom: 1px solid #e5e7eb !important;
                                    background-color: #f8fafc !important;
                                    font-weight: 600 !important;
                                    padding: 8px !important;
                                }
                                .rbc-calendar .rbc-month-view .rbc-date-cell .rbc-button-link {
                                    display: none !important;
                                }
                                .rbc-calendar .rbc-month-view .rbc-date-cell > a {
                                    display: none !important;
                                }
                                .rbc-calendar .rbc-month-view .rbc-date-cell > button {
                                    display: none !important;
                                }
                                .rbc-calendar .rbc-month-view .rbc-date-cell * {
                                    font-size: 0 !important;
                                }
                                .rbc-calendar .rbc-month-view .rbc-date-cell .custom-date-number {
                                    font-size: 16px !important;
                                }
                            `}
                        </style>
                            <Calendar
                                key={`calendar-${language}`}
                                localizer={localizer}
                            events={[]}
                            style={{ height: 420 }}
                                defaultView="month"
                            views={['month']}
                            date={currentDate}
                            onNavigate={handleNavigate}
                            toolbar={true}
                                culture={language}
                            
                            components={{
                                dateCellWrapper: ({ children, value }) => {
                                    const today = new Date();
                                    today.setHours(0, 0, 0, 0);
                                    const cellDate = new Date(value);
                                    cellDate.setHours(0, 0, 0, 0);
                                    
                                    const isPast = cellDate < today;
                                    const isToday = cellDate.getTime() === today.getTime();
                                    const isBooked = isDateBooked(cellDate);
                                    
                                    let circleColor = '';
                                    let statusText = '';
                                    
                                                                            // Only show circles for current/future dates (including today)
                                        if (!isPast) {
                                            if (isBooked) {
                                                circleColor = '#ef4444'; // Red
                                                statusText = language === 'bg' ? 'Заето' : 'Booked';
                                            } else {
                                                circleColor = '#22c55e'; // Green
                                                statusText = language === 'bg' ? 'Свободно' : 'Available';
                                            }
                                        }
                                    
                                    return (
                                        <div 
                                            style={{ 
                                                width: '100%',
                                                height: '100%',
                                                minHeight: '60px',
                                                position: 'relative',
                                                backgroundColor: isPast ? '#f9fafb' : '#ffffff',
                                                opacity: isPast ? 0.6 : 1,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                            title={statusText}
                                        >
                                            {/* Hide original calendar content */}
                                            <div style={{ display: 'none' }}>
                                                {children}
                                            </div>
                                            
                                            {/* Date number in top left corner */}
                                            <span 
                                                className="custom-date-number"
                                                style={{ 
                                                    position: 'absolute',
                                                    top: '8px',
                                                    left: '10px',
                                                    fontSize: '16px', 
                                                    fontWeight: '700', 
                                                    lineHeight: 1,
                                                    color: isPast ? '#9ca3af' : '#1f2937',
                                                    zIndex: 10,
                                                    fontFamily: 'system-ui, -apple-system, sans-serif'
                                                }}
                                            >
                                                {cellDate.getDate()}
                                            </span>
                                            
                                            {/* Status circle in center */}
                                            {circleColor && (
                                                <div
                                                    style={{
                                                        width: '28px',
                                                        height: '28px',
                                                        borderRadius: '50%',
                                                        backgroundColor: circleColor,
                                                        boxShadow: '0 3px 6px rgba(0,0,0,0.2)',
                                                        border: '3px solid rgba(255,255,255,0.95)',
                                                        zIndex: 5
                                                    }}
                                                />
                                            )}
                                        </div>
                                    );
                                }
                            }}
                                messages={{
                                    next: "▶",
                                    previous: "◀",
                                    today: t('today') || "Today",
                                    month: t('month') || "Month",
                                    week: t('week') || "Week",
                                    day: t('day') || "Day",
                                    agenda: t('agenda') || "Agenda",
                                    date: t('date') || "Date",
                                    time: t('time') || "Time",
                                    event: t('event') || "Event",
                                noEventsInRange: t('noEventsInRange') || "No events to display.",
                                    showMore: total => `+${total} ${t('more') || 'more'}`
                                }}
                            />
                        </div>
                    </div>
                </div>

            {/* Gallery Section */}
            {apartment.photos && apartment.photos.length > 0 && (
                <div id="gallery-section" className="py-16 sm:py-24 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        {/* Gallery Header */}
                        <div className="mb-12">
                            <div className="flex items-center justify-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                                    <Camera className="w-6 h-6 text-white" />
                                </div>
                                <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-purple-700 to-pink-800 bg-clip-text text-transparent">
                                    {t('gallery')}
                                </h2>
                            </div>
                            <p className="text-xl text-gray-600 text-center max-w-3xl mx-auto">
                                {language === 'bg' ? 
                                    'Разгледайте нашия уютен апартамент и околността' : 
                                    'Explore our cozy apartment and surroundings'
                                }
                            </p>
            </div>

                        {/* Custom Gallery Layout */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Main Featured Image */}
                            {apartment.photos[0] && (
                                <div className="lg:col-span-2 lg:row-span-2">
                                    <div 
                                        className="group relative aspect-[4/3] rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer"
                                        onClick={() => openLightbox(0)}
                                    >
                                        <OptimizedImage
                                            src={apartment.photos[0]}
                                            alt="Main apartment view"
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                            priority={true}
                                            placeholder="skeleton"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                        <div className="absolute bottom-4 left-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <span className="text-sm font-medium bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full">
                                                {language === 'bg' ? 'Основна снимка' : 'Main View'}
                                            </span>
                                        </div>
                                        
                                        {/* Click to expand indicator */}
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <div className="bg-white/90 backdrop-blur-sm rounded-full p-3">
                                                <Camera className="w-6 h-6 text-gray-800" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Secondary Images Grid */}
                            <div className="space-y-6">
                                {apartment.photos.slice(1, 3).map((photo, index) => (
                                    <div 
                                        key={index} 
                                        className="group relative aspect-[4/3] rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
                                        onClick={() => openLightbox(index + 1)}
                                    >
                                        <OptimizedImage
                                            src={photo}
                                            alt={`Apartment view ${index + 2}`}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            placeholder="skeleton"
                                            lazy={true}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                        
                                        {/* Click to expand indicator */}
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <div className="bg-white/90 backdrop-blur-sm rounded-full p-2">
                                                <Camera className="w-5 h-5 text-gray-800" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Additional Images Grid */}
                        {apartment.photos.length > 3 && (
                            <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {apartment.photos.slice(3).map((photo, index) => (
                                    <div 
                                        key={index + 3} 
                                        className="group relative aspect-square rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
                                        onClick={() => openLightbox(index + 3)}
                                    >
                                        <img
                                            src={photo}
                                            alt={`Apartment detail ${index + 4}`}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300"></div>
                                        
                                        {/* Click to expand indicator */}
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <div className="bg-white/90 backdrop-blur-sm rounded-full p-2">
                                                <Plus className="w-5 h-5 text-gray-800" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* View All Button */}
                        {apartment.photos.length > 1 && (
                            <div className="text-center mt-12">
                                <button
                                    onClick={() => openLightbox(0)}
                                    className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-xl"></div>
                                    <Camera className="w-5 h-5" />
                                    <span>
                                        {language === 'bg' ? 
                                            `Вижте всички ${apartment.photos.length} снимки` : 
                                            `View all ${apartment.photos.length} photos`
                                        }
                                    </span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Interesting Places */}
            {places.length > 0 && (
                <div id="places-section" className="bg-gray-100 py-16 sm:py-24">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        {/* Places Header */}
                        <div className="mb-12">
                            <div className="flex items-center justify-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-cyan-600 rounded-xl flex items-center justify-center">
                                    <MapPin className="w-6 h-6 text-white" />
                                </div>
                                <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-indigo-700 to-cyan-800 bg-clip-text text-transparent">
                                    {t('interestingPlaces')}
                    </h2>
                            </div>
                            <p className="text-xl text-gray-600 text-center max-w-3xl mx-auto">
                                {language === 'bg' ?
                                    'Открийте най-интересните места в близост до апартамента' :
                                    'Discover the most interesting places near the apartment'
                                }
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {places.map(place => {
                                return (
                                    <div key={place.id} className="bg-white rounded-xl shadow-lg overflow-hidden group transition-transform duration-300 hover:scale-105 flex flex-col">
                                        <div className="relative">
                                            <img src={place.imageUrl} alt={place.title[language] || ''} className="w-full h-56 object-cover" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                                            <div className="absolute bottom-0 left-0 p-6">
                                                <h3 className="text-2xl font-bold text-white drop-shadow-lg">{place.title[language] || place.title['bg']}</h3>
                                            </div>
                                        </div>
                                        <div className="p-6 flex flex-col flex-grow">
                                            <p className="text-gray-600 mb-4 h-24 overflow-y-auto flex-grow">{place.description[language] || place.description['bg']}</p>
                                            <div className="space-y-3 text-sm mb-6">
                                                {place.distance != null && (
                                                    <div className="flex items-center text-gray-700">
                                                        <Milestone className="h-5 w-5 mr-3 text-gray-400 flex-shrink-0" />
                                                        <span>{place.distance} {t('kmAway')}</span>
                                                    </div>
                                                )}
                                                {place.location && (
                                                    <div className="flex items-center text-gray-700">
                                                        <MapPin className="h-5 w-5 mr-3 text-gray-400 flex-shrink-0" />
                                                        <a
                                                            href={place.location}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="hover:underline"
                                                        >
                                                            {t('viewOnMap')}
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                            {place.url && (
                                                <div className="mt-auto pt-4 border-t border-gray-200">
                                                    <a
                                                        href={place.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="w-full flex items-center justify-center px-4 py-2.5 border border-transparent text-sm font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
                                                    >
                                                        <LinkIcon className="h-5 w-5 mr-2" />
                                                        {t('learnMore')}
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Floating Call Button */}
            {apartment?.contactPhone && (
                <div className="fixed bottom-6 right-6 z-50">
                    <button
                        onClick={handleCallOwner}
                        className="group relative bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-3 px-4 py-3 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-500/30"
                        aria-label={language === 'bg' ? 'Обадете се на собственика' : 'Call the owner'}
                    >
                        {/* Background glow effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-xl scale-110"></div>

                        {/* Phone icon */}
                        <Phone className="w-5 h-5 text-white transform group-hover:rotate-12 transition-transform duration-300 flex-shrink-0" />

                        {/* Contact info */}
                        <div className="flex flex-col text-left">
                            {/* Contact name if available */}
                            {getContactName() && (
                                <span className="text-white font-semibold text-sm whitespace-nowrap">
                                    {getContactName()}
                                </span>
                            )}
                            {/* Phone number */}
                            <span className={`text-white text-sm whitespace-nowrap ${getContactName() ? 'font-medium opacity-90' : 'font-semibold'}`}>
                                {apartment.contactPhone}
                            </span>
                        </div>

                        {/* Pulse animation */}
                        <div className="absolute inset-0 rounded-full border-2 border-green-400 opacity-0 group-hover:opacity-100 animate-ping"></div>
                    </button>

                    {/* Tooltip */}
                    <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
                        <div className="bg-gray-900 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap shadow-lg">
                            {getContactName() 
                                ? `${language === 'bg' ? 'Обадете се на' : 'Call'} ${getContactName()}`
                                : (language === 'bg' ? 'Обадете се на собственика' : 'Call the owner')
                            }
                            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900"></div>
                        </div>
                    </div>
                </div>
            )}

            {/* Lightbox Modal */}
            {showLightbox && apartment.photos && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="relative w-full max-w-6xl mx-auto">
                        {/* Close Button */}
                        <button
                            onClick={() => setShowLightbox(false)}
                            className="absolute top-4 right-4 z-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full p-3 text-white transition-all duration-300"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        
                        {/* Gallery */}
                        <ImageGallery
                            items={galleryImages}
                            showPlayButton={false}
                            showFullscreenButton={true}
                            slideInterval={5000}
                            showThumbnails={true}
                            showNav={true}
                            autoPlay={false}
                            startIndex={lightboxStartIndex}
                        />
                    </div>
                </div>
            )}

            <BookingModal
                isOpen={isBookingModalOpen}
                onClose={() => setIsBookingModalOpen(false)}
                apartmentId={apartment.id}
                onBookingConfirmed={handleBookingConfirmed}
            />
        </div>
    );
};

export default ApartmentDetail;
