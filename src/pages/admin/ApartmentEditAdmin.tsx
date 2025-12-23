import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, auth } from '../../firebase';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc, collection, getDocs, addDoc, deleteDoc, DocumentData, getDoc, serverTimestamp } from 'firebase/firestore';
import { generateSurveyToken, generateSurveyUrl } from '../../lib/surveyUtils';
import { useAdminLanguage } from '../../hooks/useAdminLanguage';
import { useLanguage } from '../../hooks/useLanguage';
import { useAuth } from '../../contexts/AuthContext';
import { Language } from '../../contexts/LanguageContext';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS, bg } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import { Button } from "../../components/ui/button";
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { slugify } from '../../lib/utils';
import { safeToDate } from '../../utils/dateUtils';
import {
    MoreVertical, Trash2, Home, Star, ExternalLink,
    Wifi, Snowflake, Thermometer, ChefHat, RefrigeratorIcon, Zap,
    Waves, Shield, Car, Baby, Dumbbell, Coffee, Monitor, TreePine,
    MapPin, Users, Bed, Bath, Sofa, Utensils, WashingMachine,
    FlameKindling, AirVent, Tv, Car as ParkingIcon, Building,
    PersonStanding, Gamepad2, Sparkles, Home as HouseIcon, Plane,
    Flower, ShoppingCart, Heart, Music, Camera, Book, Wine,
    Microwave, Sun, Wind, Shirt, Trees, Flame, Palmtree, Mountain,
    Ban, ArrowUp, CloudRain, Droplets, Plus, Lock, Package,
    Accessibility, Laptop, Smartphone, Headphones, Speaker, Router,
    Armchair, Lamp, Fan, Clock, Phone, Mail, Cigarette, BookOpen,
    Newspaper, Globe, Stethoscope, Activity, Bike, Bus, Train, Ship,
    Fuel, Briefcase, Printer, FileText, Calculator, Umbrella, Glasses,
    Watch, Key, Bell, AlertTriangle, Dog, Cat, Fish, Bird, Store,
    ShoppingBag, Gift, Award, Cloud, CloudSnow, CloudLightning,
    Sunrise, Sandwich, Apple, WifiOff, UserCheck, Check,
    ArrowLeft,
    ArrowLeftCircleIcon,
    ArrowRightFromLine,
    ArrowRightCircleIcon,
    ArrowRight, LogOut, ChevronDown
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import RentalPeriodModal from '../../components/admin/RentalPeriodModal';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Booking, PricingOffer, Amenity, Apartment } from '../../types';
import {
    ApartmentDetailsTab,
    ApartmentAmenitiesTab,
    ApartmentGalleryTab,
    ApartmentPricingTab,
    ApartmentCalendarTab,
    ApartmentFeedbackTab,
    ApartmentTestimonialsTab
} from '../../components/admin/apartment-edit';

const storage = getStorage();

const locales = {
    en: enUS,
    bg: bg,
};

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
    { id: 'laptop-workspace', name: 'Laptop Workspace', icon: Laptop },
    { id: 'smartphone-charging', name: 'Phone Charging', icon: Smartphone },
    { id: 'headphones', name: 'Headphones Available', icon: Headphones },
    { id: 'speakers', name: 'Sound System', icon: Speaker },
    { id: 'router', name: 'High-Speed Router', icon: Router },
    { id: 'monitor', name: 'External Monitor', icon: Monitor },
    { id: 'phone-landline', name: 'Landline Phone', icon: Phone },
    { id: 'email-service', name: 'Email Service', icon: Mail },
    { id: 'armchair', name: 'Comfortable Armchair', icon: Armchair },
    { id: 'desk-lamp', name: 'Desk Lamp', icon: Lamp },
    { id: 'ceiling-fan', name: 'Ceiling Fan', icon: Fan },
    { id: 'clock', name: 'Clock', icon: Clock },
    { id: 'books', name: 'Books Available', icon: BookOpen },
    { id: 'newspapers', name: 'Newspapers', icon: Newspaper },
    { id: 'local-info', name: 'Local Information', icon: Globe },
    { id: 'wine-glasses', name: 'Wine Service', icon: Wine },
    { id: 'first-aid-advanced', name: 'Medical Kit', icon: Stethoscope },
    { id: 'exercise-area', name: 'Exercise Area', icon: Activity },
    { id: 'bike-rental', name: 'Bike Rental', icon: Bike },
    { id: 'bus-stop', name: 'Near Bus Stop', icon: Bus },
    { id: 'train-station', name: 'Near Train Station', icon: Train },
    { id: 'airport-shuttle', name: 'Airport Shuttle', icon: Plane },
    { id: 'boat-trips', name: 'Boat Trips', icon: Ship },
    { id: 'fuel-station', name: 'Near Fuel Station', icon: Fuel },
    { id: 'business-center', name: 'Business Center', icon: Briefcase },
    { id: 'booking-service', name: 'Booking Service', icon: Briefcase },
    { id: 'printer-access', name: 'Printer Access', icon: Printer },
    { id: 'documents', name: 'Document Service', icon: FileText },
    { id: 'calculator', name: 'Calculator', icon: Calculator },
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
    { id: 'dog-friendly', name: 'Dog Friendly', icon: Dog },
    { id: 'cat-friendly', name: 'Cat Friendly', icon: Cat },
    { id: 'fish-watching', name: 'Fish Watching', icon: Fish },
    { id: 'bird-watching', name: 'Bird Watching', icon: Bird },
    { id: 'nearby-shops', name: 'Nearby Shops', icon: Store },
    { id: 'shopping-assistance', name: 'Shopping Service', icon: ShoppingBag },
    { id: 'gift-service', name: 'Gift Service', icon: Gift },
    { id: 'rated-service', name: 'Rated Service', icon: Star },
    { id: 'award-winning', name: 'Award Winning', icon: Award },
    { id: 'snacks', name: 'Snacks Available', icon: Sandwich },
    { id: 'fresh-fruit', name: 'Fresh Fruit', icon: Apple },
    { id: 'smoking-area', name: 'Smoking Area', icon: Cigarette }
];

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

const DragAndDropCalendar = withDragAndDrop(Calendar);

type GalleryItem = {
    id: string;
    url: string;
    file?: File;
};

const ApartmentEditAdmin: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const { language } = useLanguage();
    const { t, language: adminLanguage, setLanguage: setAdminLanguage } = useAdminLanguage();
    const { isSuperAdmin, userId, user } = useAuth();
    const [apartment, setApartment] = useState<Apartment | null>(null);
    const [currentApartmentData, setCurrentApartmentData] = useState<Partial<Apartment>>({});
    const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [accessDenied, setAccessDenied] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const userMenuRef = useRef<HTMLDivElement>(null);

    // Handle click outside to close user menu
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setIsUserMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Automatically generate survey links for bookings that don't have them
    // NOTE: Survey links are now only created during booking creation, not auto-generated

    // Confirmation dialog state
    const [confirmationDialog, setConfirmationDialog] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
        onCancel: () => void;
    }>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
        onCancel: () => { }
    });

    const showConfirmation = (title: string, message: string, onConfirm: () => void) => {
        setConfirmationDialog({
            isOpen: true,
            title,
            message,
            onConfirm: () => {
                onConfirm();
                setConfirmationDialog(prev => ({ ...prev, isOpen: false }));
            },
            onCancel: () => {
                setConfirmationDialog(prev => ({ ...prev, isOpen: false }));
            }
        });
    };

    const [view, setView] = useState<'details' | 'amenities' | 'calendar' | 'pricing' | 'gallery' | 'feedback' | 'testimonials'>('details');
    const [formLanguage, setFormLanguage] = useState<'bg' | 'en'>('bg');
    const [isRentalModalOpen, setIsRentalModalOpen] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null);
    const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
    const [isPricingOfferModalOpen, setIsPricingOfferModalOpen] = useState(false);
    const [editingPricingOffer, setEditingPricingOffer] = useState<PricingOffer | null>(null);
    const [newPricingOffer, setNewPricingOffer] = useState<Partial<PricingOffer & { pricePerNightBGN: number; pricePerNightEUR: number }>>({
        name: '',
        days: 0,
        price: 0,
        pricePerNightBGN: 0,
        pricePerNightEUR: 0,
        isSuperSpecial: false,
        superSpecialUntil: undefined,
        description: ''
    });
    const [isBasePriceModalOpen, setIsBasePriceModalOpen] = useState(false);
    const [editingBasePrice, setEditingBasePrice] = useState(false);
    const [newBasePrice, setNewBasePrice] = useState<{ priceBGN: number; priceEUR: number; description: string }>({
        priceBGN: 0,
        priceEUR: 0,
        description: ''
    });
    const [availableAmenities, setAvailableAmenities] = useState<Amenity[]>([]);
    const EUR_TO_BGN_RATE = 1.95583;

    const convertBgnToEur = (bgnPrice: number): number => {
        return Math.ceil(bgnPrice / EUR_TO_BGN_RATE);
    };

    const getBookingTypeTranslation = (type: string): string => {
        switch (type) {
            case 'rental':
            case 'maintenance':
            case 'booked':
                return t('bookingTypeBooked');
            case 'blocked':
                return t('bookingTypeBlocked');
            default:
                return t('bookingTypeBooked');
        }
    };

    const fetchAvailableAmenities = useCallback(async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "amenities"));
            const amenitiesList = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Amenity));
            setAvailableAmenities(amenitiesList);
        } catch (error) {
            console.error("Error fetching amenities: ", error);
        }
    }, []);

    const getAmenityTranslation = (amenity: string): string => {
        const availableAmenity = availableAmenities.find(a => a.en === amenity || a.bg === amenity || a.id === amenity);
        if (availableAmenity && (formLanguage === 'en' || formLanguage === 'bg')) {
            return availableAmenity[formLanguage as 'en' | 'bg'];
        }
        return amenity;
    };

    const convertEurToBgn = (eurPrice: number): number => {
        return eurPrice * EUR_TO_BGN_RATE;
    };

    const handleDeleteBooking = async (bookingId: string) => {
        try {
            if (!apartment?.id) {
                throw new Error('Apartment ID not found');
            }
            await deleteDoc(doc(db, `apartments/${apartment.id}/bookings`, bookingId));
            setBookings(prev => prev.filter(booking => booking.id !== bookingId));
        } catch (error) {
            console.error('Error deleting booking:', error);
            alert(language === 'bg' ? 'Грешка при изтриването на резервацията' : 'Error deleting booking');
        }
    };

    const renderAmenityIcon = (amenity: string) => {
        // First try to find icon from Firebase amenities
        const amenityData = availableAmenities.find(a => a.en === amenity || a.bg === amenity || a.id === amenity);
        if (amenityData?.icon) {
            const iconData = AVAILABLE_ICONS.find(icon => icon.id === amenityData.icon);
            if (iconData) {
                const IconComponent = iconData.icon;
                return <IconComponent className="w-5 h-5 text-blue-600" />;
            }
        }

        // Fallback: try to match by name
        const fallbackIcon = AVAILABLE_ICONS.find(icon =>
            icon.name.toLowerCase() === amenity.toLowerCase() ||
            amenity.toLowerCase().includes(icon.id)
        );
        if (fallbackIcon) {
            const IconComponent = fallbackIcon.icon;
            return <IconComponent className="w-5 h-5 text-blue-600" />;
        }

        // Default checkmark if no icon found
        return <Check className="w-5 h-5 text-green-500" />;
    };

    const fetchBookings = useCallback(async (apartmentId: string) => {
        if (!apartmentId) return;
        try {
            const bookingsSnapshot = await getDocs(collection(db, `apartments/${apartmentId}/bookings`));
            const bookingsData = bookingsSnapshot.docs.map((doc: DocumentData) => {
                const data = doc.data();
                let title = 'Rental';
                const bookingType = data.type || 'rental';

                if (bookingType === 'rental' && data.visitorName) {
                    title = data.visitorName;
                } else if (bookingType === 'maintenance') {
                    title = 'Maintenance';
                } else if (bookingType === 'blocked') {
                    title = 'Blocked';
                } else {
                    title = 'Rental';
                }

                return {
                    id: doc.id,
                    apartmentId: apartmentId,
                    start: safeToDate(data.start),
                    end: safeToDate(data.end),
                    title,
                    visitorName: data.visitorName,
                    isRentalPeriod: data.isRentalPeriod || (data.type || 'rental') === 'rental',
                    type: data.type || 'rental',
                    pricingOfferId: data.pricingOfferId,
                    customPrice: data.customPrice,
                    totalPrice: data.totalPrice,
                    deposit: data.deposit,
                    depositCurrency: data.depositCurrency,
                    status: data.status,
                    guestEmail: data.guestEmail
                };
            });
            setBookings(bookingsData);
        } catch (error) {
            console.error('Error fetching bookings:', error);
            console.log('No old bookings found or permission denied:', error);
            // Set empty bookings array instead of failing
            setBookings([]);
        }
    }, []);

    const fetchApartment = useCallback(async () => {
        if (!slug || !userId) return;
        setLoading(true);
        try {
            const querySnapshot = await getDocs(collection(db, "apartments"));
            const aptDoc = querySnapshot.docs.find((doc: DocumentData) => doc.data().slug === slug);

            if (aptDoc) {
                const aptData = { id: aptDoc.id, ...aptDoc.data() } as Apartment;

                // Check access control - user can only access their own apartments unless they're super admin
                if (!isSuperAdmin && aptData.ownerId !== userId) {
                    setAccessDenied(true);
                    console.error('Access denied: User does not own this apartment');
                    return;
                }

                setApartment(aptData);
                setCurrentApartmentData(JSON.parse(JSON.stringify(aptData)));
                if (aptData.photos) {
                    setGalleryItems(aptData.photos.map((url) => ({ 
                        id: `existing-${url.split('/').pop()?.split('?')[0] || Math.random().toString(36)}`, 
                        url 
                    })));
                }
                // Try to fetch bookings, but don't fail if it doesn't work
                try {
                    await fetchBookings(aptDoc.id);
                } catch (bookingError) {
                    console.error('Failed to fetch bookings, continuing without them:', bookingError);
                }
            } else {
                console.error('No apartment found with slug:', slug);
            }
        } catch (error) {
            console.error('Error fetching apartment:', error);
            // Don't set accessDenied here - just log the error and continue
        } finally {
            setLoading(false);
        }
    }, [slug, fetchBookings, userId, isSuperAdmin]);

    useEffect(() => {
        fetchApartment();
        fetchAvailableAmenities();
    }, [fetchApartment, fetchAvailableAmenities]);

    // dnd-kit handles reordering directly in ApartmentGalleryTab

    const handleAmenitiesOnDragEnd = (result: DropResult) => {
        if (!result.destination) return;
        const currentAmenities = currentApartmentData.amenities || [];
        const items = Array.from(currentAmenities);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);
        setCurrentApartmentData(prev => ({ ...prev, amenities: items, amenityOrder: items }));
    };

    const handleImageDelete = (idToDelete: string) => {
        const itemToDelete = galleryItems.find(item => item.id === idToDelete);
        if (itemToDelete && itemToDelete.file) {
            URL.revokeObjectURL(itemToDelete.url);
        }
        setGalleryItems(galleryItems.filter(item => item.id !== idToDelete));
    };

    const handleSetHeroImage = (imageUrl: string) => {
        setCurrentApartmentData(prev => ({ ...prev, heroImage: imageUrl }));
    };

    const handleToggleFavouriteImage = (imageUrl: string) => {
        setCurrentApartmentData(prev => {
            const currentFavourites = prev.favouriteImages || [];
            const isFavourite = currentFavourites.includes(imageUrl);
            if (isFavourite) {
                return { ...prev, favouriteImages: currentFavourites.filter(url => url !== imageUrl) };
            } else {
                if (currentFavourites.length >= 5) {
                    alert(t('maxFavouriteImagesReached'));
                    return prev;
                }
                return { ...prev, favouriteImages: [...currentFavourites, imageUrl] };
            }
        });
    };

    const handleContactChange = (lang: 'bg' | 'en', field: 'name' | 'email', value: string) => {
        setCurrentApartmentData(prev => ({
            ...prev,
            contacts: {
                ...prev.contacts,
                [lang]: {
                    ...prev.contacts?.[lang],
                    [field]: value,
                }
            }
        }));
    };

    const handleNameChange = (lang: 'bg' | 'en', value: string) => {
        setCurrentApartmentData(prev => ({ ...prev, name: { ...prev.name, [lang]: value } }));
    };

    const handleAmenityToggle = (amenity: string) => {
        const currentAmenities = currentApartmentData.amenities || [];
        const isSelected = currentAmenities.includes(amenity);
        let updatedAmenities;
        if (isSelected) {
            updatedAmenities = currentAmenities.filter(a => a !== amenity);
        } else {
            updatedAmenities = [...currentAmenities, amenity];
        }
        setCurrentApartmentData(prev => ({ ...prev, amenities: updatedAmenities }));
    };

    const handleCustomAmenityAdd = (customAmenity: string) => {
        if (!customAmenity.trim()) return;
        const currentAmenities = currentApartmentData.amenities || [];
        if (currentAmenities.includes(customAmenity.trim())) return;
        const updatedAmenities = [...currentAmenities, customAmenity.trim()];
        setCurrentApartmentData(prev => ({ ...prev, amenities: updatedAmenities }));
    };

    const handleAmenityRemove = (amenity: string) => {
        const currentAmenities = currentApartmentData.amenities || [];
        const updatedAmenities = currentAmenities.filter(a => a !== amenity);
        setCurrentApartmentData(prev => ({ ...prev, amenities: updatedAmenities }));
    };

    const handlePricingChange = (lang: Language, value: string) => {
        setCurrentApartmentData(prev => {
            const newPricing = { ...prev.pricing, perNight: { ...prev.pricing?.perNight, [lang]: Number(value) } };
            return { ...prev, pricing: newPricing };
        });
    };

    const handleSave = async () => {
        if (!currentApartmentData || !apartment) return;
        
        console.log('Saving apartment data:', currentApartmentData);
        
        setLoading(true);
        setSaveSuccess(false);

        const newImageFiles = galleryItems.filter(item => item.file);
        let uploadedImageUrls: string[] = [];

        if (newImageFiles.length > 0) {
            const uploadPromises = newImageFiles.map(async (item) => {
                if (!item.file) return null;
                // Use apartment ID for consistent folder structure
                const apartmentId = apartment.id;
                const timestamp = Date.now();
                const fileName = `${timestamp}_${item.file.name}`;
                const storageRef = ref(storage, `apartments/${apartmentId}/photos/${fileName}`);
                await uploadBytes(storageRef, item.file);
                return getDownloadURL(storageRef);
            });
            try {
                const results = await Promise.all(uploadPromises);
                uploadedImageUrls = results.filter((url): url is string => url !== null);
            } catch (error) {
                console.error("Error uploading images: ", error);
                setLoading(false);
                return;
            }
        }

        const finalPhotoUrls = galleryItems.map(item => {
            if (!item.file) return item.url;
            // Match by file name in the URL (now includes timestamp prefix)
            const fileName = item.file!.name;
            const newUrl = uploadedImageUrls.find(url => url.includes(encodeURIComponent(fileName)));
            return newUrl || item.url;
        });

        let finalHeroImage = currentApartmentData.heroImage;
        if (finalHeroImage) {
            const heroItem = galleryItems.find(item => item.url === finalHeroImage);
            if (heroItem?.file) {
                const fileName = heroItem.file!.name;
                finalHeroImage = uploadedImageUrls.find(url => url.includes(encodeURIComponent(fileName))) || finalHeroImage;
            }
        }

        let finalFavouriteImages = currentApartmentData.favouriteImages || [];
        if (finalFavouriteImages.length > 0) {
            finalFavouriteImages = finalFavouriteImages.map(favUrl => {
                const favItem = galleryItems.find(item => item.url === favUrl);
                if (favItem?.file) {
                    const fileName = favItem.file!.name;
                    return uploadedImageUrls.find(url => url.includes(encodeURIComponent(fileName))) || favUrl;
                }
                return favUrl;
            }).filter(url => url !== undefined);
        }

        const apartmentData: Partial<Apartment> = {
            ...currentApartmentData,
            slug: apartment.slug,
            photos: finalPhotoUrls,
            heroImage: finalHeroImage,
            favouriteImages: finalFavouriteImages,
        };
        delete apartmentData.id;
        delete (apartmentData as any).surveyQuestions; // Remove old array

        const cleanApartmentData: Record<string, any> = {};
        Object.entries(apartmentData).forEach(([key, value]) => {
            if (value !== undefined) {
                cleanApartmentData[key] = value;
            }
        });

        try {
            console.log('Updating apartment document with:', cleanApartmentData);
            await updateDoc(doc(db, 'apartments', apartment.id), cleanApartmentData);
            console.log('Apartment saved successfully!');
            setSaveSuccess(true);
            setGalleryItems(finalPhotoUrls.map((url) => ({ 
                id: `existing-${url.split('/').pop()?.split('?')[0] || Math.random().toString(36)}`, 
                url 
            })));
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (error) {
            console.error("Error saving apartment: ", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveRentalPeriod = async (data: any) => {
        if (!apartment) return;
        const hasOverlap = bookings.some(existingBooking => data.startDate < existingBooking.end && existingBooking.start < data.endDate);
        if (hasOverlap) {
            alert('This booking overlaps with an existing booking.');
            return;
        }
        setLoading(true);
        let title = 'Booked';
        if (data.type === 'booked' && data.visitorName) {
            title = data.visitorName;
        } else if (data.type === 'blocked') {
            title = 'Blocked';
        }
        const newBooking: any = {
            start: data.startDate,
            end: data.endDate,
            title,
            isRentalPeriod: data.type === 'booked',
            type: data.type,
            createdAt: serverTimestamp()
        };
        
        // Core booking fields
        if (data.visitorName) newBooking.visitorName = data.visitorName;
        if (data.notes) newBooking.notes = data.notes;
        
        // Pricing fields
        if (data.pricingOfferId) newBooking.pricingOfferId = data.pricingOfferId;
        if (data.customPrice) newBooking.customPrice = data.customPrice;
        if (data.totalPrice) newBooking.totalPrice = data.totalPrice;
        
        // Payment fields
        if (data.deposit) newBooking.deposit = data.deposit;
        if (data.depositCurrency) newBooking.depositCurrency = data.depositCurrency;
        if (data.status) newBooking.status = data.status;
        
        // Guest contact fields
        if (data.guestEmail) newBooking.guestEmail = data.guestEmail;
        if (data.guestPhone) newBooking.guestPhone = data.guestPhone;
        
        // Survey fields
        if (data.surveyLanguage) newBooking.surveyLanguage = data.surveyLanguage;
        
        // Initialize survey completion tracking
        newBooking.surveyCompleted = false;
        newBooking.surveyEmailSent = false;

        // Generate survey token and URL for booked types
        if (data.type === 'booked') {
            const surveyToken = generateSurveyToken();
            newBooking.surveyToken = surveyToken;
            // URL will be generated after we get the booking ID
        }

        try {
            const bookingRef = await addDoc(collection(db, `apartments/${apartment.id}/bookings`), newBooking);

            // Generate and update survey URL if it's a booking
            if (data.type === 'booked' && newBooking.surveyToken) {
                const surveyUrl = generateSurveyUrl(bookingRef.id, newBooking.surveyToken, undefined, data.surveyLanguage);
                await updateDoc(bookingRef, { surveyUrl });
                newBooking.surveyUrl = surveyUrl;
            }
            setBookings(prev => [...prev, { ...newBooking, id: bookingRef.id, apartmentId: apartment.id }]);
            setIsRentalModalOpen(false);
            setSelectedSlot(null);
        } catch (error) {
            alert(t('errorCreatingRentalPeriod'));
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateBooking = async (bookingId: string, data: any) => {
        if (!apartment) return;
        const hasOverlap = bookings.some(existingBooking => {
            if (existingBooking.id === bookingId) return false;
            return data.startDate < existingBooking.end && existingBooking.start < data.endDate;
        });
        if (hasOverlap) {
            alert('This booking overlaps with an existing booking.');
            return;
        }
        setLoading(true);
        let title = 'Booked';
        if (data.type === 'booked' && data.visitorName) {
            title = data.visitorName;
        } else if (data.type === 'blocked') {
            title = 'Blocked';
        }
        const updatedBooking: any = {
            start: data.startDate,
            end: data.endDate,
            title,
            isRentalPeriod: data.type === 'booked',
            type: data.type,
            updatedAt: serverTimestamp()
        };
        
        // Core booking fields - handle both setting and clearing
        updatedBooking.visitorName = data.visitorName || null;
        updatedBooking.notes = data.notes || null;
        
        // Pricing fields
        updatedBooking.pricingOfferId = data.pricingOfferId || null;
        updatedBooking.customPrice = data.customPrice || null;
        updatedBooking.totalPrice = data.totalPrice || null;
        
        // Payment fields
        updatedBooking.deposit = data.deposit || null;
        updatedBooking.depositCurrency = data.depositCurrency || null;
        updatedBooking.status = data.status || null;
        
        // Guest contact fields
        updatedBooking.guestEmail = data.guestEmail || null;
        updatedBooking.guestPhone = data.guestPhone || null;
        
        // Survey fields
        updatedBooking.surveyLanguage = data.surveyLanguage || null;

        // Handle survey token and URL - preserve existing values only
        if (data.surveyToken) updatedBooking.surveyToken = data.surveyToken;
        if (data.surveyUrl) updatedBooking.surveyUrl = data.surveyUrl;

        // Survey tokens are only created during initial booking creation, not during updates

        try {
            await updateDoc(doc(db, `apartments/${apartment.id}/bookings`, bookingId), updatedBooking);
            setBookings(prev => prev.map(booking => booking.id === bookingId ? { ...booking, ...updatedBooking, apartmentId: apartment.id } : booking));
            setIsRentalModalOpen(false);
            setEditingBooking(null);
        } catch (error) {
            alert(t('errorUpdatingBooking'));
        } finally {
            setLoading(false);
        }
    };

    const handleAddPricingOffer = async () => {
        if (!newPricingOffer.name || !newPricingOffer.days || !newPricingOffer.pricePerNightEUR) {
            alert(t('pleaseCompleteRequiredFields'));
            return;
        }
        const computedPriceBGN = Math.round(convertEurToBgn(newPricingOffer.pricePerNightEUR!));
        const pricingOffer: PricingOffer = {
            id: `offer-${Date.now()}`,
            name: newPricingOffer.name!,
            days: newPricingOffer.days!,
            price: newPricingOffer.pricePerNightEUR!,
            priceBGN: computedPriceBGN,
            priceEUR: newPricingOffer.pricePerNightEUR!,
            isSuperSpecial: !!newPricingOffer.isSuperSpecial,
            superSpecialUntil: newPricingOffer.isSuperSpecial ? (newPricingOffer.superSpecialUntil || undefined) : undefined,
            description: newPricingOffer.description || ''
        };
        const existingOffers = currentApartmentData.pricingOffers || [];
        const normalizedExistingOffers = pricingOffer.isSuperSpecial
            ? existingOffers.map(o => ({ ...o, isSuperSpecial: false }))
            : existingOffers;
        const updatedOffers = [...normalizedExistingOffers, pricingOffer];
        setCurrentApartmentData(prev => ({ ...prev, pricingOffers: updatedOffers }));
        if (apartment) {
            try {
                setLoading(true);
                await updateDoc(doc(db, 'apartments', apartment.id), { pricingOffers: updatedOffers });
                setSaveSuccess(true);
                setTimeout(() => setSaveSuccess(false), 3000);
            } catch (error) {
                setCurrentApartmentData(prev => ({ ...prev, pricingOffers: currentApartmentData.pricingOffers || [] }));
                alert(t('errorAddingPricingOffer'));
                return;
            } finally {
                setLoading(false);
            }
        }
        setNewPricingOffer({ name: '', days: 0, price: 0, pricePerNightBGN: 0, pricePerNightEUR: 0, isSuperSpecial: false, superSpecialUntil: undefined, description: '' });
        setIsPricingOfferModalOpen(false);
    };

    const handleEditPricingOffer = (offer: PricingOffer) => {
        setEditingPricingOffer(offer);
        const eurPrice = (offer as any).priceEUR || offer.price || ((offer as any).priceBGN ? convertBgnToEur((offer as any).priceBGN) : 0);
        const bgnPrice = (offer as any).priceBGN || Math.round(convertEurToBgn(eurPrice));
        const bgnPricePerNight = bgnPrice > 500 ? bgnPrice / offer.days : bgnPrice;
        const eurPricePerNight = eurPrice > 250 ? eurPrice / offer.days : eurPrice;
        setNewPricingOffer({ name: offer.name, days: offer.days, price: offer.price, pricePerNightBGN: bgnPricePerNight, pricePerNightEUR: eurPricePerNight, isSuperSpecial: !!(offer as any).isSuperSpecial, superSpecialUntil: (offer as any).superSpecialUntil || undefined, description: offer.description || '' });
        setIsPricingOfferModalOpen(true);
    };

    const handleUpdatePricingOffer = async () => {
        if (!editingPricingOffer || !newPricingOffer.name || !newPricingOffer.days || !newPricingOffer.pricePerNightEUR) {
            alert(t('pleaseCompleteRequiredFields'));
            return;
        }
        const computedPriceBGN = Math.round(convertEurToBgn(newPricingOffer.pricePerNightEUR!));
        const updatedOffer: PricingOffer = {
            ...editingPricingOffer,
            name: newPricingOffer.name!,
            days: newPricingOffer.days!,
            price: newPricingOffer.pricePerNightEUR!,
            priceBGN: computedPriceBGN,
            priceEUR: newPricingOffer.pricePerNightEUR!,
            isSuperSpecial: !!newPricingOffer.isSuperSpecial,
            superSpecialUntil: newPricingOffer.isSuperSpecial ? (newPricingOffer.superSpecialUntil || undefined) : undefined,
            description: newPricingOffer.description || ''
        };
        const originalOffers = currentApartmentData.pricingOffers || [];
        const updatedOffers = originalOffers.map(offer => {
            if (offer.id === editingPricingOffer.id) return updatedOffer;
            if (updatedOffer.isSuperSpecial) return { ...offer, isSuperSpecial: false };
            return offer;
        });
        setCurrentApartmentData(prev => ({ ...prev, pricingOffers: updatedOffers }));
        if (apartment) {
            try {
                setLoading(true);
                await updateDoc(doc(db, 'apartments', apartment.id), { pricingOffers: updatedOffers });
                setSaveSuccess(true);
                setTimeout(() => setSaveSuccess(false), 3000);
            } catch (error) {
                setCurrentApartmentData(prev => ({ ...prev, pricingOffers: originalOffers }));
                alert(t('errorUpdatingPricingOffer'));
                return;
            } finally {
                setLoading(false);
            }
        }
        setNewPricingOffer({ name: '', days: 0, price: 0, pricePerNightBGN: 0, pricePerNightEUR: 0, isSuperSpecial: false, superSpecialUntil: undefined, description: '' });
        setEditingPricingOffer(null);
        setIsPricingOfferModalOpen(false);
    };

    const handleDeletePricingOffer = async (offerId: string) => {
        showConfirmation(
            t('confirmDelete') || 'Confirm Delete',
            t('confirmDeletePricingOffer') || 'Are you sure you want to delete this pricing offer?',
            async () => {
                const originalOffers = currentApartmentData.pricingOffers || [];
                const updatedOffers = originalOffers.filter(offer => offer.id !== offerId);
                setCurrentApartmentData(prev => ({ ...prev, pricingOffers: updatedOffers }));
                if (apartment) {
                    try {
                        setLoading(true);
                        await updateDoc(doc(db, 'apartments', apartment.id), { pricingOffers: updatedOffers });
                        setSaveSuccess(true);
                        setTimeout(() => setSaveSuccess(false), 3000);
                    } catch (error) {
                        setCurrentApartmentData(prev => ({ ...prev, pricingOffers: originalOffers }));
                        alert(t('errorDeletingPricingOffer'));
                    } finally {
                        setLoading(false);
                    }
                }
            }
        );
    };

    const handleReorderPricingOffer = async (offerId: string, direction: 'up' | 'down') => {
        const originalOffers = currentApartmentData.pricingOffers || [];
        const currentIndex = originalOffers.findIndex(o => o.id === offerId);
        if (currentIndex === -1) return;

        const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
        if (targetIndex < 0 || targetIndex >= originalOffers.length) return;

        const updatedOffers = [...originalOffers];
        const temp = updatedOffers[targetIndex];
        updatedOffers[targetIndex] = updatedOffers[currentIndex];
        updatedOffers[currentIndex] = temp;

        setCurrentApartmentData(prev => ({ ...prev, pricingOffers: updatedOffers }));

        if (!apartment) return;
        try {
            setLoading(true);
            await updateDoc(doc(db, 'apartments', apartment.id), { pricingOffers: updatedOffers });
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (error) {
            setCurrentApartmentData(prev => ({ ...prev, pricingOffers: originalOffers }));
            alert(t('errorUpdatingPricingOffer'));
        } finally {
            setLoading(false);
        }
    };

    const handleAddBasePrice = () => {
        setEditingBasePrice(false);
        const existingEur = currentApartmentData.pricing?.perNight?.en || 0;
        const existingBgn = currentApartmentData.pricing?.perNight?.bg || 0;
        const eurPrice = existingEur || (existingBgn > 0 ? convertBgnToEur(existingBgn) : 0);
        setNewBasePrice({ priceBGN: eurPrice > 0 ? Math.round(convertEurToBgn(eurPrice)) : 0, priceEUR: eurPrice, description: '' });
        setIsBasePriceModalOpen(true);
    };

    const handleEditBasePrice = () => {
        setEditingBasePrice(true);
        const existingEur = currentApartmentData.pricing?.perNight?.en || 0;
        const existingBgn = currentApartmentData.pricing?.perNight?.bg || 0;
        const eurPrice = existingEur || (existingBgn > 0 ? convertBgnToEur(existingBgn) : 0);
        setNewBasePrice({ priceBGN: eurPrice > 0 ? Math.round(convertEurToBgn(eurPrice)) : 0, priceEUR: eurPrice, description: '' });
        setIsBasePriceModalOpen(true);
    };

    const handleDeleteBasePrice = async () => {
        showConfirmation(
            t('confirmDelete') || 'Confirm Delete',
            t('confirmDeleteBasePrice') || 'Are you sure you want to delete the base price?',
            async () => {
                const originalPricing = currentApartmentData.pricing;
                setCurrentApartmentData(prev => ({ ...prev, pricing: { ...prev.pricing, perNight: {} } }));

                if (apartment) {
                    try {
                        setLoading(true);
                        await updateDoc(doc(db, 'apartments', apartment.id), {
                            'pricing.perNight': {}
                        });
                        setSaveSuccess(true);
                        setTimeout(() => setSaveSuccess(false), 3000);
                    } catch (error) {
                        // Revert on error
                        setCurrentApartmentData(prev => ({ ...prev, pricing: originalPricing }));
                        alert(t('errorDeletingBasePrice'));
                    } finally {
                        setLoading(false);
                    }
                }
            }
        );
    };

    const handleSaveBasePrice = async () => {
        if (!newBasePrice.priceEUR) {
            alert(t('pleaseCompleteRequiredFields'));
            return;
        }

        const computedPriceBGN = Math.round(convertEurToBgn(newBasePrice.priceEUR));

        const originalPricing = currentApartmentData.pricing;
        const updatedPricing = {
            ...currentApartmentData.pricing,
            perNight: {
                bg: computedPriceBGN,
                en: newBasePrice.priceEUR
            }
        };

        setCurrentApartmentData(prev => ({ ...prev, pricing: updatedPricing }));

        if (apartment) {
            try {
                setLoading(true);
                await updateDoc(doc(db, 'apartments', apartment.id), {
                    'pricing.perNight': {
                        bg: computedPriceBGN,
                        en: newBasePrice.priceEUR
                    }
                });
                setSaveSuccess(true);
                setTimeout(() => setSaveSuccess(false), 3000);
            } catch (error) {
                // Revert on error
                setCurrentApartmentData(prev => ({ ...prev, pricing: originalPricing }));
                alert(t('errorSavingBasePrice'));
                return;
            } finally {
                setLoading(false);
            }
        }

        setNewBasePrice({ priceBGN: 0, priceEUR: 0, description: '' });
        setIsBasePriceModalOpen(false);
        setEditingBasePrice(false);
    };

    if (loading) return <p>{t('loadingApartmentDetails')}</p>;
    if (accessDenied) {
        return (
            <div className="p-6 text-center">
                <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
                <p className="text-gray-600 mb-4">You don't have permission to edit this apartment.</p>
                <button
                    onClick={() => navigate('/admin/apartments')}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Go back to your apartments
                </button>
            </div>
        );
    }
    if (!apartment) return <p>{t('apartmentNotFound')}</p>;

    return (
        <div className="relative min-h-screen">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 sticky top-0 z-10">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-3 sm:gap-0">
                    <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
                        <button
                            onClick={() => navigate('/admin/apartments')}
                            className="flex items-center gap-2 px-2 sm:px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors group"
                        >
                            <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5 rotate-180 group-hover:transform group-hover:-translate-x-1 transition-transform" />
                        </button>
                        <div className="w-px h-6 bg-gray-300 hidden sm:block"></div>
                        
                        {/* Morence.top branding */}
                        <div className="flex items-center gap-3">
                            <div className="bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 backdrop-blur-sm border border-white/20 flex items-center gap-2">
                                <Waves className="w-4 h-4 text-white animate-pulse" />
                                <div className="flex items-baseline">
                                    <span className="text-white text-sm font-bold tracking-wider uppercase bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">morence</span>
                                    <span className="text-blue-100 text-xs font-light">.top</span>
                                </div>
                            </div>
                            <div className="w-px h-6 bg-gray-300 hidden sm:block"></div>
                        </div>
                        
                        <h1 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">
                            {apartment.name?.[language as 'bg' | 'en'] || apartment.name?.en || apartment.name?.bg || 'Apartment'}
                        </h1>
                        <button
                            onClick={() => open(`/apartments/${slug}`, "_blank")}
                            className="flex items-center justify-center p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors group"
                            title={t('viewPublicPage')}
                        >
                            <ExternalLink className="w-5 h-5 group-hover:transform group-hover:scale-110 transition-transform" />
                        </button>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        {/* User Avatar with Dropdown */}
                        {user && (
                            <div className="relative" ref={userMenuRef}>
                                <button
                                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                    className="flex items-center gap-1 hover:opacity-80 transition-opacity cursor-pointer"
                                >
                                    {user.photoURL ? (
                                        <img
                                            src={user.photoURL}
                                            alt={user.displayName || user.email || 'User'}
                                            className="w-8 h-8 rounded-full object-cover"
                                            referrerPolicy="no-referrer"
                                        />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-semibold">
                                            {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <ChevronDown className="w-4 h-4 text-gray-500" />
                                </button>

                                {/* Dropdown Menu */}
                                {isUserMenuOpen && (
                                    <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                                        <div className="py-1">
                                            {/* User Info */}
                                            <div className="px-3 py-2 border-b border-gray-100">
                                                <div className="text-sm font-medium text-gray-900 truncate">
                                                    {user.displayName || 'User'}
                                                </div>
                                                <div className="text-xs text-gray-500 truncate">
                                                    {user.email}
                                                </div>
                                            </div>

                                            {/* Language Selector */}
                                            <div className="px-3 py-2 border-b border-gray-100">
                                                <div className="text-xs text-gray-500 mb-1">{t('language')}</div>
                                                <div className="flex gap-1">
                                                    {(['bg', 'en'] as const).map((lang) => (
                                                        <button
                                                            key={lang}
                                                            onClick={() => {
                                                                setAdminLanguage(lang);
                                                                setIsUserMenuOpen(false);
                                                            }}
                                                            className={`px-2 py-1 text-xs rounded ${adminLanguage === lang
                                                                ? 'bg-blue-100 text-blue-700 font-medium'
                                                                : 'text-gray-600 hover:bg-gray-100'
                                                                }`}
                                                        >
                                                            {lang.toUpperCase()}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Logout */}
                                            <button
                                                onClick={() => {
                                                    auth.signOut();
                                                    setIsUserMenuOpen(false);
                                                }}
                                                className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                            >
                                                <LogOut className="w-4 h-4" />
                                                {t('signOut')}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Content Area */}
            <div className="p-4 sm:p-6 pb-32">
                {/* Tab Navigation */}
                <div className="flex border-b mb-6 overflow-x-auto scrollbar-hide">
                    <div className="flex space-x-0 min-w-max">
                        <button onClick={() => setView('details')} className={`px-3 sm:px-4 py-2 text-sm sm:text-base whitespace-nowrap ${view === 'details' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}>{t('details')}</button>
                        <button onClick={() => setView('amenities')} className={`px-3 sm:px-4 py-2 text-sm sm:text-base whitespace-nowrap ${view === 'amenities' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}>{t('amenities')}</button>
                        <button onClick={() => setView('gallery')} className={`px-3 sm:px-4 py-2 text-sm sm:text-base whitespace-nowrap ${view === 'gallery' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}>{t('gallery')}</button>
                        <button onClick={() => setView('pricing')} className={`px-3 sm:px-4 py-2 text-sm sm:text-base whitespace-nowrap ${view === 'pricing' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}>{t('pricing')}</button>
                        <button onClick={() => setView('calendar')} className={`px-3 sm:px-4 py-2 text-sm sm:text-base whitespace-nowrap ${view === 'calendar' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}>{t('calendarAndBookings')}</button>
                        <button onClick={() => setView('feedback')} className={`px-3 sm:px-4 py-2 text-sm sm:text-base whitespace-nowrap ${view === 'feedback' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}>{t('feedback')}</button>
                        <button onClick={() => setView('testimonials')} className={`px-3 sm:px-4 py-2 text-sm sm:text-base whitespace-nowrap ${view === 'testimonials' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}>{t('testimonials')}</button>
                    </div>
                </div>
                {view === 'details' && (
                    <ApartmentDetailsTab
                        currentApartmentData={currentApartmentData}
                        setCurrentApartmentData={setCurrentApartmentData}
                        formLanguage={formLanguage as 'bg' | 'en'}
                        setFormLanguage={setFormLanguage as (lang: 'bg' | 'en') => void}
                        loading={loading}
                        handleNameChange={handleNameChange as (lang: 'bg' | 'en', value: string) => void}
                        handleContactChange={handleContactChange as (lang: 'bg' | 'en', field: 'name' | 'email', value: string) => void}
                    />
                )}
                {view === 'amenities' && (
                    <ApartmentAmenitiesTab
                        currentApartmentData={currentApartmentData}
                        setCurrentApartmentData={setCurrentApartmentData}
                        formLanguage={formLanguage as 'bg' | 'en'}
                        setFormLanguage={setFormLanguage as (lang: 'bg' | 'en') => void}
                        availableAmenities={availableAmenities}
                        handleAmenityToggle={handleAmenityToggle}
                        handleCustomAmenityAdd={handleCustomAmenityAdd}
                        handleAmenityRemove={handleAmenityRemove}
                        handleAmenitiesOnDragEnd={handleAmenitiesOnDragEnd}
                        getAmenityTranslation={getAmenityTranslation}
                        renderAmenityIcon={renderAmenityIcon}
                    />
                )}
                {view === 'gallery' && (
                    <ApartmentGalleryTab
                        currentApartmentData={currentApartmentData}
                        setCurrentApartmentData={setCurrentApartmentData}
                        galleryItems={galleryItems}
                        setGalleryItems={setGalleryItems}
                        handleImageDelete={handleImageDelete}
                        handleSetHeroImage={handleSetHeroImage}
                        handleToggleFavouriteImage={handleToggleFavouriteImage}
                        formLanguage={formLanguage as 'bg' | 'en'}
                        setFormLanguage={setFormLanguage as (lang: 'bg' | 'en') => void}
                    />
                )}
                {view === 'pricing' && (
                    <ApartmentPricingTab
                        currentApartmentData={currentApartmentData}
                        setCurrentApartmentData={setCurrentApartmentData}
                        formLanguage={formLanguage as 'bg' | 'en'}
                        setFormLanguage={setFormLanguage as (lang: 'bg' | 'en') => void}
                        handleAddBasePrice={handleAddBasePrice}
                        handleEditBasePrice={handleEditBasePrice}
                        handleDeleteBasePrice={handleDeleteBasePrice}
                        handleEditPricingOffer={handleEditPricingOffer}
                        handleDeletePricingOffer={handleDeletePricingOffer}
                        handleReorderPricingOffer={handleReorderPricingOffer}
                        setIsPricingOfferModalOpen={setIsPricingOfferModalOpen}
                        convertEurToBgn={convertEurToBgn}
                    />
                )}
                {view === 'calendar' && (
                    <ApartmentCalendarTab
                        currentApartmentData={currentApartmentData}
                        setCurrentApartmentData={setCurrentApartmentData}
                        formLanguage={formLanguage as 'bg' | 'en'}
                        setFormLanguage={setFormLanguage as (lang: 'bg' | 'en') => void}
                        apartment={apartment}
                        bookings={bookings}
                        setBookings={setBookings}
                        isRentalModalOpen={isRentalModalOpen}
                        setIsRentalModalOpen={setIsRentalModalOpen}
                        selectedSlot={selectedSlot}
                        setSelectedSlot={setSelectedSlot}
                        editingBooking={editingBooking}
                        setEditingBooking={setEditingBooking}
                        handleSaveRentalPeriod={handleSaveRentalPeriod}
                        handleUpdateBooking={handleUpdateBooking}
                        handleDeleteBooking={handleDeleteBooking}
                        getBookingTypeTranslation={getBookingTypeTranslation}
                    />
                )}
                {view === 'feedback' && (
                    <ApartmentFeedbackTab
                        currentApartmentData={currentApartmentData}
                        setCurrentApartmentData={setCurrentApartmentData}
                        formLanguage={formLanguage as 'bg' | 'en'}
                        setFormLanguage={setFormLanguage as (lang: 'bg' | 'en') => void}
                        apartment={apartment}
                        showConfirmation={showConfirmation}
                    />
                )}
                {view === 'testimonials' && (
                    <ApartmentTestimonialsTab
                        apartmentId={apartment?.id || ''}
                        formLanguage={formLanguage as 'bg' | 'en'}
                        setFormLanguage={setFormLanguage as (lang: 'bg' | 'en') => void}
                    />
                )}

                {/* Simple Save Button Footer */}
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
                    <div className="px-14 py-4">
                        <div className="flex justify-end items-center">
                            {/* Success indicator */}
                            {saveSuccess && (
                                <div className="flex items-center gap-2 text-green-600">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-sm font-medium px-6">{t('changesSavedSuccessfully')}</span>
                                </div>
                            )}

                            {/* Simple Save Button */}
                            <Button
                                type="button"
                                onClick={handleSave}
                                disabled={loading}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        {t('saving')}
                                    </>
                                ) : (
                                    <>
                                        {t('saveChanges')}
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Base Price Modal */}
                {isBasePriceModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                            <h3 className="text-lg font-semibold mb-4">
                                {editingBasePrice ? t('editBasePrice') : t('addBasePrice')}
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="priceEUR">{t('priceInEUR')}</Label>
                                    <Input
                                        id="priceEUR"
                                        type="number"
                                        value={newBasePrice.priceEUR || ''}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                            setNewBasePrice(prev => ({
                                                ...prev,
                                                priceEUR: parseFloat(e.target.value) || 0,
                                                priceBGN: Math.round(convertEurToBgn(parseFloat(e.target.value) || 0))
                                            }))
                                        }
                                        placeholder="77"
                                        className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 mt-6">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setIsBasePriceModalOpen(false);
                                        setEditingBasePrice(false);
                                        setNewBasePrice({ priceBGN: 0, priceEUR: 0, description: '' });
                                    }}
                                >
                                    {t('cancel')}
                                </Button>
                                <Button
                                    onClick={handleSaveBasePrice}
                                    disabled={loading}
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    {loading ? t('saving') : t('save')}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Pricing Offer Modal */}
                {isPricingOfferModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                            <h3 className="text-lg font-semibold mb-4">
                                {editingPricingOffer ? t('editPricingOffer') : t('addPricingOffer')}
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="offerName">{t('offerName')}</Label>
                                    <Input
                                        id="offerName"
                                        type="text"
                                        value={newPricingOffer.name || ''}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                            setNewPricingOffer(prev => ({ ...prev, name: e.target.value }))
                                        }
                                        placeholder="Weekly Discount"
                                        className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="offerDays">{t('minimumNumberOfNights')}</Label>
                                    <Input
                                        id="offerDays"
                                        type="number"
                                        value={newPricingOffer.days || ''}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                            setNewPricingOffer(prev => ({ ...prev, days: Number(e.target.value) }))
                                        }
                                        placeholder="7"
                                        className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="pricePerNightEUR">{t('pricePerNightEUR')}</Label>
                                    <Input
                                        id="pricePerNightEUR"
                                        type="number"
                                        value={newPricingOffer.pricePerNightEUR || ''}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                            setNewPricingOffer(prev => ({
                                                ...prev,
                                                pricePerNightEUR: Number(e.target.value),
                                                pricePerNightBGN: Math.round(convertEurToBgn(Number(e.target.value) || 0))
                                            }))
                                        }
                                        placeholder="67"
                                        className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="offerDescription">{t('description')} ({t('optional')})</Label>
                                    <Input
                                        id="offerDescription"
                                        type="text"
                                        value={newPricingOffer.description || ''}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                            setNewPricingOffer(prev => ({ ...prev, description: e.target.value }))
                                        }
                                        placeholder="Save 15% for weekly stays"
                                        className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    />
                                </div>
                                <div className="flex items-start gap-3">
                                    <input
                                        id="isSuperSpecial"
                                        type="checkbox"
                                        checked={!!newPricingOffer.isSuperSpecial}
                                        onChange={(e) => setNewPricingOffer(prev => ({
                                            ...prev,
                                            isSuperSpecial: e.target.checked,
                                            superSpecialUntil: e.target.checked ? (prev.superSpecialUntil || undefined) : undefined
                                        }))}
                                        className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <div className="flex-1">
                                        <Label htmlFor="isSuperSpecial">{t('superSpecialOfferInHero')}</Label>
                                        <div className="text-xs text-gray-500 mt-1">
                                            {t('superSpecialOfferInHeroHelp')}
                                        </div>
                                    </div>
                                </div>

                                {!!newPricingOffer.isSuperSpecial && (
                                    <div>
                                        <Label htmlFor="superSpecialUntil">{t('superSpecialOfferDueDate')}</Label>
                                        <Input
                                            id="superSpecialUntil"
                                            type="date"
                                            value={(newPricingOffer.superSpecialUntil as any) || ''}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                setNewPricingOffer(prev => ({
                                                    ...prev,
                                                    superSpecialUntil: e.target.value || undefined
                                                }))
                                            }
                                            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        />
                                        <div className="text-xs text-gray-500 mt-1">
                                            {t('superSpecialOfferDueDateHelp')}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end gap-2 mt-6">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setIsPricingOfferModalOpen(false);
                                        setEditingPricingOffer(null);
                                        setNewPricingOffer({ name: '', days: 0, price: 0, pricePerNightBGN: 0, pricePerNightEUR: 0, isSuperSpecial: false, superSpecialUntil: undefined, description: '' });
                                    }}
                                >
                                    {t('cancel')}
                                </Button>
                                <Button
                                    onClick={editingPricingOffer ? handleUpdatePricingOffer : handleAddPricingOffer}
                                    disabled={loading}
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    {loading ? t('saving') : t('save')}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Confirmation Dialog */}
                {confirmationDialog.isOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                            <h3 className="text-lg font-semibold mb-4">{confirmationDialog.title}</h3>
                            <p className="text-sm text-gray-800 mb-4">{confirmationDialog.message}</p>
                            <div className="flex justify-end gap-2">
                                <Button
                                    variant="outline"
                                    onClick={confirmationDialog.onCancel}
                                >
                                    {t('cancel') || 'Cancel'}
                                </Button>
                                <Button
                                    onClick={confirmationDialog.onConfirm}
                                    className="bg-red-600 hover:bg-red-700 text-white"
                                >
                                    {t('delete') || 'Delete'}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ApartmentEditAdmin;
