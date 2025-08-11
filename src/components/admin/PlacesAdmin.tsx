import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, DocumentData } from 'firebase/firestore';
import { db } from '../../firebase';
import { Language } from '../../contexts/LanguageContext';
import { useAdminLanguage } from '../../hooks/useAdminLanguage';
import { useLanguage } from '../../hooks/useLanguage';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { MoreHorizontal, PlusCircle, Link as LinkIcon, MapPin, Milestone } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

interface Place {
  id: string;
  title: { [key in Language]?: string };
  description: { [key in Language]?: string };
  imageUrl: string;
  url?: string;
  distance?: number;
  location?: string;
}

const PlacesAdmin: React.FC = () => {
    const { language } = useLanguage(); // For place content display
    const { t } = useAdminLanguage(); // For admin UI translations
    const { isSuperAdmin } = useAuth();
    const [places, setPlaces] = useState<Place[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPlace, setCurrentPlace] = useState<Partial<Place> | null>(null);
    const [formLanguage, setFormLanguage] = useState<Language>('bg');

    // Only super admin can access places
    if (!isSuperAdmin) {
        return (
            <div className="p-6 text-center">
                <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
                <p className="text-gray-600">You don't have permission to manage places.</p>
            </div>
        );
    }

    const fetchPlaces = async () => {
        setLoading(true);
        const placesCollection = collection(db, 'places');
        const placesSnapshot = await getDocs(placesCollection);
        const placesList = placesSnapshot.docs.map((doc: DocumentData) => ({ id: doc.id, ...doc.data() } as Place));
        setPlaces(placesList);
        setLoading(false);
    };

    useEffect(() => {
        fetchPlaces();
    }, []);

    const openModal = (place: Partial<Place> | null = null) => {
        setCurrentPlace(place ? { ...place } : { title: {}, description: {}, imageUrl: '' });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentPlace(null);
    };

    const handleSave = async () => {
        if (!currentPlace) return;

        setLoading(true);
        try {
            if (currentPlace.id) {
                const placeDoc = doc(db, 'places', currentPlace.id);
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { id, ...placeData } = currentPlace;
                await updateDoc(placeDoc, placeData);
            } else {
                await addDoc(collection(db, 'places'), currentPlace);
            }
            fetchPlaces();
            closeModal();
        } catch (error) {
            console.error("Error saving place: ", error);
        } finally {
            setLoading(false);
        }
    };
    
    const handleDelete = async (id: string) => {
        if (window.confirm(t('confirmDeletePlace'))) {
            setLoading(true);
            try {
                await deleteDoc(doc(db, 'places', id));
                fetchPlaces();
            } catch (error) {
                console.error("Error deleting place: ", error);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleInputChange = (field: keyof Place, value: string | number | undefined) => {
        setCurrentPlace(prev => prev ? { ...prev, [field]: value } : null);
    };

    const handleTranslatableInputChange = (field: 'title' | 'description', lang: Language, value: string) => {
        setCurrentPlace(prev => {
            if (!prev) return null;
            const newFieldData = { ...prev[field], [lang]: value };
            return { ...prev, [field]: newFieldData };
        });
    };

    if (loading && !isModalOpen) {
        return (
            <div className="flex justify-center items-center h-full">
                <p>{t('loadingPlaces') || 'Loading places...'}</p>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">{t('managePlaces')}</h1>
                <Button onClick={() => openModal()} className="flex items-center gap-2">
                    <PlusCircle className="w-5 h-5" />
                    <span>{t('addNewPlace')}</span>
                </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {places.map(place => (
                    <div key={place.id} className="bg-white rounded-lg shadow-lg overflow-hidden group">
                        <div className="relative">
                            <img src={place.imageUrl} alt={place.title?.[language as Language] || 'Place image'} className="w-full h-56 object-cover" />
                            <div className="absolute top-2 right-2">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => openModal(place)}>
                                            Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleDelete(place.id)} className="text-red-500">
                                            Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                        <div className="p-6">
                            <h3 className="text-xl font-semibold mb-2 truncate">{place.title?.[language as Language] || place.title?.['bg'] || 'Untitled'}</h3>
                            <p className="text-gray-600 h-16 overflow-hidden text-ellipsis">{place.description?.[language as Language] || place.description?.['bg'] || 'No description'}</p>
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <div className="flex items-center text-sm text-gray-500 mb-2">
                                    {place.location && (
                                        <a 
                                          href={typeof place.location === 'string' && place.location.startsWith('http') ? place.location : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(String(place.location))}`} 
                                          target="_blank" 
                                          rel="noopener noreferrer" 
                                          className="flex items-center mr-4 hover:text-blue-500 transition-colors truncate"
                                        >
                                            <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                                            <span className="truncate">{typeof place.location === 'string' && place.location.startsWith('http') ? t('viewOnMap') : place.location}</span>
                                        </a>
                                    )}
                                </div>
                                <div className="flex items-center text-sm text-gray-500">
                                    {place.distance != null && (
                                        <div className="flex items-center mr-4">
                                            <Milestone className="w-4 h-4 mr-1" />
                                            <span>{place.distance} km</span>
                                        </div>
                                    )}
                                    {place.url && (
                                        <a href={place.url} target="_blank" rel="noopener noreferrer" className="flex items-center hover:text-blue-500 transition-colors truncate">
                                            <LinkIcon className="w-4 h-4 mr-1" />
                                            <span className="truncate">Website</span>
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && currentPlace && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4">{currentPlace.id ? (t('editPlace') || 'Edit Place') : (t('addNewPlace') || 'Add New Place')}</h2>
                        
                        <div className="flex justify-end mb-4 border-b pb-2">
                            <Button size="sm" onClick={() => setFormLanguage('bg')} variant={formLanguage === 'bg' ? 'default' : 'outline'}>BG</Button>
                            <Button size="sm" onClick={() => setFormLanguage('en')} variant={formLanguage === 'en' ? 'default' : 'outline'} className="ml-2">EN</Button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <Label>{t('title')} ({formLanguage.toUpperCase()})</Label>
                                <Input 
                                    value={currentPlace.title?.[formLanguage] || ''} 
                                    onChange={e => handleTranslatableInputChange('title', formLanguage, e.target.value)}
                                    placeholder={t('placeholderRopotamo')}
                                    className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                />
                            </div>
                            <div>
                                <Label>{t('description')} ({formLanguage.toUpperCase()})</Label>
                                <textarea 
                                    value={currentPlace.description?.[formLanguage] || ''} 
                                    onChange={e => handleTranslatableInputChange('description', formLanguage, e.target.value)}
                                    className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    rows={4}
                                    placeholder={t('placeholderDescription')}
                                />
                            </div>
                            <div>
                                <Label>{t('imageUrl')}</Label>
                                <Input 
                                    value={currentPlace.imageUrl || ''} 
                                    onChange={e => handleInputChange('imageUrl', e.target.value)}
                                    placeholder={t('placeholderImageUrl')}
                                    className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                />
                            </div>
                            <div>
                                <Label>{t('websiteUrl')}</Label>
                                <Input 
                                    value={currentPlace.url || ''} 
                                    onChange={e => handleInputChange('url', e.target.value)}
                                    placeholder={t('placeholderWebsite')}
                                    className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                />
                            </div>
                            <div>
                                <Label>{t('locationHint')}</Label>
                                <Input 
                                    value={currentPlace.location || ''} 
                                    onChange={e => handleInputChange('location', e.target.value)}
                                    placeholder={t('placeholderLocation')}
                                    className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                />
                            </div>
                            <div>
                                <Label>{t('distance')} (in km, optional)</Label>
                                <Input 
                                    type="number"
                                    value={currentPlace.distance || ''} 
                                    onChange={e => handleInputChange('distance', e.target.value ? Number(e.target.value) : undefined)}
                                    placeholder={t('placeholderDistance')}
                                    className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                />
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end space-x-4">
                            <Button variant="outline" onClick={closeModal}>{t('cancel')}</Button>
                            <Button onClick={handleSave} disabled={loading}>
                                {loading ? t('saving') : t('savePlace')}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PlacesAdmin;
