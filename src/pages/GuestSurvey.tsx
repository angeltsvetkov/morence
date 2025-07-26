import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { doc, getDoc, updateDoc, collection, query, orderBy, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Button } from '../components/ui/button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { SurveyQuestion } from '../types';

interface SurveyData {
    answers: { [questionId: string]: string | number | boolean };
}

// Custom Question Component - moved outside to prevent re-renders
const CustomQuestionComponent: React.FC<{ 
    question: SurveyQuestion; 
    value: string | number | boolean | undefined; 
    onChange: (value: string | number | boolean) => void; 
    language: 'bg' | 'en' 
}> = ({ question, value, onChange, language }) => {
    const questionText = question.question[language] || question.question.bg || question.question.en;
    
    if (question.type === 'rating') {
        return (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <label className="block text-base sm:text-sm font-semibold text-gray-800 leading-relaxed">
                    {questionText}
                    {question.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                <div className="flex justify-center space-x-2 sm:space-x-1 sm:justify-start">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => onChange(star)}
                            className={`w-12 h-12 sm:w-8 sm:h-8 ${star <= (value as number) ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-400 transition-colors text-2xl sm:text-xl active:scale-110`}
                        >
                            ★
                        </button>
                    ))}
                </div>
                <div className="text-center sm:text-left text-sm text-gray-500">
                    {language === 'bg' ? `Избрана оценка: ${value}/5` : `Selected rating: ${value}/5`}
                </div>
            </div>
        );
    } else if (question.type === 'yesno') {
        // Convert value to boolean for proper comparison
        const boolValue = value === true || value === 'true' || value === 'yes' || value === 'да';
        
        return (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <label className="block text-base sm:text-sm font-semibold text-gray-800 leading-relaxed">
                    {questionText}
                    {question.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-6">
                    <label className="flex items-center p-3 border-2 rounded-lg cursor-pointer transition-colors hover:bg-green-50" 
                           style={{ borderColor: boolValue ? '#10b981' : '#d1d5db' }}>
                        <input
                            type="radio"
                            checked={boolValue}
                            onChange={() => onChange(true)}
                            className="w-5 h-5 mr-3 text-green-600"
                            name={`question-${question.id}`}
                        />
                        <span className="text-base font-medium">
                            {language === 'bg' ? 'Да' : 'Yes'}
                        </span>
                    </label>
                    <label className="flex items-center p-3 border-2 rounded-lg cursor-pointer transition-colors hover:bg-red-50"
                           style={{ borderColor: !boolValue && value !== undefined ? '#ef4444' : '#d1d5db' }}>
                        <input
                            type="radio"
                            checked={!boolValue && value !== undefined}
                            onChange={() => onChange(false)}
                            className="w-5 h-5 mr-3 text-red-600"
                            name={`question-${question.id}`}
                        />
                        <span className="text-base font-medium">
                            {language === 'bg' ? 'Не' : 'No'}
                        </span>
                    </label>
                </div>
            </div>
        );
    } else if (question.type === 'choice') {
        const options = question.options?.[language] || question.options?.bg || question.options?.en || [];
        const maxSelections = question.maxSelections || 1;
        const isMultipleSelection = maxSelections > 1;
        
        // For multiple selection, value should be an array
        const selectedValues = isMultipleSelection ? (Array.isArray(value) ? value : []) : [];
        const singleValue = !isMultipleSelection ? value : '';
        
        const handleSelectionChange = (option: string) => {
            if (isMultipleSelection) {
                if (selectedValues.includes(option)) {
                    // Remove if already selected
                    onChange(selectedValues.filter(v => v !== option));
                } else if (selectedValues.length < maxSelections) {
                    // Add if under limit
                    onChange([...selectedValues, option]);
                }
            } else {
                // Single selection
                onChange(option);
            }
        };
        
        return (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <div className="space-y-2">
                    <label className="block text-base sm:text-sm font-semibold text-gray-800 leading-relaxed">
                        {questionText}
                        {question.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    {isMultipleSelection && (
                        <div className="text-xs text-gray-600">
                            {language === 'bg' 
                                ? `Можете да изберете до ${maxSelections} опции`
                                : `You can select up to ${maxSelections} options`
                            }
                        </div>
                    )}
                </div>
                <div className="space-y-3">
                    {options.map((option, index) => {
                        const isSelected = isMultipleSelection ? selectedValues.includes(option) : singleValue === option;
                        const isDisabled = isMultipleSelection && !isSelected && selectedValues.length >= maxSelections;
                        
                        return (
                            <label key={index} 
                                   className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                                       isDisabled 
                                           ? 'opacity-50 cursor-not-allowed bg-gray-100' 
                                           : 'hover:bg-blue-50'
                                   }`}
                                   style={{ borderColor: isSelected ? '#3b82f6' : '#d1d5db' }}>
                                <input
                                    type={isMultipleSelection ? "checkbox" : "radio"}
                                    checked={isSelected}
                                    onChange={() => !isDisabled && handleSelectionChange(option)}
                                    className="w-5 h-5 mr-3 text-blue-600"
                                    name={isMultipleSelection ? undefined : `question-${question.id}`}
                                    required={question.required && !isMultipleSelection}
                                    disabled={isDisabled}
                                />
                                <span className="text-base">{option}</span>
                            </label>
                        );
                    })}
                </div>
            </div>
        );
    } else { // text
        return (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <label className="block text-base sm:text-sm font-semibold text-gray-800 leading-relaxed">
                    {questionText}
                    {question.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                <textarea
                    value={value as string}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full border-2 border-gray-300 rounded-lg p-4 text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors resize-none"
                    rows={5}
                    placeholder={language === 'bg' ? 'Въведете вашия отговор...' : 'Enter your response...'}
                    required={question.required}
                    maxLength={500}
                />
                <div className="text-right text-sm text-gray-500">
                    {(value as string).length}/500 {language === 'bg' ? 'символа' : 'characters'}
                </div>
            </div>
        );
    }
};

const GuestSurvey: React.FC = () => {
    const { bookingId } = useParams<{ bookingId: string }>();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const urlLang = searchParams.get('lang');
    
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [isValidToken, setIsValidToken] = useState(false);
    const [booking, setBooking] = useState<any>(null);
    const [submitted, setSubmitted] = useState(false);
    
    const [surveyData, setSurveyData] = useState<SurveyData>({
        answers: {}
    });
    
    const [allQuestions, setAllQuestions] = useState<SurveyQuestion[]>([]);
    const [apartment, setApartment] = useState<any>(null);
    
    // Initialize language based on URL parameter, apartment's survey mode, or user preference
    const [userLanguage, setUserLanguage] = useState<'bg' | 'en'>(() => {
        // First priority: URL language parameter
        if (urlLang === 'bg' || urlLang === 'en') {
            return urlLang;
        }
        
        // Default to Bulgarian for local business
        return 'bg';
    });
    
    // Update language when booking/apartment data is loaded (only if no URL lang parameter)
    useEffect(() => {
        // Skip if URL already specified the language
        if (urlLang === 'bg' || urlLang === 'en') {
            console.log('Using language from URL parameter:', urlLang);
            return;
        }
        
        // First check if the booking has a specific language setting
        if (booking?.surveyLanguage) {
            if (booking.surveyLanguage === 'bulgarian') {
                setUserLanguage('bg');
            } else if (booking.surveyLanguage === 'english') {
                setUserLanguage('en');
            }
            // For 'multilingual', keep user's browser preference
        } else if (apartment?.surveyLanguageMode) {
            // Fall back to apartment's setting if no booking-specific setting
            if (apartment.surveyLanguageMode === 'bulgarian') {
                setUserLanguage('bg');
            } else if (apartment.surveyLanguageMode === 'english') {
                setUserLanguage('en');
            }
            // For 'multilingual', keep user's browser preference
        }
    }, [booking?.surveyLanguage, apartment?.surveyLanguageMode, urlLang]);

    useEffect(() => {
        const validateTokenAndLoadBooking = async () => {
            if (!bookingId || !token) {
                setIsValidToken(false);
                setLoading(false);
                return;
            }

            try {
                console.log('Looking for booking:', bookingId, 'with token:', token, 'lang:', urlLang);
                
                // Since bookings are stored in apartment subcollections, search there directly
                let bookingData = null;
                let foundApartmentId = null;
                
                const apartmentsSnapshot = await getDocs(collection(db, 'apartments'));
                for (const apartmentDoc of apartmentsSnapshot.docs) {
                    const bookingInApartment = await getDoc(doc(db, `apartments/${apartmentDoc.id}/bookings`, bookingId));
                    if (bookingInApartment.exists()) {
                        bookingData = bookingInApartment.data();
                        foundApartmentId = apartmentDoc.id;
                        console.log('Found booking in apartment:', foundApartmentId, 'Data:', bookingData);
                        break;
                    }
                }
                
                if (bookingData && foundApartmentId) {
                    console.log('Validating token. Expected:', bookingData.surveyToken, 'Received:', token);
                    
                    if (bookingData.surveyToken === token) {
                        console.log('Token valid! Setting up survey...');
                        setIsValidToken(true);
                        setBooking({ id: bookingId, apartmentId: foundApartmentId, ...bookingData });

                        // Fetch apartment details to get questions
                        const apartmentDoc = await getDoc(doc(db, 'apartments', foundApartmentId));
                        if (apartmentDoc.exists()) {
                            const apartmentData = apartmentDoc.data();
                            setApartment({ id: apartmentDoc.id, ...apartmentData });
                            console.log('Loaded apartment data:', apartmentData);
                            
                            // Load all questions from subcollection
                            console.log('Querying survey questions for apartment:', foundApartmentId);
                            const questionsQuery = query(collection(db, `apartments/${foundApartmentId}/surveyQuestions`), orderBy('order'));
                            const questionsSnapshot = await getDocs(questionsQuery);
                            
                            console.log('Questions snapshot size:', questionsSnapshot.size);
                            console.log('Questions snapshot empty:', questionsSnapshot.empty);
                            
                            if (!questionsSnapshot.empty) {
                                const questions = questionsSnapshot.docs.map(doc => {
                                    const data = doc.data();
                                    console.log('Question doc:', { id: doc.id, data });
                                    return { id: doc.id, ...data } as SurveyQuestion;
                                });
                                
                                console.log('Final questions array:', questions);
                                console.log('Number of questions loaded:', questions.length);
                                
                                // Sort questions by order to ensure proper display
                                questions.sort((a, b) => (a.order || 0) - (b.order || 0));
                                
                                setAllQuestions(questions);
                                
                                // Initialize all answers with default values
                                 const defaultAnswers: { [key: string]: string | number | boolean } = {};
                                 questions.forEach((q: SurveyQuestion) => {
                                     if (q.type === 'rating') {
                                         defaultAnswers[q.id] = 5;
                                     } else if (q.type === 'yesno') {
                                         // Don't set a default for yes/no, let user choose
                                         defaultAnswers[q.id] = undefined as any;
                                     } else if (q.type === 'choice') {
                                         defaultAnswers[q.id] = '';
                                     } else {
                                         defaultAnswers[q.id] = '';
                                     }
                                 });
                                setSurveyData({ answers: defaultAnswers });
                            } else {
                                console.log('❌ No survey questions found for apartment:', foundApartmentId);
                                console.log('This means the surveyQuestions subcollection is empty or doesn\'t exist');
                                
                                // Create a visual indicator for debugging
                                setAllQuestions([{
                                    id: 'debug-message',
                                    question: { 
                                        en: '⚠️ DEBUG: No custom survey questions found for this apartment. Please check the admin panel to ensure questions are created.',
                                        bg: '⚠️ ДЕБЪГ: Не са намерени персонализирани въпроси за анкетата за този апартамент. Моля, проверете административния панел, за да се уверите, че въпросите са създадени.'
                                    },
                                    type: 'text',
                                    required: false,
                                    order: 0
                                } as SurveyQuestion]);
                            }
                        } else {
                            console.log('Apartment not found:', foundApartmentId);
                        }
                    } else {
                        console.log('Token mismatch. Expected:', bookingData.surveyToken, 'Received:', token);
                        setIsValidToken(false);
                    }
                } else {
                    console.log('Booking not found:', bookingId);
                    setIsValidToken(false);
                }
            } catch (error) {
                console.error('Error validating token:', error);
                setIsValidToken(false);
            } finally {
                setLoading(false);
            }
        };

        validateTokenAndLoadBooking();
    }, [bookingId, token]);

    const handleAnswer = (questionId: string, value: string | number | boolean) => {
        setSurveyData(prev => ({
            answers: { ...prev.answers, [questionId]: value }
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            // Save survey data to a separate subcollection and update booking flag
            if (booking && booking.apartmentId) {
                console.log('Starting survey submission for booking:', booking.id);
                
                // Create the survey response in the subcollection
                const surveyResponseData: any = {
                    bookingId: booking.id,
                    apartmentId: booking.apartmentId,
                    surveyData: surveyData,
                    surveySubmittedAt: new Date(),
                    bookingStart: booking.start,
                    bookingEnd: booking.end,
                    responseLanguage: userLanguage
                };

                // Only add optional fields if they have values (Firebase doesn't accept undefined)
                if (booking.visitorName) {
                    surveyResponseData.guestName = booking.visitorName;
                }
                if (booking.guestEmail) {
                    surveyResponseData.guestEmail = booking.guestEmail;
                }

                console.log('Creating survey response in subcollection...');
                // Add to the surveyResponses subcollection
                await addDoc(collection(db, `apartments/${booking.apartmentId}/bookings/${booking.id}/surveyResponses`), surveyResponseData);
                console.log('Survey response created successfully');
                
                console.log('Updating booking to mark survey as completed...');
                // Update the booking to mark survey as completed
                await updateDoc(doc(db, `apartments/${booking.apartmentId}/bookings`, booking.id), {
                    surveyCompleted: true
                });
                console.log('Booking updated successfully');
            } else {
                console.error('Missing booking or apartmentId:', { booking });
                throw new Error('Missing booking information');
            }
            
            setSubmitted(true);
        } catch (error) {
            console.error('Error submitting survey:', error);
            alert(userLanguage === 'bg' 
                ? 'Грешка при изпращане на анкетата. Моля, опитайте отново.' 
                : 'Error submitting survey. Please try again.'
            );
        }
        
        setSubmitting(false);
    };

    const StarRating: React.FC<{ value: number; onChange: (value: number) => void; label: string }> = ({ value, onChange, label }) => (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">{label}</label>
            <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => onChange(star)}
                        className={`w-8 h-8 ${star <= value ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-400 transition-colors`}
                    >
                        ★
                    </button>
                ))}
            </div>
        </div>
    );



    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    if (!isValidToken) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <div className="max-w-md mx-auto text-center p-8 bg-white rounded-lg shadow-lg">
                    <h1 className="text-2xl sm:text-3xl font-bold text-red-600 mb-4">
                        {userLanguage === 'bg' ? 'Невалидна връзка' : 'Invalid Survey Link'}
                    </h1>
                    <p className="text-gray-600 text-lg leading-relaxed">
                        {userLanguage === 'bg' 
                            ? 'Тази връзка към анкетата е невалидна или е изтекла.'
                            : 'This survey link is invalid or has expired.'
                        }
                    </p>
                </div>
            </div>
        );
    }

    if (submitted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <div className="max-w-md mx-auto text-center p-8 bg-white rounded-lg shadow-lg">
                    <div className="text-green-600 text-8xl mb-6">✓</div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                        {userLanguage === 'bg' ? 'Благодарим Ви!' : 'Thank You!'}
                    </h1>
                    <p className="text-gray-600 text-lg leading-relaxed">
                        {userLanguage === 'bg' 
                            ? 'Вашата обратна връзка беше изпратена успешно. Благодарим Ви за времето и мнението!'
                            : 'Your feedback has been submitted successfully. We appreciate your time and input!'
                        }
                    </p>
                </div>
            </div>
        );
    }

            return (
            <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
                <div className="max-w-2xl mx-auto px-3 sm:px-4">
                    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
                        {/* Language Switcher - Show in multilingual mode or when URL lang parameter is present */}
                        {(urlLang === 'bg' || urlLang === 'en' ||
                          (!booking?.surveyLanguage && !apartment?.surveyLanguageMode) || 
                          (booking?.surveyLanguage === 'multilingual') || 
                          (!booking?.surveyLanguage && apartment?.surveyLanguageMode === 'multilingual')) && (
                            <div className="flex justify-center sm:justify-end mb-6">
                                <div className="flex flex-col items-center sm:items-end gap-2">
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setUserLanguage('bg')}
                                            className={`px-4 py-2 text-base sm:text-sm rounded-lg font-medium transition-colors ${userLanguage === 'bg' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                        >
                                            Български
                                        </button>
                                        <button
                                            onClick={() => setUserLanguage('en')}
                                            className={`px-4 py-2 text-base sm:text-sm rounded-lg font-medium transition-colors ${userLanguage === 'en' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                        >
                                            English
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {/* Language Mode Indicator for Single Language */}
                        {((booking?.surveyLanguage && booking.surveyLanguage !== 'multilingual') || 
                          (!booking?.surveyLanguage && apartment?.surveyLanguageMode && apartment.surveyLanguageMode !== 'multilingual')) && (
                            <div className="flex justify-center sm:justify-end mb-6">
                                <span className="inline-flex items-center px-4 py-2 rounded-full text-base sm:text-sm font-medium bg-blue-100 text-blue-800">
                                    {(booking?.surveyLanguage === 'bulgarian' || (!booking?.surveyLanguage && apartment?.surveyLanguageMode === 'bulgarian')) ? '🇧🇬 Български' : '🇬🇧 English'}
                                </span>
                            </div>
                        )}
                        
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 text-center sm:text-left">
                            {userLanguage === 'bg' ? 'Анкета за обратна връзка' : 'Guest Feedback Survey'}
                        </h1>
                        <p className="text-gray-600 mb-8 text-center sm:text-left text-base sm:text-base leading-relaxed">
                            {userLanguage === 'bg' 
                                ? 'Бихме искали да чуем за вашето изживяване! Вашата обратна връзка ни помага да подобрим услугата си.'
                                : 'We\'d love to hear about your experience! Your feedback helps us improve our service.'
                            }
                        </p>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* All Questions */}
                        {allQuestions.map((question) => {
                            const isMultipleChoice = question.type === 'choice' && (question.maxSelections || 1) > 1;
                            const defaultValue = question.type === 'rating' ? 5 : 
                                               question.type === 'yesno' ? undefined : 
                                               question.type === 'choice' ? (isMultipleChoice ? [] : '') : '';
                            const currentValue = surveyData.answers[question.id] !== undefined ? 
                                               surveyData.answers[question.id] : defaultValue;
                            
                            return (
                                <CustomQuestionComponent
                                    key={question.id}
                                    question={question}
                                    value={currentValue}
                                    onChange={(value) => handleAnswer(question.id, value)}
                                    language={userLanguage}
                                />
                            );
                        })}

                        <div className="pt-4">
                            <Button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-4 px-6 rounded-lg transition-colors text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 active:shadow-md"
                            >
                                {submitting 
                                    ? (userLanguage === 'bg' ? 'Изпращане...' : 'Submitting...') 
                                    : (userLanguage === 'bg' ? 'Изпрати обратна връзка' : 'Submit Feedback')
                                }
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default GuestSurvey; 