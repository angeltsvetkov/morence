import React, { useState, useEffect } from 'react';
import { useAdminLanguage } from '../../../hooks/useAdminLanguage';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { doc, collection, getDocs, addDoc, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { db } from '../../../firebase';
import { Testimonial } from '../../../types';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Plus, Edit, Trash2, Move, Quote, Star } from 'lucide-react';
import CountryPicker from '../../ui/country-picker';
import { getCountryByCode } from '../../../utils/countries';
import Modal from '../../common/Modal';

interface ApartmentTestimonialsTabProps {
    apartmentId: string;
    formLanguage: 'bg' | 'en';
    setFormLanguage: (lang: 'bg' | 'en') => void;
}

const ApartmentTestimonialsTab: React.FC<ApartmentTestimonialsTabProps> = ({
    apartmentId,
    formLanguage,
    setFormLanguage
}) => {
    const { t } = useAdminLanguage();
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
    const [newTestimonial, setNewTestimonial] = useState({
        text: { bg: '', en: '' },
        guestType: { bg: '', en: '' },
        nationality: '',
        ratings: {
            cleanliness: 5,
            communication: 5,
            comfort: 5
        },
        isActive: true
    });
    const [deletingTestimonialId, setDeletingTestimonialId] = useState<string | null>(null);

    useEffect(() => {
        if (apartmentId) {
            fetchTestimonials();
        }
    }, [apartmentId]);

    const fetchTestimonials = async () => {
        try {
            const testimonialsRef = collection(db, `apartments/${apartmentId}/testimonials`);
            const querySnapshot = await getDocs(testimonialsRef);
            const testimonialsData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate() || new Date()
            })) as Testimonial[];
            
            testimonialsData.sort((a, b) => a.order - b.order);
            setTestimonials(testimonialsData);
        } catch (error) {
            console.error('Error fetching testimonials:', error);
        }
    };

    const handleAddTestimonial = async () => {
        if (!newTestimonial.text.bg.trim() || !newTestimonial.text.en.trim() || 
            !newTestimonial.guestType.bg.trim() || !newTestimonial.guestType.en.trim()) {
            return;
        }

        setLoading(true);
        try {
            const maxOrder = testimonials.length > 0 ? Math.max(...testimonials.map(t => t.order)) : 0;
            await addDoc(collection(db, `apartments/${apartmentId}/testimonials`), {
                ...newTestimonial,
                order: maxOrder + 1,
                createdAt: new Date()
            });

            setNewTestimonial({
                text: { bg: '', en: '' },
                guestType: { bg: '', en: '' },
                nationality: '',
                ratings: {
                    cleanliness: 5,
                    communication: 5,
                    comfort: 5
                },
                isActive: true
            });
            setIsModalOpen(false);
            await fetchTestimonials();
        } catch (error) {
            console.error('Error adding testimonial:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEditTestimonial = async () => {
        if (!editingTestimonial) return;

        setLoading(true);
        try {
                    await updateDoc(doc(db, `apartments/${apartmentId}/testimonials`, editingTestimonial.id), {
            text: editingTestimonial.text,
            guestType: editingTestimonial.guestType,
            nationality: editingTestimonial.nationality,
            ratings: editingTestimonial.ratings,
            isActive: editingTestimonial.isActive
        });

            setEditingTestimonial(null);
            setIsModalOpen(false);
            await fetchTestimonials();
        } catch (error) {
            console.error('Error updating testimonial:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteTestimonial = async (testimonialId: string) => {
        setLoading(true);
        try {
            await deleteDoc(doc(db, `apartments/${apartmentId}/testimonials`, testimonialId));
            await fetchTestimonials();
        } catch (error) {
            console.error('Error deleting testimonial:', error);
        } finally {
            setLoading(false);
            setDeletingTestimonialId(null);
        }
    };

    const handleDragEnd = async (result: DropResult) => {
        if (!result.destination || !apartmentId) {
            return;
        }

        const sourceIndex = result.source.index;
        const destinationIndex = result.destination.index;

        if (sourceIndex === destinationIndex) {
            return;
        }

        const sortedTestimonials = [...testimonials].sort((a, b) => a.order - b.order);
        const [reorderedItem] = sortedTestimonials.splice(sourceIndex, 1);
        sortedTestimonials.splice(destinationIndex, 0, reorderedItem);

        // Update order values
        const updatedTestimonials = sortedTestimonials.map((testimonial, index) => ({
            ...testimonial,
            order: index + 1
        }));

        // Update local state immediately for smooth UX
        setTestimonials(prev => prev.map(t => {
            const updated = updatedTestimonials.find(ut => ut.id === t.id);
            return updated ? { ...t, order: updated.order } : t;
        }));

        try {
            // Batch update all testimonials with new order
            const batch = writeBatch(db);
            updatedTestimonials.forEach((testimonial) => {
                const testimonialRef = doc(db, `apartments/${apartmentId}/testimonials`, testimonial.id);
                batch.update(testimonialRef, { order: testimonial.order });
            });
            await batch.commit();
        } catch (error) {
            console.error('Error updating testimonial order:', error);
            // Revert on error
            await fetchTestimonials();
        }
    };

    const openEditModal = (testimonial: Testimonial) => {
        setEditingTestimonial({ 
            ...testimonial,
            nationality: testimonial.nationality || '',
            ratings: testimonial.ratings || {
                cleanliness: 5,
                communication: 5,
                comfort: 5
            }
        });
        setIsModalOpen(true);
    };

    const openAddModal = () => {
        setEditingTestimonial(null);
        setNewTestimonial({
            text: { bg: '', en: '' },
            guestType: { bg: '', en: '' },
            nationality: '',
            ratings: {
                cleanliness: 5,
                communication: 5,
                comfort: 5
            },
            isActive: true
        });
        setIsModalOpen(true);
    };

    const toggleTestimonialActive = async (testimonialId: string, currentStatus: boolean) => {
        try {
            await updateDoc(doc(db, `apartments/${apartmentId}/testimonials`, testimonialId), {
                isActive: !currentStatus
            });
            await fetchTestimonials();
        } catch (error) {
            console.error('Error toggling testimonial status:', error);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">{t('testimonials')}</h2>
                    <p className="text-gray-600">{t('manageTestimonials')}</p>
                </div>
                <div className="flex items-center gap-4">
                    {/* Language Toggle */}
                    <div className="flex bg-gray-100 rounded-lg p-1">
                        <button
                            onClick={() => setFormLanguage('bg')}
                            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                                formLanguage === 'bg' 
                                    ? 'bg-white text-gray-900 shadow-sm' 
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            БГ
                        </button>
                        <button
                            onClick={() => setFormLanguage('en')}
                            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                                formLanguage === 'en' 
                                    ? 'bg-white text-gray-900 shadow-sm' 
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            EN
                        </button>
                    </div>
                    
                    <Button onClick={openAddModal} className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="w-4 h-4 mr-2" />
                        {t('addTestimonial')}
                    </Button>
                </div>
            </div>

            {/* Testimonials List */}
            <div className="bg-white rounded-lg border border-gray-200">
                {testimonials.length === 0 ? (
                    <div className="p-8 text-center">
                        <Quote className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">{t('noTestimonials')}</h3>
                        <p className="text-gray-600 mb-4">{t('addFirstTestimonial')}</p>
                        <Button onClick={openAddModal} className="bg-blue-600 hover:bg-blue-700">
                            <Plus className="w-4 h-4 mr-2" />
                            {t('addTestimonial')}
                        </Button>
                    </div>
                ) : (
                    <DragDropContext onDragEnd={handleDragEnd}>
                        <Droppable droppableId="testimonials">
                            {(provided) => (
                                <div
                                    className="divide-y divide-gray-200"
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                >
                                    {[...testimonials]
                                        .sort((a, b) => a.order - b.order)
                                        .map((testimonial, index) => (
                                        <Draggable key={testimonial.id} draggableId={testimonial.id} index={index}>
                                            {(provided, snapshot) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    className={`p-4 transition-all ${
                                                        snapshot.isDragging 
                                                            ? 'shadow-lg bg-white border-2 border-blue-300 rotate-1' 
                                                            : 'hover:bg-gray-50'
                                                    }`}
                                                >
                                                    <div className="flex items-start gap-4">
                                                        {/* Drag Handle */}
                                                        <div 
                                                            {...provided.dragHandleProps}
                                                            className="cursor-move text-gray-400 hover:text-gray-600 mt-2"
                                                        >
                                                            <Move className="w-5 h-5" />
                                                        </div>

                                                        {/* Testimonial Content */}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <span className="text-sm font-medium text-gray-600">
                                                                    #{index + 1}
                                                                </span>
                                                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                                    testimonial.isActive 
                                                                        ? 'bg-green-100 text-green-800' 
                                                                        : 'bg-gray-100 text-gray-600'
                                                                }`}>
                                                                    {testimonial.isActive ? t('active') : t('inactive')}
                                                                </span>
                                                            </div>
                                                                                                        <blockquote className="text-gray-900 mb-2 italic">
                                                "{formLanguage === 'bg' ? testimonial.text.bg : testimonial.text.en}"
                                            </blockquote>
                                                                        <div className="flex items-center gap-4 mb-2">
                                <div className="flex items-center gap-1">
                                    <span className="text-xs text-gray-500">{t('cleanliness')}:</span>
                                    <div className="flex">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className={`w-3 h-3 ${i < (testimonial.ratings?.cleanliness || 5) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                                        ))}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="text-xs text-gray-500">{t('communication')}:</span>
                                    <div className="flex">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className={`w-3 h-3 ${i < (testimonial.ratings?.communication || 5) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                                        ))}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="text-xs text-gray-500">{t('comfort')}:</span>
                                    <div className="flex">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className={`w-3 h-3 ${i < (testimonial.ratings?.comfort || 5) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <p className="text-sm text-gray-600">
                                — {formLanguage === 'bg' ? testimonial.guestType.bg : testimonial.guestType.en}
                                {testimonial.nationality && (
                                    <span className="text-xs text-gray-500 ml-2 flex items-center gap-1">
                                        {(() => {
                                            const country = getCountryByCode(testimonial.nationality);
                                            return country ? (
                                                <>
                                                    {country.flag} {country.name[formLanguage as 'bg' | 'en']}
                                                </>
                                            ) : (
                                                `🌍 ${testimonial.nationality}`
                                            );
                                        })()}
                                    </span>
                                )}
                            </p>
                                                        </div>

                                                        {/* Actions */}
                                                        <div className="flex items-center gap-2">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => toggleTestimonialActive(testimonial.id, testimonial.isActive)}
                                                                className={testimonial.isActive ? 'text-orange-600 hover:text-orange-700' : 'text-green-600 hover:text-green-700'}
                                                            >
                                                                {testimonial.isActive ? t('deactivate') : t('activate')}
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => openEditModal(testimonial)}
                                                                className="text-blue-600 hover:text-blue-700"
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => setDeletingTestimonialId(testimonial.id)}
                                                                className="text-red-600 hover:text-red-700"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                )}
            </div>

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <Modal
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setEditingTestimonial(null);
                    }}
                    className="w-full max-w-2xl"
                >
                    <div className="p-6">
                        <h3 className="text-lg font-semibold mb-4">
                            {editingTestimonial ? t('editTestimonial') : t('addTestimonial')}
                        </h3>
                        
                        <div className="space-y-4">
                            {/* Language selector for form */}
                            <div className="flex bg-gray-100 rounded-lg p-1 w-fit">
                                <button
                                    onClick={() => setFormLanguage('bg')}
                                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                                        formLanguage === 'bg' 
                                            ? 'bg-white text-gray-900 shadow-sm' 
                                            : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    БГ
                                </button>
                                <button
                                    onClick={() => setFormLanguage('en')}
                                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                                        formLanguage === 'en' 
                                            ? 'bg-white text-gray-900 shadow-sm' 
                                            : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    EN
                                </button>
                            </div>

                            {/* Testimonial Text */}
                            <div>
                                <Label htmlFor="testimonialText" className="text-sm font-medium text-gray-900">
                                    {t('testimonialText')} ({formLanguage.toUpperCase()})
                                </Label>
                                <textarea
                                    id="testimonialText"
                                    value={editingTestimonial ? editingTestimonial.text[formLanguage] : newTestimonial.text[formLanguage]}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (editingTestimonial) {
                                            setEditingTestimonial(prev => prev ? {
                                                ...prev,
                                                text: { ...prev.text, [formLanguage]: value }
                                            } : null);
                                        } else {
                                            setNewTestimonial(prev => ({
                                                ...prev,
                                                text: { ...prev.text, [formLanguage]: value }
                                            }));
                                        }
                                    }}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 resize-none"
                                    rows={4}
                                    placeholder={t('enterTestimonialText')}
                                />
                            </div>

                            {/* Guest Type */}
                            <div>
                                <Label htmlFor="guestType" className="text-sm font-medium text-gray-900">
                                    {t('guestType')} ({formLanguage.toUpperCase()})
                                </Label>
                                <Input
                                    id="guestType"
                                    value={editingTestimonial ? editingTestimonial.guestType[formLanguage] : newTestimonial.guestType[formLanguage]}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (editingTestimonial) {
                                            setEditingTestimonial(prev => prev ? {
                                                ...prev,
                                                guestType: { ...prev.guestType, [formLanguage]: value }
                                            } : null);
                                        } else {
                                            setNewTestimonial(prev => ({
                                                ...prev,
                                                guestType: { ...prev.guestType, [formLanguage]: value }
                                            }));
                                        }
                                    }}
                                    className="mt-1"
                                    placeholder={t('enterGuestType')}
                                />
                            </div>

                            {/* Nationality */}
                            <div>
                                <Label htmlFor="nationality" className="text-sm font-medium text-gray-900">
                                    {t('guestNationality')}
                                </Label>
                                <div className="mt-1">
                                    <CountryPicker
                                        value={editingTestimonial ? editingTestimonial.nationality : newTestimonial.nationality}
                                        onChange={(countryCode) => {
                                            if (editingTestimonial) {
                                                setEditingTestimonial(prev => prev ? {
                                                    ...prev,
                                                    nationality: countryCode
                                                } : null);
                                            } else {
                                                setNewTestimonial(prev => ({
                                                    ...prev,
                                                    nationality: countryCode
                                                }));
                                            }
                                        }}
                                        placeholder={t('selectCountry')}
                                        language={t('language') === 'bg' ? 'bg' : 'en'}
                                        className="w-full"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">{t('nationalityHint')}</p>
                            </div>

                            {/* Ratings */}
                            <div>
                                <Label className="text-sm font-medium text-gray-900 mb-3 block">{t('ratings')}</Label>
                                <div className="space-y-4">
                                    {/* Cleanliness Rating */}
                                    <div>
                                        <Label className="text-sm text-gray-700 mb-2 block">{t('cleanliness')}</Label>
                                        <div className="flex items-center gap-2">
                                            {[1, 2, 3, 4, 5].map((rating) => (
                                                <button
                                                    key={rating}
                                                    type="button"
                                                    onClick={() => {
                                                        if (editingTestimonial) {
                                                            setEditingTestimonial(prev => prev ? {
                                                                ...prev,
                                                                ratings: { ...prev.ratings, cleanliness: rating }
                                                            } : null);
                                                        } else {
                                                            setNewTestimonial(prev => ({
                                                                ...prev,
                                                                ratings: { ...prev.ratings, cleanliness: rating }
                                                            }));
                                                        }
                                                    }}
                                                    className="focus:outline-none"
                                                >
                                                    <Star 
                                                        className={`w-6 h-6 ${
                                                            rating <= (editingTestimonial ? (editingTestimonial.ratings?.cleanliness || 5) : newTestimonial.ratings.cleanliness)
                                                                ? 'text-yellow-400 fill-current' 
                                                                : 'text-gray-300'
                                                        } hover:text-yellow-400 transition-colors`}
                                                    />
                                                </button>
                                            ))}
                                            <span className="text-sm text-gray-600 ml-2">
                                                {editingTestimonial ? (editingTestimonial.ratings?.cleanliness || 5) : newTestimonial.ratings.cleanliness}/5
                                            </span>
                                        </div>
                                    </div>

                                    {/* Communication Rating */}
                                    <div>
                                        <Label className="text-sm text-gray-700 mb-2 block">{t('communication')}</Label>
                                        <div className="flex items-center gap-2">
                                            {[1, 2, 3, 4, 5].map((rating) => (
                                                <button
                                                    key={rating}
                                                    type="button"
                                                    onClick={() => {
                                                        if (editingTestimonial) {
                                                            setEditingTestimonial(prev => prev ? {
                                                                ...prev,
                                                                ratings: { ...prev.ratings, communication: rating }
                                                            } : null);
                                                        } else {
                                                            setNewTestimonial(prev => ({
                                                                ...prev,
                                                                ratings: { ...prev.ratings, communication: rating }
                                                            }));
                                                        }
                                                    }}
                                                    className="focus:outline-none"
                                                >
                                                    <Star 
                                                        className={`w-6 h-6 ${
                                                            rating <= (editingTestimonial ? (editingTestimonial.ratings?.communication || 5) : newTestimonial.ratings.communication)
                                                                ? 'text-yellow-400 fill-current' 
                                                                : 'text-gray-300'
                                                        } hover:text-yellow-400 transition-colors`}
                                                    />
                                                </button>
                                            ))}
                                            <span className="text-sm text-gray-600 ml-2">
                                                {editingTestimonial ? (editingTestimonial.ratings?.communication || 5) : newTestimonial.ratings.communication}/5
                                            </span>
                                        </div>
                                    </div>

                                    {/* Comfort Rating */}
                                    <div>
                                        <Label className="text-sm text-gray-700 mb-2 block">{t('comfort')}</Label>
                                        <div className="flex items-center gap-2">
                                            {[1, 2, 3, 4, 5].map((rating) => (
                                                <button
                                                    key={rating}
                                                    type="button"
                                                    onClick={() => {
                                                        if (editingTestimonial) {
                                                            setEditingTestimonial(prev => prev ? {
                                                                ...prev,
                                                                ratings: { ...prev.ratings, comfort: rating }
                                                            } : null);
                                                        } else {
                                                            setNewTestimonial(prev => ({
                                                                ...prev,
                                                                ratings: { ...prev.ratings, comfort: rating }
                                                            }));
                                                        }
                                                    }}
                                                    className="focus:outline-none"
                                                >
                                                    <Star 
                                                        className={`w-6 h-6 ${
                                                            rating <= (editingTestimonial ? (editingTestimonial.ratings?.comfort || 5) : newTestimonial.ratings.comfort)
                                                                ? 'text-yellow-400 fill-current' 
                                                                : 'text-gray-300'
                                                        } hover:text-yellow-400 transition-colors`}
                                                    />
                                                </button>
                                            ))}
                                            <span className="text-sm text-gray-600 ml-2">
                                                {editingTestimonial ? (editingTestimonial.ratings?.comfort || 5) : newTestimonial.ratings.comfort}/5
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Active Status */}
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={editingTestimonial ? editingTestimonial.isActive : newTestimonial.isActive}
                                    onChange={(e) => {
                                        const checked = e.target.checked;
                                        if (editingTestimonial) {
                                            setEditingTestimonial(prev => prev ? {
                                                ...prev,
                                                isActive: checked
                                            } : null);
                                        } else {
                                            setNewTestimonial(prev => ({
                                                ...prev,
                                                isActive: checked
                                            }));
                                        }
                                    }}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <Label htmlFor="isActive" className="ml-2 text-sm text-gray-900">
                                    {t('activeTestimonial')}
                                </Label>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 mt-6">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setIsModalOpen(false);
                                    setEditingTestimonial(null);
                                }}
                            >
                                {t('cancel')}
                            </Button>
                            <Button
                                onClick={editingTestimonial ? handleEditTestimonial : handleAddTestimonial}
                                disabled={loading}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                {loading ? t('saving') : t('save')}
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Delete Confirmation */}
            {deletingTestimonialId && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                        <h3 className="text-lg font-semibold mb-4">{t('deleteTestimonial')}</h3>
                        <p className="text-sm text-gray-600 mb-4">{t('confirmDeleteTestimonial')}</p>
                        <div className="flex justify-end gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setDeletingTestimonialId(null)}
                            >
                                {t('cancel')}
                            </Button>
                            <Button
                                onClick={() => handleDeleteTestimonial(deletingTestimonialId)}
                                disabled={loading}
                                className="bg-red-600 hover:bg-red-700 text-white"
                            >
                                {loading ? t('deleting') : t('delete')}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ApartmentTestimonialsTab; 