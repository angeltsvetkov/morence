import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../../firebase';
import { collection, addDoc, getDocs, doc, deleteDoc, query, where } from 'firebase/firestore';
import { useLanguage } from '../../hooks/useLanguage';
import { useAdminLanguage } from '../../hooks/useAdminLanguage';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from "../../components/ui/button";
import { generateUniqueSlug } from '../../lib/utils';
import { Apartment } from '../../types';

const ApartmentsAdmin: React.FC = () => {
    const { language } = useLanguage(); // For apartment description display
    const { t } = useAdminLanguage(); // For admin UI translations
    const { isSuperAdmin, userId } = useAuth();
    const navigate = useNavigate();
    const [apartments, setApartments] = useState<Apartment[]>([]);
    const [loading, setLoading] = useState(false);

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
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800">{t('manageApartments')}</h2>
                <button 
                    onClick={createNewApartment} 
                    disabled={loading}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-blue-300"
                >
                    {loading ? t('loading') + '...' : t('addNewApartment')}
                </button>
            </div>

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
    );
};

export default ApartmentsAdmin;
