import React, { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, query, where, doc, updateDoc, addDoc, deleteDoc, orderBy, writeBatch } from 'firebase/firestore';
import { db } from '../../../firebase';
import { useAdminLanguage } from '../../../hooks/useAdminLanguage';
import { useLanguage } from '../../../hooks/useLanguage';
import { TabProps } from './types';
import LoadingSpinner from '../../common/LoadingSpinner';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { SurveyQuestion, Booking } from '../../../types';
import SurveyQuestionModal from './SurveyQuestionModal';
import DragAndDropQuestions from './DragAndDropQuestions';

interface SurveyResponse {
    id: string;
    bookingId: string;
    guestName?: string;
    guestEmail?: string;
    surveyData: {
        rating: number;
        cleanliness: number;
        communication: number;
        location: number;
        value: number;
        comments: string;
        wouldRecommend: boolean;
    };
    surveySubmittedAt: Date;
    bookingStart: Date;
    bookingEnd: Date;
}

interface ApartmentFeedbackTabProps extends TabProps {
    apartment: any;
    showConfirmation: (title: string, message: string, onConfirm: () => void) => void;
}

const ApartmentFeedbackTab: React.FC<ApartmentFeedbackTabProps> = ({ apartment, currentApartmentData, setCurrentApartmentData, showConfirmation }) => {
    const { t, language: adminLanguage } = useAdminLanguage();
    const { language } = useLanguage();
    const [feedbackList, setFeedbackList] = useState<SurveyResponse[]>([]);
    const [allBookings, setAllBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState<'date' | 'rating' | 'guest'>('date');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    
    const [surveyQuestions, setSurveyQuestions] = useState<SurveyQuestion[]>([]);
    const [showAddQuestion, setShowAddQuestion] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<SurveyQuestion | null>(null);
    const [showPreview, setShowPreview] = useState(false);
    const [previewLanguage, setPreviewLanguage] = useState<'bg' | 'en'>('bg');
    const [newQuestion, setNewQuestion] = useState<Partial<SurveyQuestion>>({
        question: { bg: '', en: '' },
        type: 'rating',
        required: false,
        options: { bg: [], en: [] }
    });
    const [questionFormLanguage, setQuestionFormLanguage] = useState<'bg' | 'en'>('bg');
    const [newOptionText, setNewOptionText] = useState('');
    const [expandedResponses, setExpandedResponses] = useState<Set<string>>(new Set());
    const [deletingResponseId, setDeletingResponseId] = useState<string | null>(null);

    const fetchSurveyQuestions = useCallback(async () => {
        if (!apartment?.id) return;
        try {
            const q = query(collection(db, `apartments/${apartment.id}/surveyQuestions`), orderBy('order'));
            const querySnapshot = await getDocs(q);
            const questions = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SurveyQuestion));
            setSurveyQuestions(questions);
        } catch (error) {
            console.error("Error fetching survey questions: ", error);
            setSurveyQuestions([]);
        }
    }, [apartment?.id]);

    useEffect(() => {
        if (apartment?.id) {
            fetchFeedback();
            fetchSurveyQuestions();
        }
    }, [apartment?.id, fetchSurveyQuestions]);

    const fetchFeedback = async () => {
        try {
            setLoading(true);
            const bookingsRef = collection(db, `apartments/${apartment.id}/bookings`);
            const bookingsSnapshot = await getDocs(bookingsRef);
            
            const responses: SurveyResponse[] = [];
            const bookings: Booking[] = [];
            
            // For each booking, load booking data and check for survey responses
            for (const bookingDoc of bookingsSnapshot.docs) {
                const bookingData = bookingDoc.data();
                
                // Add to bookings list (all bookings, not just completed surveys)
                const booking: Booking = {
                    id: bookingDoc.id,
                    apartmentId: apartment.id,
                    start: bookingData.start?.toDate() || new Date(),
                    end: bookingData.end?.toDate() || new Date(),
                    title: bookingData.title || '',
                    visitorName: bookingData.visitorName,
                    type: bookingData.type || 'booked',
                    surveyCompleted: bookingData.surveyCompleted || false,
                    guestEmail: bookingData.guestEmail,
                    guestPhone: bookingData.guestPhone,
                    surveyUrl: bookingData.surveyUrl
                };
                bookings.push(booking);
                
                if (bookingData.surveyCompleted) {
                    // Load survey responses from the subcollection
                    const responsesRef = collection(db, `apartments/${apartment.id}/bookings/${bookingDoc.id}/surveyResponses`);
                    const responsesQuery = query(responsesRef, orderBy('surveySubmittedAt', 'desc'));
                    const responsesSnapshot = await getDocs(responsesQuery);
                    
                    responsesSnapshot.forEach((responseDoc) => {
                        const responseData = responseDoc.data();
                        responses.push({
                            id: responseDoc.id,
                            bookingId: bookingDoc.id,
                            guestName: responseData.guestName || bookingData.visitorName || 'Anonymous Guest',
                            guestEmail: responseData.guestEmail || bookingData.guestEmail,
                            surveyData: responseData.surveyData,
                            surveySubmittedAt: responseData.surveySubmittedAt?.toDate() || new Date(),
                            bookingStart: responseData.bookingStart?.toDate() || bookingData.start?.toDate() || new Date(),
                            bookingEnd: responseData.bookingEnd?.toDate() || bookingData.end?.toDate() || new Date(),
                            apartmentId: apartment.id,
                            responseLanguage: responseData.responseLanguage
                        });
                    });
                }
            }

            // Sort bookings by start date (most recent first)
            bookings.sort((a, b) => b.start.getTime() - a.start.getTime());
            
            setAllBookings(bookings);
            setFeedbackList(responses);
        } catch (error) {
            console.error('Error fetching feedback:', error);
        } finally {
            setLoading(false);
        }
    };

    const sortedFeedback = [...feedbackList].sort((a, b) => {
        let aValue, bValue;
        
        switch (sortBy) {
            case 'date':
                aValue = a.surveySubmittedAt.getTime();
                bValue = b.surveySubmittedAt.getTime();
                break;
            case 'rating':
                aValue = a.surveyData.rating;
                bValue = b.surveyData.rating;
                break;
            case 'guest':
                aValue = a.guestName?.toLowerCase() || '';
                bValue = b.guestName?.toLowerCase() || '';
                break;
            default:
                aValue = 0;
                bValue = 0;
        }

        if (sortDirection === 'asc') {
            return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        } else {
            return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        }
    });

    const handleSort = (column: typeof sortBy) => {
        if (column === sortBy) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(column);
            setSortDirection('desc');
        }
    };

    const getSortIcon = (column: typeof sortBy) => {
        if (column !== sortBy) return '↕️';
        return sortDirection === 'asc' ? '↑' : '↓';
    };

    const renderStars = (rating: number, size: 'sm' | 'lg' = 'sm') => {
        const stars = [];
        const starSize = size === 'lg' ? 'text-2xl' : 'text-base';
        
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <span 
                    key={i} 
                    className={`${starSize} ${i <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                >
                    ★
                </span>
            );
        }
        return <div className="flex">{stars}</div>;
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getAverageRating = () => {
        if (feedbackList.length === 0) return 0;
        const total = feedbackList.reduce((sum, feedback) => sum + feedback.surveyData.rating, 0);
        return (total / feedbackList.length).toFixed(1);
    };

    const getRecommendationPercentage = () => {
        if (feedbackList.length === 0) return 0;
        const recommendations = feedbackList.filter(feedback => feedback.surveyData.wouldRecommend).length;
        return Math.round((recommendations / feedbackList.length) * 100);
    };

    // Survey questions management functions
    const handleAddQuestion = async () => {
        if (!apartment?.id) return;

        const isValidQuestion = newQuestion.question?.bg || newQuestion.question?.en;
        
        if (!isValidQuestion) return;

        const questionData = {
            question: newQuestion.question || { bg: '', en: '' },
            type: newQuestion.type || 'rating',
            required: newQuestion.required || false,
            order: surveyQuestions.length,
            ...(newQuestion.type === 'choice' && newQuestion.options ? { options: newQuestion.options } : {})
        };

        try {
            await addDoc(collection(db, `apartments/${apartment.id}/surveyQuestions`), questionData);
            fetchSurveyQuestions(); // Refetch
            setNewQuestion({ question: { bg: '', en: '' }, type: 'rating', required: false, options: { bg: [], en: [] } });
            setShowAddQuestion(false);
        } catch (error) {
            console.error('Error adding question:', error);
            alert(t('errorAddingQuestion'));
        }
    };

    const handleEditQuestion = async (question: SurveyQuestion) => {
        if (!apartment?.id || !question.id) return;
        
        const questionRef = doc(db, `apartments/${apartment.id}/surveyQuestions`, question.id);
        const { id, ...questionData } = question;

        try {
            await updateDoc(questionRef, questionData);
            fetchSurveyQuestions(); // Refetch
            setEditingQuestion(null);
        } catch (error) {
            console.error('Error updating question:', error);
            alert(t('errorUpdatingQuestion'));
        }
    };

    const toggleResponseExpansion = (responseId: string) => {
        setExpandedResponses(prev => {
            const newSet = new Set(prev);
            if (newSet.has(responseId)) {
                newSet.delete(responseId);
            } else {
                newSet.add(responseId);
            }
            return newSet;
        });
    };

    const handleDeleteResponse = (response: SurveyResponse) => {
        showConfirmation(
            t('deleteResponse'),
            t('confirmDeleteResponse'),
            async () => {
                try {
                    setDeletingResponseId(response.id);
                    
                    // Delete the response document from Firebase
                    await deleteDoc(doc(db, `apartments/${apartment.id}/bookings/${response.bookingId}/surveyResponses`, response.id));
                    
                    // Update local state to remove the deleted response
                    setFeedbackList(prev => prev.filter(item => item.id !== response.id));
                    
                    // Collapse the response if it was expanded
                    setExpandedResponses(prev => {
                        const newSet = new Set(prev);
                        newSet.delete(response.id);
                        return newSet;
                    });
                } catch (error) {
                    console.error('Error deleting survey response:', error);
                    alert(t('errorDeletingResponse'));
                } finally {
                    setDeletingResponseId(null);
                }
            }
        );
    };

    const handleDeleteQuestion = async (questionId: string) => {
        if (!apartment?.id) return;
        try {
            // Step 1: Delete the document
            await deleteDoc(doc(db, `apartments/${apartment.id}/surveyQuestions`, questionId));
    
            // Step 2: Refetch the remaining documents to ensure we have the correct state
            const remainingDocsQuery = query(collection(db, `apartments/${apartment.id}/surveyQuestions`), orderBy('order'));
            const snapshot = await getDocs(remainingDocsQuery);
            const remainingQuestions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
            // Step 3: Create a batch to re-order
            const batch = writeBatch(db);
            remainingQuestions.forEach((q, index) => {
                const docRef = doc(db, `apartments/${apartment.id}/surveyQuestions`, q.id);
                batch.update(docRef, { order: index });
            });
            
            // Step 4: Commit the batch
            await batch.commit();
    
            // Step 5: Fetch the final state for the UI
            await fetchSurveyQuestions();
        } catch (error) {
            console.error('Error deleting question:', error);
            alert(t('errorDeletingQuestion'));
        }
    };

    const handleDragEnd = async (result: any) => {
        if (!result.destination || !apartment?.id) {
            return;
        }

        const sourceIndex = result.source.index;
        const destinationIndex = result.destination.index;

        if (sourceIndex === destinationIndex) {
            return;
        }

        const sortedQuestions = [...surveyQuestions].sort((a, b) => a.order - b.order);
        const [reorderedItem] = sortedQuestions.splice(sourceIndex, 1);
        sortedQuestions.splice(destinationIndex, 0, reorderedItem);

        // Update order values
        const updatedQuestions = sortedQuestions.map((question, index) => ({
            ...question,
            order: index + 1
        }));

        // Update local state immediately for smooth UX
        setSurveyQuestions(prev => prev.map(q => {
            const updated = updatedQuestions.find(uq => uq.id === q.id);
            return updated ? { ...q, order: updated.order } : q;
        }));

        try {
            // Batch update all questions with new order
            const batch = writeBatch(db);
            updatedQuestions.forEach((question) => {
                const questionRef = doc(db, `apartments/${apartment.id}/surveyQuestions`, question.id);
                batch.update(questionRef, { order: question.order });
            });
            await batch.commit();
        } catch (error) {
            console.error('Error updating question order:', error);
            // Revert on error
            await fetchSurveyQuestions();
        }
    };

    const addOptionToEditingQuestion = () => {
        if (!newOptionText.trim() || !editingQuestion) return;
        
        setEditingQuestion(prev => prev ? ({
            ...prev,
            options: {
                bg: prev.options?.bg || [],
                en: prev.options?.en || [],
                [questionFormLanguage]: [
                    ...(prev.options?.[questionFormLanguage] || []),
                    newOptionText.trim()
                ]
            }
        }) : null);
        setNewOptionText('');
    };

    const removeOptionFromEditingQuestion = (index: number) => {
        setEditingQuestion(prev => prev ? ({
            ...prev,
            options: {
                bg: prev.options?.bg || [],
                en: prev.options?.en || [],
                [questionFormLanguage]: (prev.options?.[questionFormLanguage] || []).filter((_, i) => i !== index)
            }
        }) : null);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <LoadingSpinner />
            </div>
        );
    }

            return (
            <div className="space-y-6 pb-16">
                {/* Header */}
                <div className="flex justify-between items-center border-b pb-4">
                    <h3 className="text-xl font-semibold text-gray-900">{t('guestFeedback')}</h3>
                    <button
                        onClick={fetchFeedback}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        {t('refresh')}
                    </button>
                </div>

                {/* Survey Language Mode Settings */}
                <div className="bg-white border rounded-lg p-6">
                    <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                            <Label htmlFor="surveyLanguageMode" className="flex items-center gap-2">
                                {t('surveyLanguageMode')}
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                    🌐 {t('survey')}
                                </span>
                            </Label>
                            <select
                                id="surveyLanguageMode"
                                value={currentApartmentData.surveyLanguageMode || 'multilingual'}
                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                                    setCurrentApartmentData({
                                        ...currentApartmentData,
                                        surveyLanguageMode: e.target.value as 'multilingual' | 'bulgarian' | 'english'
                                    })
                                }
                                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            >
                                <option value="bulgarian">{t('surveyLanguageBulgarian')}</option>
                                <option value="multilingual">{t('surveyLanguageMultilingual')}</option>
                                <option value="english">{t('surveyLanguageEnglish')}</option>
                            </select>
                            <p className="text-xs text-gray-500 mt-1">
                                {t('surveyLanguageModeDescription')}
                            </p>
                        </div>
                        <div className="flex-shrink-0">
                            <Button
                                onClick={() => {
                                    setPreviewLanguage('bg'); // Reset to Bulgarian when opening preview
                                    setShowPreview(true);
                                }}
                                className="bg-purple-600 hover:bg-purple-700 text-white"
                            >
                                👁️ {t('previewSurvey')}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Survey Questions Management */}
                <div className="bg-white border rounded-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="text-lg font-semibold text-gray-900">{t('surveyQuestions')}</h4>
                        <Button
                            onClick={() => setShowAddQuestion(true)}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            {t('addQuestion')}
                        </Button>
                    </div>

                    <div className="text-sm text-gray-600 mb-4">
                        {t('surveyQuestionsDescription')}
                        <br />
                        <strong>{t('note')}:</strong> {t('allQuestionsEditable')}
                    </div>

                    {/* Questions List */}
                    {surveyQuestions.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <span className="text-2xl mb-2 block">❓</span>
                            {t('noCustomQuestionsYet')}
                        </div>
                    ) : (
                        <DragAndDropQuestions
                            surveyQuestions={surveyQuestions}
                            onEdit={(question) => setEditingQuestion(question)}
                            onDelete={(questionId) => {
                                showConfirmation(
                                    t('confirmDelete'),
                                    t('confirmDeleteQuestion'),
                                    () => handleDeleteQuestion(questionId)
                                );
                            }}
                            onDragEnd={handleDragEnd}
                        />
                    )}

                    {/* Edit Question Modal */}
                    <SurveyQuestionModal
                        isOpen={!!editingQuestion}
                        onClose={() => setEditingQuestion(null)}
                        onSave={handleEditQuestion}
                        onDelete={handleDeleteQuestion}
                        question={editingQuestion}
                        surveyLanguageMode={currentApartmentData.surveyLanguageMode}
                        showConfirmation={showConfirmation}
                    />

                    {/* Add Question Form */}
                    {showAddQuestion && (
                        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <h5 className="font-medium text-gray-900 mb-4">{t('addNewQuestion')}</h5>
                            <div className="space-y-4">
                                <div>
                                    {/* Language Mode Info */}
                                    {currentApartmentData.surveyLanguageMode && currentApartmentData.surveyLanguageMode !== 'multilingual' && (
                                        <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                                            <strong>Language Mode:</strong> {currentApartmentData.surveyLanguageMode === 'bulgarian' ? 'Bulgarian Only' : 'English Only'}
                                        </div>
                                    )}
                                    
                                    <div className="flex justify-between items-center mb-2">
                                        <Label htmlFor="questionText">{t('questionText')}</Label>
                                        {(!currentApartmentData.surveyLanguageMode || currentApartmentData.surveyLanguageMode === 'multilingual') && (
                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setQuestionFormLanguage('bg')}
                                                    className={`px-3 py-1 text-xs rounded ${questionFormLanguage === 'bg' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                                                >
                                                    БГ
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setQuestionFormLanguage('en')}
                                                    className={`px-3 py-1 text-xs rounded ${questionFormLanguage === 'en' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                                                >
                                                    EN
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Single Language Mode */}
                                    {currentApartmentData.surveyLanguageMode === 'bulgarian' && (
                                        <Input
                                            id="questionText"
                                            value={newQuestion.question?.bg || ''}
                                            onChange={(e) => setNewQuestion(prev => ({ 
                                                ...prev, 
                                                question: { 
                                                    bg: e.target.value,
                                                    en: e.target.value // Mirror to English for consistency
                                                } 
                                            }))}
                                            placeholder={t('enterQuestionText') + ' (Bulgarian)'}
                                            className="w-full"
                                        />
                                    )}
                                    
                                    {currentApartmentData.surveyLanguageMode === 'english' && (
                                        <Input
                                            id="questionText"
                                            value={newQuestion.question?.en || ''}
                                            onChange={(e) => setNewQuestion(prev => ({ 
                                                ...prev, 
                                                question: { 
                                                    bg: e.target.value, // Mirror to Bulgarian for consistency
                                                    en: e.target.value
                                                } 
                                            }))}
                                            placeholder={t('enterQuestionText') + ' (English)'}
                                            className="w-full"
                                        />
                                    )}
                                    
                                    {/* Multilingual Mode */}
                                    {(!currentApartmentData.surveyLanguageMode || currentApartmentData.surveyLanguageMode === 'multilingual') && (
                                        <>
                                            <Input
                                                id="questionText"
                                                value={newQuestion.question?.[questionFormLanguage] || ''}
                                                onChange={(e) => setNewQuestion(prev => ({ 
                                                    ...prev, 
                                                    question: { 
                                                        bg: prev.question?.bg || '',
                                                        en: prev.question?.en || '',
                                                        [questionFormLanguage]: e.target.value 
                                                    } 
                                                }))}
                                                placeholder={t('enterQuestionText')}
                                                className="w-full"
                                            />
                                            <div className="text-xs text-gray-500 mt-1">
                                                {questionFormLanguage === 'bg' ? t('bulgarianVersion') : t('englishVersion')}
                                            </div>
                                        </>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="questionType">{t('questionType')}</Label>
                                    <select
                                        id="questionType"
                                        value={newQuestion.type}
                                        onChange={(e) => setNewQuestion(prev => ({ ...prev, type: e.target.value as 'rating' | 'text' | 'yesno' | 'choice' }))}
                                        className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="rating">{t('ratingQuestion')} (1-5 ⭐)</option>
                                        <option value="text">{t('textQuestion')} (Open text)</option>
                                        <option value="yesno">{t('yesNoQuestion')} (Yes/No)</option>
                                        <option value="choice">{t('choiceQuestion')} (Multiple choice)</option>
                                    </select>
                                </div>
                                
                                {/* Choice Options for Add Form */}
                                {newQuestion.type === 'choice' && (
                                    <div>
                                        {/* Show language-specific label based on mode */}
                                        {currentApartmentData.surveyLanguageMode === 'bulgarian' && (
                                            <Label>Choice Options (Bulgarian)</Label>
                                        )}
                                        {currentApartmentData.surveyLanguageMode === 'english' && (
                                            <Label>Choice Options (English)</Label>
                                        )}
                                        {(!currentApartmentData.surveyLanguageMode || currentApartmentData.surveyLanguageMode === 'multilingual') && (
                                            <Label>Choice Options ({questionFormLanguage === 'bg' ? 'Bulgarian' : 'English'})</Label>
                                        )}
                                        
                                        <div className="space-y-2 mt-2">
                                            {/* Get current language for options based on mode */}
                                            {(() => {
                                                const currentLang = currentApartmentData.surveyLanguageMode === 'bulgarian' ? 'bg' : 
                                                                  currentApartmentData.surveyLanguageMode === 'english' ? 'en' : 
                                                                  questionFormLanguage;
                                                return (newQuestion.options?.[currentLang] || []).map((option, index) => (
                                                    <div key={index} className="flex items-center gap-2">
                                                        <span className="flex-1 px-3 py-2 bg-gray-50 rounded">{option}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const targetLang = currentApartmentData.surveyLanguageMode === 'bulgarian' ? 'bg' : 
                                                                                  currentApartmentData.surveyLanguageMode === 'english' ? 'en' : 
                                                                                  questionFormLanguage;
                                                                setNewQuestion(prev => ({
                                                                    ...prev,
                                                                    options: {
                                                                        bg: prev.options?.bg || [],
                                                                        en: prev.options?.en || [],
                                                                        [targetLang]: (prev.options?.[targetLang] || []).filter((_, i) => i !== index)
                                                                    }
                                                                }));
                                                            }}
                                                            className="text-red-600 hover:text-red-800 px-2 py-1"
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                ));
                                            })()}
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={newOptionText}
                                                    onChange={(e) => setNewOptionText(e.target.value)}
                                                    placeholder="Add new option..."
                                                    className="flex-1 border border-gray-300 rounded-md p-2"
                                                    onKeyPress={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            // Add to appropriate language based on mode
                                                            const targetLang = currentApartmentData.surveyLanguageMode === 'bulgarian' ? 'bg' : 
                                                                              currentApartmentData.surveyLanguageMode === 'english' ? 'en' : 
                                                                              questionFormLanguage;
                                                            if (newOptionText.trim()) {
                                                                setNewQuestion(prev => ({
                                                                    ...prev,
                                                                    options: {
                                                                        bg: prev.options?.bg || [],
                                                                        en: prev.options?.en || [],
                                                                        [targetLang]: [...(prev.options?.[targetLang] || []), newOptionText.trim()]
                                                                    }
                                                                }));
                                                                setNewOptionText('');
                                                            }
                                                        }
                                                    }}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const targetLang = currentApartmentData.surveyLanguageMode === 'bulgarian' ? 'bg' : 
                                                                          currentApartmentData.surveyLanguageMode === 'english' ? 'en' : 
                                                                          questionFormLanguage;
                                                        if (newOptionText.trim()) {
                                                            setNewQuestion(prev => ({
                                                                ...prev,
                                                                options: {
                                                                    bg: prev.options?.bg || [],
                                                                    en: prev.options?.en || [],
                                                                    [targetLang]: [...(prev.options?.[targetLang] || []), newOptionText.trim()]
                                                                }
                                                            }));
                                                            setNewOptionText('');
                                                        }
                                                    }}
                                                    className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                                >
                                                    Add
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                
                                <div className="flex items-center gap-2">
                                    <input
                                        id="questionRequired"
                                        type="checkbox"
                                        checked={newQuestion.required || false}
                                        onChange={(e) => setNewQuestion(prev => ({ ...prev, required: e.target.checked }))}
                                        className="rounded"
                                    />
                                    <Label htmlFor="questionRequired">{t('requiredQuestion')}</Label>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        onClick={handleAddQuestion}
                                        disabled={!(newQuestion.question?.bg || newQuestion.question?.en)}
                                        className="bg-green-600 hover:bg-green-700"
                                    >
                                        {t('addQuestion')}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setShowAddQuestion(false);
                                            setNewQuestion({ question: { bg: '', en: '' }, type: 'rating', required: false, options: { bg: [], en: [] } });
                                        }}
                                    >
                                        {t('cancel')}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

            

            {/* Feedback List */}
            {feedbackList.length === 0 ? (
                <div className="text-center py-12">
                    <div className="text-gray-500 text-lg mb-4">📋</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">{t('noFeedbackYet')}</h3>
                    <p className="text-gray-500">
                        {t('noFeedbackDescription')}
                    </p>
                </div>
            ) : (
                <div className="bg-white border rounded-lg overflow-hidden">
                    {/* Table Header */}
                    <div className="bg-gray-50 px-6 py-3 border-b">
                        <div className="flex items-center justify-between">
                            <h4 className="font-medium text-gray-900">{t('allFeedback')}</h4>
                            
                        </div>
                    </div>

                    {/* Feedback Items */}
                    <div className="divide-y divide-gray-200">
                        {sortedFeedback.map((feedback) => {
                            const isExpanded = expandedResponses.has(feedback.id);
                            
                            return (
                                <div key={feedback.id} className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3">
                                                <h5 className="font-medium text-gray-900">
                                                    {feedback.guestName || t('anonymousGuest')}
                                                </h5>
                                                <button
                                                    onClick={() => toggleResponseExpansion(feedback.id)}
                                                    className="flex items-center gap-1 px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                                                >
                                                    <span>{isExpanded ? t('collapse') : t('expand')}</span>
                                                    <span className="transform transition-transform duration-200" style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                                                        ▼
                                                    </span>
                                                </button>
                                            </div>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {t('stayed')}: {formatDate(feedback.bookingStart)} - {formatDate(feedback.bookingEnd)}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                {t('submittedOn')}: {formatDate(feedback.surveySubmittedAt)}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-sm text-gray-600">
                                                {feedback.responseLanguage && (
                                                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs mr-2">
                                                        {feedback.responseLanguage === 'bg' ? 'Български' : 'English'}
                                                    </span>
                                                )}
                                                {Object.keys(feedback.surveyData.answers).length} {t('questionsAnswered')}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Survey Answers - Collapsible */}
                                    {isExpanded && (
                                        <div className="space-y-3 mt-4 animate-in slide-in-from-top-2 duration-200">
                                            {/* Delete Button */}
                                            <div className="flex justify-end mb-3">
                                                <button
                                                    onClick={() => handleDeleteResponse(feedback)}
                                                    disabled={deletingResponseId === feedback.id}
                                                    className="flex items-center gap-2 px-3 py-1 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {deletingResponseId === feedback.id ? (
                                                        <>
                                                            <span className="animate-spin">⏳</span>
                                                            {t('deleting')}
                                                        </>
                                                    ) : (
                                                        <>
                                                            🗑️ {t('deleteResponse')}
                                                        </>
                                                    )}
                                                </button>
                                            </div>

                                            {Object.entries(feedback.surveyData.answers).map(([questionId, answer]) => {
                                                const question = surveyQuestions.find(q => q.id === questionId);
                                                                                        const questionText = question?.question ? 
                                            (adminLanguage === 'bg' ? question.question.bg : question.question.en) : 
                                            questionId;
                                                
                                                return (
                                                    <div key={questionId} className="bg-gray-50 rounded-lg p-3">
                                                        <div className="text-sm font-medium text-gray-700 mb-1">
                                                            {questionText}
                                                        </div>
                                                        <div className="text-sm text-gray-900">
                                                            {typeof answer === 'boolean' 
                                                                ? (answer ? t('yes') : t('no'))
                                                                : typeof answer === 'number' && answer <= 5
                                                                ? `${answer}/5 ⭐`
                                                                : String(answer)
                                                            }
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
                            )}

                {/* Survey Preview Modal */}
                {showPreview && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                {/* Modal Header */}
                                <div className="flex justify-between items-center border-b pb-4 mb-6">
                                    <h2 className="text-xl font-semibold text-gray-900">{t('previewSurvey')}</h2>
                                    <button
                                        onClick={() => setShowPreview(false)}
                                        className="text-gray-500 hover:text-gray-700 text-xl"
                                    >
                                        ×
                                    </button>
                                </div>

                                {/* Language Switcher - Only show in multilingual mode */}
                                {(!currentApartmentData.surveyLanguageMode || currentApartmentData.surveyLanguageMode === 'multilingual') && (
                                    <div className="flex justify-end mb-4">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setPreviewLanguage('bg')}
                                                className={`px-3 py-1 text-sm rounded ${previewLanguage === 'bg' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                                            >
                                                Български
                                            </button>
                                            <button
                                                onClick={() => setPreviewLanguage('en')}
                                                className={`px-3 py-1 text-sm rounded ${previewLanguage === 'en' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                                            >
                                                English
                                            </button>
                                        </div>
                                    </div>
                                )}
                                
                                {/* Language Mode Indicator for Single Language */}
                                {currentApartmentData.surveyLanguageMode && currentApartmentData.surveyLanguageMode !== 'multilingual' && (
                                    <div className="flex justify-end mb-4">
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                            {currentApartmentData.surveyLanguageMode === 'bulgarian' ? '🇧🇬 Български' : '🇬🇧 English'}
                                        </span>
                                    </div>
                                )}

                                {/* Survey Content Preview */}
                                <div className="space-y-6">
                                    <div>
                                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                            {(() => {
                                                const currentLang = currentApartmentData.surveyLanguageMode === 'bulgarian' ? 'bg' :
                                                                   currentApartmentData.surveyLanguageMode === 'english' ? 'en' :
                                                                   previewLanguage;
                                                return currentLang === 'bg' ? 'Анкета за обратна връзка' : 'Guest Feedback Survey';
                                            })()}
                                        </h1>
                                        <p className="text-gray-600 mb-6">
                                            {(() => {
                                                const currentLang = currentApartmentData.surveyLanguageMode === 'bulgarian' ? 'bg' :
                                                                   currentApartmentData.surveyLanguageMode === 'english' ? 'en' :
                                                                   previewLanguage;
                                                return currentLang === 'bg' ? 
                                                    'Бихме искали да чуем за вашето изживяване! Вашата обратна връзка ни помага да подобрим услугата си.' :
                                                    'We\'d love to hear about your experience! Your feedback helps us improve our service.';
                                            })()}
                                        </p>
                                    </div>

                                    {/* All Survey Questions Preview */}
                                    {surveyQuestions.length > 0 && (
                                        <div className="space-y-4">
                                            {surveyQuestions.map((question) => {
                                                const currentLang = currentApartmentData.surveyLanguageMode === 'bulgarian' ? 'bg' :
                                                                   currentApartmentData.surveyLanguageMode === 'english' ? 'en' :
                                                                   previewLanguage;
                                                const questionText = currentLang === 'bg' ? question.question.bg : question.question.en;
                                                
                                                return (
                                                    <div key={question.id} className="space-y-2">
                                                        <label className="block text-sm font-medium text-gray-700">
                                                            {questionText}
                                                            {question.required && <span className="text-red-500 ml-1">*</span>}
                                                        </label>
                                                        {question.type === 'rating' && (
                                                            <div className="flex space-x-1">
                                                                {[1, 2, 3, 4, 5].map((star) => (
                                                                    <span key={star} className="text-yellow-400 text-xl">★</span>
                                                                ))}
                                                            </div>
                                                        )}
                                                        {question.type === 'text' && (
                                                            <textarea 
                                                                className="w-full border border-gray-300 rounded-md p-3 bg-gray-50" 
                                                                rows={3} 
                                                                disabled 
                                                                placeholder="Text response area..."
                                                            />
                                                        )}
                                                        {question.type === 'yesno' && (
                                                            <div className="flex space-x-4">
                                                                <label className="flex items-center">
                                                                    <input type="radio" name={`preview-${question.id}`} className="mr-2" disabled />
                                                                    {currentLang === 'bg' ? 'Да' : 'Yes'}
                                                                </label>
                                                                <label className="flex items-center">
                                                                    <input type="radio" name={`preview-${question.id}`} className="mr-2" disabled />
                                                                    {currentLang === 'bg' ? 'Не' : 'No'}
                                                                </label>
                                                            </div>
                                                        )}
                                                        {question.type === 'choice' && question.options && (
                                                            <div className="space-y-2">
                                                                {(currentLang === 'bg' ? question.options.bg : question.options.en || []).map((option, optionIndex) => (
                                                                    <label key={optionIndex} className="flex items-center">
                                                                        <input type="radio" name={`preview-${question.id}`} className="mr-2" disabled />
                                                                        {option}
                                                                    </label>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                {/* Modal Footer */}
                                <div className="border-t pt-4 mt-6">
                                    <div className="flex justify-end">
                                        <Button
                                            onClick={() => setShowPreview(false)}
                                            className="bg-gray-600 hover:bg-gray-700"
                                        >
                                            {t('close')}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
        </div>
    );
};

export default ApartmentFeedbackTab; 