import React, { useState, useEffect, useCallback } from 'react';
import { useAdminLanguage } from '../../hooks/useAdminLanguage';
import { useLanguage } from '../../hooks/useLanguage';
import { useAuth } from '../../contexts/AuthContext';
import { collection, getDocs, query, where, writeBatch, doc, addDoc, deleteDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import LoadingSpinner from '../common/LoadingSpinner';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import Modal from '../common/Modal';
import { Amenity } from '../../types';
import { migrateApartmentOwnership } from '../../scripts/migrateApartmentOwnership';
import { 
    Wifi, Snowflake, Thermometer, ChefHat, RefrigeratorIcon, Zap, 
    FlameKindling, Car, Tv, WashingMachine, Wind, Utensils, 
    Trees, Flame, Waves, Mountain, Heart, Ban, Baby, 
    ArrowUp, Home, Bath, CloudRain, Droplets, Plus, 
    Shield, Lock, Package, Building, Coffee, Microwave,
    AirVent, Sofa, Bed, Shirt, Sparkles, Sun, UserCheck,
    Flower, MapPin, Camera, Music, Gamepad2, Dumbbell,
    WifiOff, TreePine, Palmtree, Users, Accessibility,
    Laptop, Smartphone, Headphones, Speaker, Router, Monitor,
    Armchair, Lamp, Fan, Clock, Phone, Mail,
    Cigarette, Wine, BookOpen, Newspaper, Globe,
    Stethoscope, Activity, Bike, Bus, Train, Plane, Ship, Fuel,
    Briefcase, Printer, FileText, Calculator,
    Umbrella, Glasses, Watch, Key, Bell, AlertTriangle,
    Dog, Cat, Fish, Bird, Store, ShoppingBag, Gift, Star, Award,
    Cloud, CloudSnow, CloudLightning, Sunrise, Sandwich, Apple
} from 'lucide-react';

// Available icons for amenities
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
    { id: 'calendar-service', name: 'Booking Service', icon: Briefcase },
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
    name: { [key: string]: string };
    slug: string;
    floor?: number;
    isDefault?: boolean;
}

const SettingsAdmin: React.FC = () => {
    const { t, language } = useAdminLanguage();
    const { isSuperAdmin } = useAuth();
    const [apartments, setApartments] = useState<Apartment[]>([]);
    const [defaultApartmentId, setDefaultApartmentId] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [migratingOwnership, setMigratingOwnership] = useState(false);
    
    // Only super admin can access settings
    if (!isSuperAdmin) {
        return (
            <div className="p-6 text-center">
                <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
                <p className="text-gray-600">You don't have permission to access settings.</p>
            </div>
        );
    }
    
    // Amenities state
    const [amenities, setAmenities] = useState<Amenity[]>([]);
    const [loadingAmenities, setLoadingAmenities] = useState(false);
    const [editingAmenity, setEditingAmenity] = useState<Amenity | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editModalAmenity, setEditModalAmenity] = useState<{ en: string; bg: string; icon?: string }>({ en: '', bg: '', icon: '' });
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [addModalAmenity, setAddModalAmenity] = useState<{ en: string; bg: string; icon?: string }>({ en: '', bg: '', icon: '' });

    const fetchApartments = useCallback(async () => {
        setLoading(true);
        try {
            const querySnapshot = await getDocs(collection(db, "apartments"));
            const apts = querySnapshot.docs.map(doc => ({ 
                id: doc.id, 
                ...doc.data() 
            } as Apartment));
            setApartments(apts);
            
            // Find current default apartment
            const defaultApt = apts.find(apt => apt.isDefault);
            if (defaultApt) {
                setDefaultApartmentId(defaultApt.id);
            }
        } catch (error) {
            console.error("Error fetching apartments: ", error);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleDefaultApartmentChange = async (apartmentId: string) => {
        setSaving(true);
        try {
            const batch = writeBatch(db);
            
            // Set all apartments to not default
            apartments.forEach(apartment => {
                const apartmentRef = doc(db, "apartments", apartment.id);
                batch.update(apartmentRef, { isDefault: false });
            });
            
            // Set the selected apartment as default
            if (apartmentId) {
                const selectedApartmentRef = doc(db, "apartments", apartmentId);
                batch.update(selectedApartmentRef, { isDefault: true });
            }
            
            await batch.commit();
            setDefaultApartmentId(apartmentId);
            
            // Refresh apartments to reflect changes
            await fetchApartments();
        } catch (error) {
            console.error("Error updating default apartment: ", error);
        } finally {
            setSaving(false);
        }
    };

    const getApartmentDisplayName = (apartment: Apartment) => {
        return apartment.name?.[language] || apartment.name?.bg || apartment.name?.en || apartment.slug;
    };

    // Amenities management functions
    const fetchAmenities = useCallback(async () => {
        setLoadingAmenities(true);
        try {
            const querySnapshot = await getDocs(collection(db, "amenities"));
            const amenitiesList = querySnapshot.docs.map(doc => ({ 
                id: doc.id, 
                ...doc.data() 
            } as Amenity));
            setAmenities(amenitiesList);
        } catch (error) {
            console.error("Error fetching amenities: ", error);
        } finally {
            setLoadingAmenities(false);
        }
    }, []);

    const initializeDefaultAmenities = async () => {
        const defaultAmenities = [
            { id: 'wifi', en: 'Wi-Fi', bg: 'Wi-Fi', icon: 'wifi' },
            { id: 'air-conditioning', en: 'Air Conditioning', bg: 'Климатик', icon: 'air-conditioning' },
            { id: 'heating', en: 'Heating', bg: 'Отопление', icon: 'heating' },
            { id: 'kitchen', en: 'Kitchen', bg: 'Кухня', icon: 'kitchen' },
            { id: 'refrigerator', en: 'Refrigerator', bg: 'Хладилник', icon: 'refrigerator' },
            { id: 'microwave', en: 'Microwave', bg: 'Микровълнова', icon: 'microwave' },
            { id: 'oven', en: 'Oven', bg: 'Фурна', icon: 'oven' },
            { id: 'stovetop', en: 'Stovetop', bg: 'Котлони', icon: 'stovetop' },
            { id: 'dishwasher', en: 'Dishwasher', bg: 'Съдомиялна', icon: 'dishwasher' },
            { id: 'coffee-maker', en: 'Coffee Maker', bg: 'Кафемашина', icon: 'coffee-maker' },
            { id: 'balcony', en: 'Balcony', bg: 'Балкон', icon: 'balcony' },
            { id: 'terrace', en: 'Terrace', bg: 'Тераса', icon: 'terrace' },
            { id: 'parking', en: 'Parking', bg: 'Паркинг', icon: 'parking' },
            { id: 'free-parking', en: 'Free Parking', bg: 'Безплатен паркинг', icon: 'parking' },
            { id: 'tv', en: 'TV', bg: 'Телевизор', icon: 'tv' },
            { id: 'cable-tv', en: 'Cable TV', bg: 'Кабелна телевизия', icon: 'tv' },
            { id: 'smart-tv', en: 'Smart TV', bg: 'Смарт телевизор', icon: 'tv' },
            { id: 'washing-machine', en: 'Washing Machine', bg: 'Пералня', icon: 'washing-machine' },
            { id: 'hair-dryer', en: 'Hair Dryer', bg: 'Сешоар', icon: 'hair-dryer' },
            { id: 'iron', en: 'Iron', bg: 'Ютия', icon: 'iron' },
            { id: 'bed-sheets', en: 'Bed Sheets', bg: 'Спално бельо', icon: 'bed-sheets' },
            { id: 'towels', en: 'Towels', bg: 'Хавлии', icon: 'towels' },
            { id: 'pool-access', en: 'Pool Access', bg: 'Достъп до басейн', icon: 'pool-access' },
            { id: 'garden', en: 'Garden', bg: 'Градина', icon: 'garden' },
            { id: 'bbq', en: 'BBQ', bg: 'Барбекю', icon: 'bbq' },
            { id: 'near-beach', en: 'Near Beach', bg: 'Близо до плаж', icon: 'near-beach' },
            { id: 'sea-view', en: 'Sea View', bg: 'Изглед към морето', icon: 'sea-view' },
            { id: 'mountain-view', en: 'Mountain View', bg: 'Планински изглед', icon: 'mountain-view' },
            { id: 'pets-allowed', en: 'Pets Allowed', bg: 'Домашни любимци разрешени', icon: 'pets-allowed' },
            { id: 'non-smoking', en: 'Non-smoking', bg: 'Непушачи', icon: 'non-smoking' },
            { id: 'family-friendly', en: 'Family Friendly', bg: 'Подходящо за семейства', icon: 'family-friendly' },
            { id: 'elevator', en: 'Elevator', bg: 'Асансьор', icon: 'elevator' },
            { id: 'ground-floor', en: 'Ground Floor', bg: 'Партер', icon: 'ground-floor' },
            { id: 'private-bathroom', en: 'Private Bathroom', bg: 'Собствена баня', icon: 'private-bathroom' },
            { id: 'bathtub', en: 'Bathtub', bg: 'Вана', icon: 'bathtub' },
            { id: 'shower', en: 'Shower', bg: 'Душ', icon: 'shower' },
            { id: 'hot-water', en: 'Hot Water', bg: 'Топла вода', icon: 'hot-water' },
            { id: 'first-aid-kit', en: 'First Aid Kit', bg: 'Аптечка', icon: 'first-aid-kit' },
            { id: 'fire-extinguisher', en: 'Fire Extinguisher', bg: 'Пожарогасител', icon: 'fire-extinguisher' },
            { id: 'safe', en: 'Safe', bg: 'Сейф', icon: 'safe' },
            { id: 'luggage-storage', en: 'Luggage Storage', bg: 'Багажно помещение', icon: 'luggage-storage' }
        ];

        try {
            const batch = writeBatch(db);
            defaultAmenities.forEach(amenity => {
                const amenityRef = doc(db, 'amenities', amenity.id);
                batch.set(amenityRef, { en: amenity.en, bg: amenity.bg, icon: amenity.icon });
            });
            await batch.commit();
            await fetchAmenities();
        } catch (error) {
            console.error("Error initializing default amenities: ", error);
        }
    };

    // Helper function to render amenity icon
    const renderAmenityIcon = (iconId?: string) => {
        if (!iconId) return null;
        const iconData = AVAILABLE_ICONS.find(icon => icon.id === iconId);
        if (!iconData) return null;
        const IconComponent = iconData.icon;
        return <IconComponent className="w-5 h-5" />;
    };

    const openAddModal = () => {
        setAddModalAmenity({ en: '', bg: '', icon: '' });
        setIsAddModalOpen(true);
    };

    const closeAddModal = () => {
        setIsAddModalOpen(false);
        setAddModalAmenity({ en: '', bg: '', icon: '' });
    };

    const handleAddAmenity = async () => {
        if (!addModalAmenity.en.trim() || !addModalAmenity.bg.trim()) {
            const errorDialog = document.createElement('div');
            errorDialog.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50';
            errorDialog.innerHTML = `
                <div class="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl">
                    <div class="flex items-center gap-3 mb-4">
                        <div class="flex-shrink-0">
                            <svg class="h-6 w-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <h3 class="text-lg font-semibold text-gray-900">
                            ${language === 'bg' ? 'Внимание' : 'Warning'}
                        </h3>
                    </div>
                    <p class="text-gray-700 mb-6">
                        ${language === 'bg' ? 'Моля попълнете и двата полета' : 'Please fill in both fields'}
                    </p>
                    <div class="flex justify-end">
                        <button class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700" onclick="this.closest('.fixed').remove()">
                            ${language === 'bg' ? 'ОК' : 'OK'}
                        </button>
                    </div>
                </div>
            `;
            document.body.appendChild(errorDialog);
            return;
        }

        setLoadingAmenities(true);
        try {
            const amenityId = addModalAmenity.en.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
            await setDoc(doc(db, 'amenities', amenityId), {
                en: addModalAmenity.en.trim(),
                bg: addModalAmenity.bg.trim(),
                icon: addModalAmenity.icon || ''
            });
            setAddModalAmenity({ en: '', bg: '', icon: '' });
            setIsAddModalOpen(false);
            await fetchAmenities();
        } catch (error) {
            console.error("Error adding amenity: ", error);
            const errorDialog = document.createElement('div');
            errorDialog.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50';
            errorDialog.innerHTML = `
                <div class="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl">
                    <div class="flex items-center gap-3 mb-4">
                        <div class="flex-shrink-0">
                            <svg class="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <h3 class="text-lg font-semibold text-gray-900">
                            ${language === 'bg' ? 'Грешка' : 'Error'}
                        </h3>
                    </div>
                    <p class="text-gray-700 mb-6">
                        ${language === 'bg' ? 'Грешка при добавяне на удобството' : 'Error adding amenity'}
                    </p>
                    <div class="flex justify-end">
                        <button class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700" onclick="this.closest('.fixed').remove()">
                            ${language === 'bg' ? 'ОК' : 'OK'}
                        </button>
                    </div>
                </div>
            `;
            document.body.appendChild(errorDialog);
        } finally {
            setLoadingAmenities(false);
        }
    };

    const handleEditAmenity = (amenity: Amenity) => {
        setEditingAmenity(amenity);
        setEditModalAmenity({ en: amenity.en, bg: amenity.bg, icon: amenity.icon || '' });
        setIsEditModalOpen(true);
    };

    const handleUpdateAmenity = async () => {
        if (!editingAmenity || !editModalAmenity.en.trim() || !editModalAmenity.bg.trim()) return;

        setLoadingAmenities(true);
        try {
            await updateDoc(doc(db, 'amenities', editingAmenity.id), {
                en: editModalAmenity.en.trim(),
                bg: editModalAmenity.bg.trim(),
                icon: editModalAmenity.icon || ''
            });
            setEditingAmenity(null);
            setEditModalAmenity({ en: '', bg: '', icon: '' });
            setIsEditModalOpen(false);
            await fetchAmenities();
        } catch (error) {
            console.error("Error updating amenity: ", error);
            const errorDialog = document.createElement('div');
            errorDialog.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50';
            errorDialog.innerHTML = `
                <div class="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl">
                    <div class="flex items-center gap-3 mb-4">
                        <div class="flex-shrink-0">
                            <svg class="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <h3 class="text-lg font-semibold text-gray-900">
                            ${language === 'bg' ? 'Грешка' : 'Error'}
                        </h3>
                    </div>
                    <p class="text-gray-700 mb-6">
                        ${language === 'bg' ? 'Грешка при редактиране на удобството' : 'Error updating amenity'}
                    </p>
                    <div class="flex justify-end">
                        <button class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700" onclick="this.closest('.fixed').remove()">
                            ${language === 'bg' ? 'ОК' : 'OK'}
                        </button>
                    </div>
                </div>
            `;
            document.body.appendChild(errorDialog);
        } finally {
            setLoadingAmenities(false);
        }
    };

    const handleDeleteAmenity = async (amenityId: string) => {
        console.log('handleDeleteAmenity called with ID:', amenityId);
        
        // Create custom confirmation dialog
        const confirmDialog = document.createElement('div');
        confirmDialog.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50';
        confirmDialog.innerHTML = `
            <div class="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl">
                <div class="flex items-center gap-3 mb-4">
                    <div class="flex-shrink-0">
                        <svg class="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </div>
                    <h3 class="text-lg font-semibold text-gray-900">
                        ${language === 'bg' ? 'Изтриване на удобство' : 'Delete Amenity'}
                    </h3>
                </div>
                <p class="text-gray-700 mb-6">
                    ${language === 'bg' ? 
                        'Сигурни ли сте, че искате да изтриете това удобство? Това действие не може да бъде отменено.' : 
                        'Are you sure you want to delete this amenity? This action cannot be undone.'
                    }
                </p>
                <div class="flex justify-end gap-3">
                    <button class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400" data-action="cancel">
                        ${language === 'bg' ? 'Отказ' : 'Cancel'}
                    </button>
                    <button class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700" data-action="confirm">
                        ${language === 'bg' ? 'Изтрий' : 'Delete'}
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(confirmDialog);

        // Handle dialog actions
        confirmDialog.addEventListener('click', async (e) => {
            const target = e.target as HTMLElement;
            const action = target.getAttribute('data-action');

            if (action === 'cancel') {
                confirmDialog.remove();
                return;
            }

            if (action === 'confirm') {
                confirmDialog.remove();
                
                console.log('User confirmed deletion, proceeding...');
                setLoadingAmenities(true);
                
                try {
                    console.log('Deleting amenity:', amenityId);
                    await deleteDoc(doc(db, 'amenities', amenityId));
                    await fetchAmenities();
                    console.log('Amenity deleted successfully');
                } catch (error) {
                    console.error("Error deleting amenity: ", error);
                    
                    // Show error dialog
                    const errorDialog = document.createElement('div');
                    errorDialog.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50';
                    errorDialog.innerHTML = `
                        <div class="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl">
                            <div class="flex items-center gap-3 mb-4">
                                <div class="flex-shrink-0">
                                    <svg class="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                </div>
                                <h3 class="text-lg font-semibold text-gray-900">
                                    ${language === 'bg' ? 'Грешка' : 'Error'}
                                </h3>
                            </div>
                            <p class="text-gray-700 mb-6">
                                ${language === 'bg' ? 'Грешка при изтриване на удобството. Моля опитайте отново.' : 'Error deleting amenity. Please try again.'}
                            </p>
                            <div class="flex justify-end">
                                <button class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700" onclick="this.closest('.fixed').remove()">
                                    ${language === 'bg' ? 'ОК' : 'OK'}
                                </button>
                            </div>
                        </div>
                    `;
                    document.body.appendChild(errorDialog);
                } finally {
                    setLoadingAmenities(false);
                }
            }
        });
    };

    // Migration function for apartment ownership
    const handleMigrateOwnership = async () => {
        if (!isSuperAdmin) return;
        
        setMigratingOwnership(true);
        try {
            const result = await migrateApartmentOwnership();
            if (result.success) {
                alert(`Successfully migrated ${result.count} apartments!`);
            } else {
                alert(`Migration failed: ${result.error}`);
            }
        } catch (error) {
            console.error('Migration error:', error);
            alert('Migration failed. Check console for details.');
        } finally {
            setMigratingOwnership(false);
        }
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
        setEditingAmenity(null);
        setEditModalAmenity({ en: '', bg: '', icon: '' });
    };

    useEffect(() => {
        fetchApartments();
        fetchAmenities();
    }, [fetchApartments, fetchAmenities]);

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">{t('settings')}</h1>
            </div>

            <div className="space-y-6">
                {/* Default Apartment Setting */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold mb-4">{t('defaultApartment')}</h2>
                    <p className="text-gray-600 mb-4">{t('defaultApartmentSettingsDescription')}</p>
                    
                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-700">
                            {t('selectDefaultApartment')}
                        </label>
                        <select
                            value={defaultApartmentId}
                            onChange={(e) => handleDefaultApartmentChange(e.target.value)}
                            disabled={saving}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">{t('noDefaultApartment')}</option>
                            {apartments.map(apartment => (
                                <option key={apartment.id} value={apartment.id}>
                                    {getApartmentDisplayName(apartment)}
                                </option>
                            ))}
                        </select>
                        {saving && (
                            <p className="text-sm text-blue-600">{t('saving')}</p>
                        )}
                        <p className="text-sm text-gray-500">{t('defaultApartmentHint')}</p>
                    </div>
                </div>

                {/* Migration Section (Super Admin Only) */}
                {isSuperAdmin && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-semibold mb-4 text-yellow-800">Migration Tools</h2>
                        <p className="text-yellow-700 mb-4">
                            These tools are only available to super administrators and should be used with caution.
                        </p>
                        
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-medium text-yellow-800 mb-2">Apartment Ownership Migration</h3>
                                <p className="text-sm text-yellow-600 mb-3">
                                    This will assign you as the owner of all apartments that don't have an owner. 
                                    Run this once after implementing the new authentication system.
                                </p>
                                <Button
                                    onClick={handleMigrateOwnership}
                                    disabled={migratingOwnership}
                                    className="bg-yellow-600 hover:bg-yellow-700 text-white"
                                >
                                    {migratingOwnership ? 'Migrating...' : 'Migrate Apartment Ownership'}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Amenities Management */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="mb-4">
                        <h2 className="text-xl font-semibold">{language === 'bg' ? 'Управление на удобства' : 'Manage Amenities'}</h2>
                    </div>
                    
                    <p className="text-gray-600 mb-6">
                        {language === 'bg' ? 
                            'Това е основният списък с удобства, които собствениците на апартаменти могат да избират за своите обекти. Добавете, редактирайте или премахнете удобства според нуждите си.' :
                            'This is the master list of amenities that apartment owners can select from for their properties. Add, edit, or remove amenities as needed.'
                        }
                    </p>

                    {/* Initialize Default Amenities Button */}
                    {amenities.length === 0 && !loadingAmenities && (
                        <div className="mb-6 p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
                            <h3 className="font-medium text-yellow-800 mb-2">
                                {language === 'bg' ? 'Няма удобства' : 'No Amenities Found'}
                            </h3>
                            <p className="text-yellow-700 text-sm mb-4">
                                {language === 'bg' ? 
                                    'Изглежда, че няма дефинирани удобства. Искате ли да добавите стандартния набор от удобства?' :
                                    'It looks like there are no amenities defined. Would you like to add the default set of amenities?'
                                }
                            </p>
                            <Button onClick={initializeDefaultAmenities} className="bg-yellow-600 hover:bg-yellow-700">
                                {language === 'bg' ? 'Добави стандартни удобства' : 'Add Default Amenities'}
                            </Button>
                        </div>
                    )}

                    {/* Add Amenity Button */}
                    <div className="mb-6 flex justify-center">
                        <Button 
                            onClick={openAddModal}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {language === 'bg' ? 'Добави ново удобство' : 'Add New Amenity'}
                        </Button>
                    </div>

                    {/* Available Amenities List */}
                    <div>
                        <h3 className="text-lg font-medium mb-4">
                            {language === 'bg' ? 'Налични удобства за избор' : 'Available Amenities for Selection'} ({amenities.length})
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                            {language === 'bg' ? 
                                'Тези удобства ще се показват като опции в секцията "Удобства" при редактиране на апартамент.' :
                                'These amenities will appear as options in the "Amenities" tab when editing an apartment.'
                            }
                        </p>
                        
                        {loadingAmenities ? (
                            <div className="flex justify-center py-8">
                                <LoadingSpinner />
                            </div>
                        ) : amenities.length > 0 ? (
                            <>
                                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                        <span className="text-sm font-medium text-blue-800">
                                            {language === 'bg' ? 
                                                'Този списък определя кои удобства могат да избират собствениците на апартаменти' :
                                                'This list defines which amenities apartment owners can select from'
                                            }
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {amenities.map((amenity) => (
                                    <div key={amenity.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="flex-shrink-0">
                                                {amenity.icon ? (
                                                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                                                        {renderAmenityIcon(amenity.icon)}
                                                    </div>
                                                ) : (
                                                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                                                        <span className="text-xs">?</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-medium">
                                                    {language === 'bg' ? amenity.bg : amenity.en}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {language === 'bg' ? amenity.en : amenity.bg}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            <Button
                                                onClick={() => handleEditAmenity(amenity)}
                                                variant="outline"
                                                size="sm"
                                                className="h-8 w-8 p-0"
                                            >
                                                ✏️
                                            </Button>
                                            <Button
                                                onClick={() => handleDeleteAmenity(amenity.id)}
                                                variant="outline"
                                                size="sm"
                                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                            >
                                                🗑️
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                {language === 'bg' ? 'Няма добавени удобства' : 'No amenities added yet'}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Edit Amenity Modal */}
            <Modal isOpen={isEditModalOpen} onClose={closeEditModal}>
                <div className="p-6">
                    <h3 className="text-xl font-semibold mb-6">
                        {language === 'bg' ? 'Редактиране на удобство' : 'Edit Amenity'}
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <Label htmlFor="edit-amenity-en">🇬🇧 English</Label>
                            <Input
                                id="edit-amenity-en"
                                value={editModalAmenity.en}
                                onChange={(e) => setEditModalAmenity(prev => ({ ...prev, en: e.target.value }))}
                                placeholder="English name"
                                className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            />
                        </div>
                        <div>
                            <Label htmlFor="edit-amenity-bg">🇧🇬 Bulgarian</Label>
                            <Input
                                id="edit-amenity-bg"
                                value={editModalAmenity.bg}
                                onChange={(e) => setEditModalAmenity(prev => ({ ...prev, bg: e.target.value }))}
                                placeholder="Българско име"
                                className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            />
                        </div>
                    </div>
                    
                    {/* Icon Selection */}
                    <div className="mb-6">
                        <Label>
                            {language === 'bg' ? 'Избор на икона' : 'Select Icon'} 
                            <span className="text-sm text-gray-500 ml-2">
                                ({language === 'bg' ? 'незадължително' : 'optional'})
                            </span>
                        </Label>
                        <div className="mt-2 grid grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
                            {AVAILABLE_ICONS.map((iconData) => {
                                const IconComponent = iconData.icon;
                                const isSelected = editModalAmenity.icon === iconData.id;
                                return (
                                    <button
                                        key={iconData.id}
                                        type="button"
                                        onClick={() => setEditModalAmenity(prev => ({ 
                                            ...prev, 
                                            icon: isSelected ? '' : iconData.id 
                                        }))}
                                        className={`p-2 rounded-lg border-2 transition-all duration-200 flex items-center justify-center hover:bg-gray-50 ${
                                            isSelected 
                                                ? 'border-blue-500 bg-blue-50 text-blue-600' 
                                                : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                        }`}
                                        title={iconData.name}
                                    >
                                        <IconComponent className="w-5 h-5" />
                                    </button>
                                );
                            })}
                        </div>
                        {editModalAmenity.icon && (
                            <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                                <span>{language === 'bg' ? 'Избрана икона:' : 'Selected icon:'}</span>
                                {renderAmenityIcon(editModalAmenity.icon)}
                                <span>{AVAILABLE_ICONS.find(i => i.id === editModalAmenity.icon)?.name}</span>
                            </div>
                        )}
                    </div>
                    
                    <div className="flex justify-end gap-3">
                        <Button 
                            onClick={closeEditModal} 
                            variant="outline"
                        >
                            {language === 'bg' ? 'Отказ' : 'Cancel'}
                        </Button>
                        <Button 
                            onClick={handleUpdateAmenity} 
                            disabled={loadingAmenities || !editModalAmenity.en.trim() || !editModalAmenity.bg.trim()}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            {language === 'bg' ? 'Обнови' : 'Update'}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Add Amenity Modal */}
            <Modal isOpen={isAddModalOpen} onClose={closeAddModal}>
                <div className="p-6">
                    <h3 className="text-xl font-semibold mb-6">
                        {language === 'bg' ? 'Добавяне на ново удобство' : 'Add New Amenity'}
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <Label htmlFor="add-amenity-en">🇬🇧 English</Label>
                            <Input
                                id="add-amenity-en"
                                value={addModalAmenity.en}
                                onChange={(e) => setAddModalAmenity(prev => ({ ...prev, en: e.target.value }))}
                                placeholder="English name"
                                className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            />
                        </div>
                        <div>
                            <Label htmlFor="add-amenity-bg">🇧🇬 Bulgarian</Label>
                            <Input
                                id="add-amenity-bg"
                                value={addModalAmenity.bg}
                                onChange={(e) => setAddModalAmenity(prev => ({ ...prev, bg: e.target.value }))}
                                placeholder="Българско име"
                                className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            />
                        </div>
                    </div>
                    
                    {/* Icon Selection */}
                    <div className="mb-6">
                        <Label>
                            {language === 'bg' ? 'Избор на икона' : 'Select Icon'} 
                            <span className="text-sm text-gray-500 ml-2">
                                ({language === 'bg' ? 'незадължително' : 'optional'})
                            </span>
                        </Label>
                        <div className="mt-2 grid grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
                            {AVAILABLE_ICONS.map((iconData) => {
                                const IconComponent = iconData.icon;
                                const isSelected = addModalAmenity.icon === iconData.id;
                                return (
                                    <button
                                        key={iconData.id}
                                        type="button"
                                        onClick={() => setAddModalAmenity(prev => ({ 
                                            ...prev, 
                                            icon: isSelected ? '' : iconData.id 
                                        }))}
                                        className={`p-2 rounded-lg border-2 transition-all duration-200 flex items-center justify-center hover:bg-gray-50 ${
                                            isSelected 
                                                ? 'border-blue-500 bg-blue-50 text-blue-600' 
                                                : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                        }`}
                                        title={iconData.name}
                                    >
                                        <IconComponent className="w-5 h-5" />
                                    </button>
                                );
                            })}
                        </div>
                        {addModalAmenity.icon && (
                            <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                                <span>{language === 'bg' ? 'Избрана икона:' : 'Selected icon:'}</span>
                                {renderAmenityIcon(addModalAmenity.icon)}
                                <span>{AVAILABLE_ICONS.find(i => i.id === addModalAmenity.icon)?.name}</span>
                            </div>
                        )}
                    </div>
                    
                    <div className="flex justify-end gap-3">
                        <Button 
                            onClick={closeAddModal} 
                            variant="outline"
                        >
                            {language === 'bg' ? 'Отказ' : 'Cancel'}
                        </Button>
                        <Button 
                            onClick={handleAddAmenity} 
                            disabled={loadingAmenities || !addModalAmenity.en.trim() || !addModalAmenity.bg.trim()}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {language === 'bg' ? 'Добави' : 'Add'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default SettingsAdmin; 