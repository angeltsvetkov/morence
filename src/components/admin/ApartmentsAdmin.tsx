import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../../firebase';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, getDocs, doc, deleteDoc } from 'firebase/firestore';
import Modal from '../common/Modal';
import { useAdminLanguage } from '../../hooks/useAdminLanguage';
import { useLanguage } from '../../hooks/useLanguage';
import { Language } from '../../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { Button } from "../../components/ui/button";
import { slugify, generateUniqueSlug } from '../../lib/utils';
import { Apartment, PricingOffer } from '../../types';

const storage = getStorage();

const ApartmentsAdmin: React.FC = () => {
    const { language } = useLanguage(); // For apartment description display
    const { t } = useAdminLanguage(); // For admin UI translations
    const navigate = useNavigate();
    const [apartments, setApartments] = useState<Apartment[]>([]);

    // Helper function to get apartment name in current language
    const getApartmentName = (apartment: Apartment): string => {
        if (typeof apartment.name === 'string') {
            return apartment.name; // Backward compatibility
        }
        return apartment.name?.[language] || apartment.name?.en || apartment.name?.bg || 'Unnamed Apartment';
    };
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentApartmentData, setCurrentApartmentData] = useState<Partial<Apartment>>({ 
        name: { bg: '', en: '' }, 
        description: { bg: '', en: '' }, 
        amenities: [], 
        photos: [], 
        pricing: { perNight: { bg: 0, en: 0 } } 
    });
    const [imageFiles, setImageFiles] = useState<FileList | null>(null);
    const [loading, setLoading] = useState(false);
    const [modalLanguage, setModalLanguage] = useState<Language>('bg');

    const fetchApartments = useCallback(async () => {
        setLoading(true);
        const querySnapshot = await getDocs(collection(db, "apartments"));
        const apts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Apartment));
        setApartments(apts);
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchApartments();
    }, [fetchApartments]);

    const openModalForNew = () => {
        setCurrentApartmentData({
            name: { bg: '', en: '' },
            description: { bg: '', en: '' },
            amenities: [],
            photos: [],
            pricing: { perNight: { bg: 0, en: 0 } }
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentApartmentData({ 
            name: { bg: '', en: '' }, 
            description: { bg: '', en: '' }, 
            amenities: [], 
            photos: [], 
            pricing: { perNight: { bg: 0, en: 0 } } 
        });
        setImageFiles(null);
    };

    const handleDataChange = (field: keyof Apartment, value: Apartment[keyof Apartment]) => {
        setCurrentApartmentData(prev => ({ ...prev, [field]: value }));
    };

    const handleDescriptionChange = (lang: Language, value: string) => {
        setCurrentApartmentData(prev => ({
            ...prev,
            description: {
                ...prev.description,
                [lang]: value,
            }
        }));
    };

    const handleCardClick = (slug: string) => {
        navigate(`/admin/apartments/${slug}`);
    };

    const handleSave = async () => {
        if (!currentApartmentData) return;
        setLoading(true);

        let photoURLs = currentApartmentData.photos || [];

        // Generate unique slug for the apartment
        const newApartmentSlug = generateUniqueSlug();

        if (imageFiles && imageFiles.length > 0) {
            const uploadPromises = Array.from(imageFiles).map(async (file) => {
                // For new apartments, use temporary slug initially - will be moved to proper folder later
                const timestamp = Date.now();
                const fileName = `${timestamp}_${file.name}`;
                const storageRef = ref(storage, `apartments/temp/${newApartmentSlug}/photos/${fileName}`);
                await uploadBytes(storageRef, file);
                return getDownloadURL(storageRef);
            });

            try {
                const newPhotoURLs = await Promise.all(uploadPromises);
                photoURLs = [...photoURLs, ...newPhotoURLs];
            } catch (error) {
                console.error("Error uploading images: ", error);
                setLoading(false);
                // TODO: Show an error message to the user
                return;
            }
        }

        const apartmentDataToSave = {
            ...currentApartmentData,
            slug: newApartmentSlug,
            photos: photoURLs,
        };

        try {
            const docRef = await addDoc(collection(db, "apartments"), apartmentDataToSave);
            
            // TODO: Move photos from temp folder to final apartment ID folder
            // This would require additional storage operations to move the files
            // For now, photos will remain in temp folder until user edits the apartment
            
            closeModal();
            fetchApartments();
            navigate(`/admin/apartments/${newApartmentSlug}`);
        } catch (error) {
            console.error("Error adding apartment: ", error);
            // TODO: Show an error message to the user
        } finally {
            setLoading(false);
        }
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
                <button onClick={openModalForNew} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                    {t('addNewApartment')}
                </button>
            </div>

            {loading ? <p>{t('loading')}...</p> : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {apartments.map(apt => (
                        <div key={apt.id} className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer" onClick={() => handleCardClick(apt.slug)}>
                            {apt.photos && apt.photos.length > 0 ? (
                                <img src={apt.photos[0]} alt={apt.name} className="w-full h-48 object-cover" />
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

            <Modal isOpen={isModalOpen} onClose={closeModal}>
                <div className="p-6 w-[90vw] max-w-4xl">
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold">{t('addNewApartment')}</h3>
                        <input
                            type="text"
                            placeholder={t('apartmentName')}
                            value={currentApartmentData.name || ''}
                            onChange={e => handleDataChange('name', e.target.value)}
                            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        />
                        
                        <div className="flex mb-4">
                            <button onClick={() => setModalLanguage('bg')} className={`px-4 py-2 rounded-l-md ${modalLanguage === 'bg' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>BG</button>
                            <button onClick={() => setModalLanguage('en')} className={`px-4 py-2 rounded-r-md ${modalLanguage === 'en' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>EN</button>
                        </div>

                        <textarea
                            placeholder={`${t('description')} (${modalLanguage.toUpperCase()})`}
                            value={currentApartmentData.description?.[modalLanguage] || ''}
                            onChange={e => handleDescriptionChange(modalLanguage, e.target.value)}
                            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors h-32"
                        />

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Photos</label>
                            <input
                                type="file"
                                multiple
                                onChange={e => setImageFiles(e.target.files)}
                                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100"
                            />
                            <div className="flex flex-wrap gap-2 mt-2">
                                {currentApartmentData.photos?.map(photo => <img key={photo} src={photo} className="w-24 h-24 object-cover rounded" />)}
                            </div>
                        </div>

                        <input
                            type="number"
                            placeholder="Price per night"
                            value={currentApartmentData.pricing?.perNight || ''}
                            onChange={e => handleDataChange('pricing', { ...currentApartmentData.pricing, perNight: Number(e.target.value) })}
                            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        />

                        <div className="flex justify-end space-x-2">
                            <button onClick={closeModal} className="px-4 py-2 border rounded">Cancel</button>
                            <button onClick={handleSave} disabled={loading} className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-blue-300">
                                {loading ? 'Saving...' : 'Save & Continue'}
                            </button>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default ApartmentsAdmin;
