import React, { useState, useEffect, useCallback, useRef } from 'react';
import { db, auth } from '../../firebase';
import { collection, addDoc, getDocs, doc, deleteDoc, query, where } from 'firebase/firestore';
import { useLanguage } from '../../hooks/useLanguage';
import { useAdminLanguage } from '../../hooks/useAdminLanguage';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from "../../components/ui/button";
import { generateUniqueSlug } from '../../lib/utils';
import { Apartment } from '../../types';
import { LogOut, ChevronDown, Waves } from 'lucide-react';

const ApartmentsAdmin: React.FC = () => {
    const { language } = useLanguage(); // For apartment description display
    const { t, language: adminLanguage, setLanguage: setAdminLanguage } = useAdminLanguage(); // For admin UI translations
    const { isSuperAdmin, userId, user } = useAuth();
    const navigate = useNavigate();
    const [apartments, setApartments] = useState<Apartment[]>([]);
    const [loading, setLoading] = useState(false);
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

    // Helper function to get apartment name in current language
    const getApartmentName = (apartment: Apartment): string => {
        if (typeof apartment.name === 'string') {
            return apartment.name; // Backward compatibility
        }
        return apartment.name?.[language as 'bg' | 'en'] || apartment.name?.en || apartment.name?.bg || 'Unnamed Apartment';
    };

    const fetchApartments = useCallback(async () => {
        if (!userId) return;
        
        setLoading(true);
        let querySnapshot;
        
        if (isSuperAdmin) {
            // Super admin sees all apartments
            querySnapshot = await getDocs(collection(db, "apartments"));
        } else {
            // Regular users see only their own apartments
            const q = query(collection(db, "apartments"), where("ownerId", "==", userId));
            querySnapshot = await getDocs(q);
        }
        
        const apts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Apartment));
        setApartments(apts);
        setLoading(false);
    }, [userId, isSuperAdmin]);

    useEffect(() => {
        fetchApartments();
    }, [fetchApartments]);

    const createNewApartment = async () => {
        if (!userId) return;
        
        setLoading(true);

        // Generate unique slug for the apartment
        const newApartmentSlug = generateUniqueSlug();

        // Create a minimal apartment record
        const newApartmentData = {
            name: { bg: 'Нов апартамент', en: 'New Apartment' },
            description: { bg: '', en: '' },
            amenities: [],
            photos: [],
            pricing: { perNight: { bg: 0, en: 0 } },
            slug: newApartmentSlug,
            ownerId: userId,
            isDefault: false,
            createdAt: new Date(),
        };

        try {
            const docRef = await addDoc(collection(db, "apartments"), newApartmentData);
            console.log("New apartment created with ID:", docRef.id);
            
            // Navigate directly to the edit page
            navigate(`/admin/apartments/${newApartmentSlug}`);
        } catch (error) {
            console.error("Error creating apartment: ", error);
            // TODO: Show an error message to the user
        } finally {
            setLoading(false);
        }
    };

    const handleCardClick = (slug: string) => {
        navigate(`/admin/apartments/${slug}`);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm(t('confirmDeleteApartment'))) {
            setLoading(true);
            // Note: Also delete photos from storage and subcollections if necessary
            await deleteDoc(doc(db, 'apartments', id));
            fetchApartments();
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 sticky top-0 z-10">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-3 sm:gap-0">
                    <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
                        {/* Morence.top branding */}
                        <div className="bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 backdrop-blur-sm border border-white/20 flex items-center gap-2">
                            <Waves className="w-4 h-4 text-white animate-pulse" />
                            <div className="flex items-baseline">
                                <span className="text-white text-sm font-bold tracking-wider uppercase bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">morence</span>
                                <span className="text-blue-100 text-xs font-light">.top</span>
                            </div>
                        </div>
                        <div className="w-px h-6 bg-gray-300 hidden sm:block"></div>
                        
                        <h1 className="text-lg sm:text-2xl font-bold text-gray-900">
                            {t('manageApartments')}
                        </h1>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <button 
                            onClick={createNewApartment} 
                            disabled={loading}
                            className="bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-blue-300 text-sm"
                        >
                            {loading ? t('loading') + '...' : t('addNewApartment')}
                        </button>
                        
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
                {loading ? <p>{t('loading')}...</p> : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {apartments.map(apt => (
                            <div key={apt.id} className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer" onClick={() => handleCardClick(apt.slug)}>
                                {apt.photos && apt.photos.length > 0 ? (
                                    <img src={apt.photos[0]} alt={getApartmentName(apt)} className="w-full h-48 object-cover" />
                                ) : (
                                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                                        <span className="text-gray-500">{t('noImageAvailable')}</span>
                                    </div>
                                )}
                                <div className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-xl font-bold">{getApartmentName(apt)}</h3>
                                        {apt.apartmentNumber && (
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                #{apt.apartmentNumber}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-gray-600 mb-4 h-24 overflow-y-auto">{apt.description?.[language] || apt.description?.bg}</p>
                                    <div className="flex justify-end mt-4 space-x-2">
                                        <Button variant="destructive" size="sm" onClick={(e) => { e.stopPropagation(); handleDelete(apt.id); }}>{t('delete')}</Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ApartmentsAdmin;
