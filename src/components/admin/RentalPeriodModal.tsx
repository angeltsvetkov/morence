import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { collection, query, orderBy, getDocs, DocumentData } from 'firebase/firestore';
import { db } from '../../firebase';
import { Booking, PricingOffer, SurveyResponse, SurveyQuestion } from '../../types';
import { useAdminLanguage } from '../../hooks/useAdminLanguage';
import { useLanguage } from '../../hooks/useLanguage';

interface RentalPeriodModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: {
        visitorName: string;
        startDate: Date;
        endDate: Date;
        type: 'booked' | 'blocked';
        notes?: string;
        pricingOfferId?: string;
        customPrice?: number;
        totalPrice?: number;
        deposit?: number;
        depositCurrency?: 'EUR' | 'BGN';
        status?: 'booked' | 'deposit_paid' | 'fully_paid';
        guestEmail?: string;
        guestPhone?: string;
        surveyLanguage?: 'multilingual' | 'bulgarian' | 'english';
        surveyToken?: string;
        surveyUrl?: string;
    }) => void;
    onUpdate?: (bookingId: string, data: {
        visitorName: string;
        startDate: Date;
        endDate: Date;
        type: 'booked' | 'blocked';
        notes?: string;
        pricingOfferId?: string;
        customPrice?: number;
        totalPrice?: number;
        deposit?: number;
        depositCurrency?: 'EUR' | 'BGN';
        status?: 'booked' | 'deposit_paid' | 'fully_paid';
        guestEmail?: string;
        guestPhone?: string;
        surveyLanguage?: 'multilingual' | 'bulgarian' | 'english';
        surveyToken?: string;
        surveyUrl?: string;
    }) => void;
    onDelete?: (bookingId: string) => void;
    selectedSlot: { start: Date; end: Date } | null;
    editingBooking?: Booking | null;
    loading?: boolean;
    pricingOffers?: PricingOffer[];
    availabilityStart?: string;
    availabilityEnd?: string;
}

const RentalPeriodModal: React.FC<RentalPeriodModalProps> = ({
    isOpen,
    onClose,
    onSave,
    onUpdate,
    onDelete,
    selectedSlot,
    editingBooking,
    loading = false,
    pricingOffers = [],
    availabilityStart,
    availabilityEnd
}) => {
    const { language } = useLanguage(); // For price formatting
    const { t } = useAdminLanguage(); // For admin UI translations
    const [visitorName, setVisitorName] = useState('');
    const [type, setType] = useState<'booked' | 'blocked'>('booked');
    const [notes, setNotes] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedPricingOfferId, setSelectedPricingOfferId] = useState('');
    const [customPrice, setCustomPrice] = useState('');
    const [customPriceEUR, setCustomPriceEUR] = useState('');
    const [pricingMode, setPricingMode] = useState<'offer' | 'custom'>('offer');
    const [deposit, setDeposit] = useState('');
    const [status, setStatus] = useState<'booked' | 'deposit_paid' | 'fully_paid'>('booked');
    const [guestEmail, setGuestEmail] = useState('');
    const [guestPhone, setGuestPhone] = useState('');
    const [surveyLanguage, setSurveyLanguage] = useState<'multilingual' | 'bulgarian' | 'english'>('multilingual');
    const [surveyResponses, setSurveyResponses] = useState<SurveyResponse[]>([]);
    const [loadingSurveyResponses, setLoadingSurveyResponses] = useState(false);
    const [surveyQuestions, setSurveyQuestions] = useState<SurveyQuestion[]>([]);

    // Exchange rate (used for legacy stored values)
    const EUR_TO_BGN_RATE = 1.95583;
    
    const convertBgnToEur = (bgnPrice: number): number => {
        return Math.ceil(bgnPrice / EUR_TO_BGN_RATE);
    };

    const convertEurToBgn = (eurPrice: number): number => {
        return Math.round(eurPrice * EUR_TO_BGN_RATE * 100) / 100;
    };

    const getDepositInBGN = (): number => {
        if (!deposit) return 0;
        const depositValue = parseFloat(deposit);
        return convertEurToBgn(depositValue);
    };

    const isEditMode = !!editingBooking;

    // Load survey responses and questions for the booking
    const loadSurveyResponses = async (apartmentId: string, bookingId: string) => {
        try {
            setLoadingSurveyResponses(true);
            
            // Load survey responses
            const responsesQuery = query(
                collection(db, `apartments/${apartmentId}/bookings/${bookingId}/surveyResponses`),
                orderBy('surveySubmittedAt', 'desc')
            );
            const responsesSnapshot = await getDocs(responsesQuery);
            const responses = responsesSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as SurveyResponse));
            setSurveyResponses(responses);

            // Load survey questions for this apartment
            const questionsQuery = query(
                collection(db, `apartments/${apartmentId}/surveyQuestions`),
                orderBy('order')
            );
            const questionsSnapshot = await getDocs(questionsQuery);
            const questions = questionsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as SurveyQuestion));
            setSurveyQuestions(questions);
        } catch (error) {
            console.error('Error loading survey responses:', error);
            setSurveyResponses([]);
            setSurveyQuestions([]);
        } finally {
            setLoadingSurveyResponses(false);
        }
    };

    // Load survey responses when editing a booking with completed survey
    useEffect(() => {
        if (isEditMode && editingBooking?.surveyCompleted && editingBooking.apartmentId) {
            loadSurveyResponses(editingBooking.apartmentId, editingBooking.id);
        } else {
            setSurveyResponses([]);
            setSurveyQuestions([]);
        }
    }, [isEditMode, editingBooking?.id, editingBooking?.surveyCompleted, editingBooking?.apartmentId]);

    const formatDateForInput = (date: Date) => {
        // Use local timezone instead of UTC to avoid timezone offset issues
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const calculateDays = (start: string, end: string) => {
        if (!start || !end) return 0;
        const startDate = new Date(start);
        const endDate = new Date(end);
        const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const getCurrentPrice = () => {
        if (pricingMode === 'custom') {
            // UI is EUR-only; store legacy values in the existing numeric fields
            const eurTotal = parseFloat(customPriceEUR) || 0;
            return eurTotal > 0 ? convertEurToBgn(eurTotal) : 0;
        }
        
        const selectedOffer = pricingOffers.find(offer => offer.id === selectedPricingOfferId);
        if (selectedOffer) {
            const bookingDays = calculateDays(startDate, endDate);
            // UI is EUR-only; store legacy values in the existing numeric fields
            const perNightEUR = (selectedOffer as any).priceEUR || selectedOffer.price || ((selectedOffer as any).priceBGN ? convertBgnToEur((selectedOffer as any).priceBGN) : 0);
            return convertEurToBgn(perNightEUR) * bookingDays;
        }
        
        return 0;
    };

    const isDateWithinAvailability = (dateStr: string) => {
        if (!dateStr) return true; // If no date selected, don't show warning
        
        const date = new Date(dateStr);
        const availStart = availabilityStart ? new Date(availabilityStart) : null;
        const availEnd = availabilityEnd ? new Date(availabilityEnd) : null;
        
        if (availStart && date < availStart) return false;
        if (availEnd && date > availEnd) return false;
        return true;
    };

    const getAvailabilityWarning = () => {
        if (!startDate && !endDate) return null;
        
        const startValid = isDateWithinAvailability(startDate);
        const endValid = isDateWithinAvailability(endDate);
        
        if (!startValid || !endValid) {
            return (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-yellow-800">
                                Outside Availability Period
                            </h3>
                            <div className="mt-1 text-sm text-yellow-700">
                                <p>The selected dates are outside the apartment's availability period.</p>
                                {availabilityStart && availabilityEnd ? (
                                    <p>Available: {new Date(availabilityStart).toLocaleDateString()} - {new Date(availabilityEnd).toLocaleDateString()}</p>
                                ) : availabilityStart ? (
                                    <p>Available from: {new Date(availabilityStart).toLocaleDateString()}</p>
                                ) : availabilityEnd ? (
                                    <p>Available until: {new Date(availabilityEnd).toLocaleDateString()}</p>
                                ) : null}
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
        
        return null;
    };

    // Initialize form when editing or creating
    useEffect(() => {
        if (editingBooking) {
            // Editing mode - populate with existing data
            setVisitorName(editingBooking.visitorName || '');
            setType(editingBooking.type === 'maintenance' || editingBooking.type === 'rental' ? 'booked' : editingBooking.type || 'booked');
            setNotes((editingBooking as any).notes || ''); // Load existing notes
            setStartDate(formatDateForInput(editingBooking.start));
            setEndDate(formatDateForInput(editingBooking.end));
            
            // Handle deposit initialization
            if (editingBooking.deposit) {
                // Deposit is stored in legacy units; display as EUR in admin
                setDeposit(convertBgnToEur(editingBooking.deposit).toString());
            } else {
                setDeposit('');
            }
            setStatus(editingBooking.status || 'booked');
            setGuestEmail(editingBooking.guestEmail || '');
            setGuestPhone(editingBooking.guestPhone || '');
            setSurveyLanguage(editingBooking.surveyLanguage || 'multilingual');
            
            // Handle pricing data
            if (editingBooking.pricingOfferId) {
                setSelectedPricingOfferId(editingBooking.pricingOfferId);
                setPricingMode('offer');
                setCustomPrice('');
            } else if (editingBooking.customPrice) {
                // Legacy heuristic: old values might be stored in different units depending on admin language at the time.
                // Treat larger values as legacy and convert to EUR for display.
                const stored = editingBooking.customPrice;
                const eurValue = stored > 500 ? convertBgnToEur(stored) : stored;
                setCustomPriceEUR(eurValue.toString());
                setCustomPrice(editingBooking.customPrice.toString()); // Keep for backward compatibility
                setPricingMode('custom');
                setSelectedPricingOfferId('');
            } else {
                // Default to first offer if available
                if (pricingOffers.length > 0) {
                    setSelectedPricingOfferId(pricingOffers[0].id);
                    setPricingMode('offer');
                } else {
                    setPricingMode('custom');
                }
                setCustomPrice('');
            }
        } else if (selectedSlot) {
            // Create mode with selected slot - populate with selected slot
            setStartDate(formatDateForInput(selectedSlot.start));
            setEndDate(formatDateForInput(selectedSlot.end));
            resetPricingFields();
        } else {
            // Create mode without selected slot - clear dates
            setStartDate('');
            setEndDate('');
            setVisitorName('');
            setType('booked');
            setNotes('');
            resetPricingFields();
        }
    }, [editingBooking, selectedSlot, pricingOffers]);

    const resetPricingFields = () => {
        if (pricingOffers.length > 0) {
            setSelectedPricingOfferId(pricingOffers[0].id);
            setPricingMode('offer');
        } else {
            setPricingMode('custom');
            setSelectedPricingOfferId('');
        }
        setCustomPrice('');
        setCustomPriceEUR('');
        setDeposit('');
        setStatus('booked');
        setGuestEmail('');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (type === 'booked' && !visitorName.trim()) {
            alert(t('pleaseEnterVisitorName'));
            return;
        }

        // Validate pricing for booked periods
        if (type === 'booked') {
            if (pricingMode === 'custom') {
                const eurPrice = parseFloat(customPriceEUR) || 0;
                if (eurPrice <= 0) {
                    alert(t('pleaseEnterValidCustomPrice'));
                    return;
                }
            }
            if (pricingMode === 'offer' && !selectedPricingOfferId && pricingOffers.length > 0) {
                alert(t('pleaseSelectPricingOffer'));
                return;
            }
        }

        const totalPrice = type === 'booked' ? getCurrentPrice() : undefined;

        const submissionData = {
            visitorName: visitorName.trim(),
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            type,
            notes: notes.trim() || undefined,
            pricingOfferId: type === 'booked' && pricingMode === 'offer' ? selectedPricingOfferId : undefined,
            customPrice: type === 'booked' && pricingMode === 'custom' ? getCurrentPrice() : undefined,
            totalPrice: totalPrice,
            deposit: deposit ? getDepositInBGN() : undefined,
            depositCurrency: deposit ? 'EUR' as const : undefined,
            status: type === 'booked' ? status : undefined,
            guestEmail: type === 'booked' && guestEmail.trim() ? guestEmail.trim() : undefined,
            guestPhone: type === 'booked' && guestPhone.trim() ? guestPhone.trim() : undefined,
            surveyLanguage: type === 'booked' ? surveyLanguage : undefined
        };

        if (isEditMode && editingBooking && onUpdate) {
            onUpdate(editingBooking.id, submissionData);
        } else {
            onSave(submissionData);
        }

        // Reset form
        setVisitorName('');
        setType('booked');
        setNotes('');
        setStartDate('');
        setEndDate('');
        setDeposit('');
        setStatus('booked');
        setGuestEmail('');
        setGuestPhone('');
        setSurveyLanguage('multilingual');
        resetPricingFields();
    };

    const handleClose = () => {
        setVisitorName('');
        setType('booked');
        setNotes('');
        setStartDate('');
        setEndDate('');
        setDeposit('');
        setStatus('booked');
        setGuestEmail('');
        setGuestPhone('');
        setSurveyLanguage('multilingual');
        resetPricingFields();
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {isEditMode ? t('editBooking') : t('createRentalPeriod')}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditMode ? (
                            <>{t('editBookingDetails')}</>
                        ) : selectedSlot ? (
                            <>
                                From {selectedSlot.start.toLocaleDateString()} to {selectedSlot.end.toLocaleDateString()}
                            </>
                        ) : (
                            <>{t('createNewBookingPeriod')}</>
                        )}
                    </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="startDate">{t('startDate') || 'Start Date'}</Label>
                            <Input
                                id="startDate"
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                required
                                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="endDate">{t('endDate') || 'End Date'}</Label>
                            <Input
                                id="endDate"
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                required
                                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="type">{t('type')}</Label>
                            <select
                                id="type"
                                value={type}
                                onChange={(e) => setType(e.target.value as 'booked' | 'blocked')}
                                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            >
                                <option value="booked">{t('bookingTypeBooked')}</option>
                                <option value="blocked">{t('bookingTypeBlocked')}</option>
                            </select>
                        </div>
                    </div>

                    {/* Availability Warning */}
                    {getAvailabilityWarning()}

                    {type === 'booked' && (
                        <>
                            {/* Guest Information Section */}
                            <div className="border-t pt-6">
                                <h3 className="text-lg font-medium mb-4">{t('guestInformation') || 'Guest Information'}</h3>
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="visitorName">{t('visitorNameRequired')}</Label>
                                        <Input
                                            id="visitorName"
                                            type="text"
                                            value={visitorName}
                                            onChange={(e) => setVisitorName(e.target.value)}
                                            placeholder={t('enterVisitorName')}
                                            required
                                            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="guestEmail">{t('guestEmail')}</Label>
                                        <Input
                                            id="guestEmail"
                                            type="email"
                                            value={guestEmail}
                                            onChange={(e) => setGuestEmail(e.target.value)}
                                            placeholder={t('guestEmailPlaceholder')}
                                            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="guestPhone">{t('guestPhone')}</Label>
                                        <Input
                                            id="guestPhone"
                                            type="tel"
                                            value={guestPhone}
                                            onChange={(e) => setGuestPhone(e.target.value)}
                                            placeholder={t('guestPhonePlaceholder')}
                                            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        />
                                    </div>
                                </div>
                                
                                {/* Survey Language Selection */}
                                <div className="mt-4">
                                    <Label htmlFor="surveyLanguage">{t('surveyLanguageForBooking')}</Label>
                                    <select
                                        id="surveyLanguage"
                                        value={surveyLanguage}
                                        onChange={(e) => setSurveyLanguage(e.target.value as 'multilingual' | 'bulgarian' | 'english')}
                                        className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    >
                                        <option value="multilingual">{t('surveyLanguageMultilingual')}</option>
                                        <option value="bulgarian">{t('surveyLanguageBulgarian')}</option>
                                        <option value="english">{t('surveyLanguageEnglish')}</option>
                                    </select>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {t('surveyLanguageBookingDescription')}
                                    </p>
                                </div>
                            </div>

                            {/* Payment Information Section */}
                            <div className="border-t pt-6">
                                <h3 className="text-lg font-medium mb-4">{t('paymentInformation') || 'Payment Information'}</h3>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="deposit">{t('deposit')}</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                id="deposit"
                                                type="number"
                                                value={deposit}
                                                onChange={(e) => setDeposit(e.target.value)}
                                                placeholder={t('depositPlaceholder')}
                                                min="0"
                                                step="0.01"
                                                className="flex-1 border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            />
                                            <div className="w-20 border border-gray-300 rounded-md p-2 text-center text-sm text-gray-700 bg-gray-50">€</div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="status">{t('status')}</Label>
                                        <select
                                            id="status"
                                            value={status}
                                            onChange={(e) => setStatus(e.target.value as 'booked' | 'deposit_paid' | 'fully_paid')}
                                            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        >
                                            <option value="booked">{t('statusBooked')}</option>
                                            <option value="deposit_paid">{t('statusDepositPaid')}</option>
                                            <option value="fully_paid">{t('statusFullyPaid')}</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Pricing Section */}
                            <div className="border-t pt-6">
                                <h3 className="text-lg font-medium mb-4">{t('pricingSection')}</h3>
                                
                                {/* Pricing Mode Selection */}
                                <div className="flex gap-4 mb-4">
                                    {pricingOffers.length > 0 && (
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                value="offer"
                                                checked={pricingMode === 'offer'}
                                                onChange={() => setPricingMode('offer')}
                                                className="text-blue-600"
                                            />
                                            <span className="text-sm">{t('usePricingOffer')}</span>
                                        </label>
                                    )}
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            value="custom"
                                            checked={pricingMode === 'custom'}
                                            onChange={() => setPricingMode('custom')}
                                            className="text-blue-600"
                                        />
                                        <span className="text-sm">{t('customPrice')}</span>
                                    </label>
                                </div>

                                {/* Pricing Offer Selection */}
                                {pricingMode === 'offer' && pricingOffers.length > 0 && (
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="pricingOffer">{t('selectPricingOffer')}</Label>
                                            <select
                                                id="pricingOffer"
                                                value={selectedPricingOfferId}
                                                onChange={(e) => setSelectedPricingOfferId(e.target.value)}
                                                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            >
                                                <option value="">{t('selectAnOffer')}</option>
                                                {pricingOffers.map((offer) => {
                                                    const displayPriceEUR = (offer as any).priceEUR || offer.price || ((offer as any).priceBGN ? convertBgnToEur((offer as any).priceBGN) : 0);
                                                    return (
                                                        <option key={offer.id} value={offer.id}>
                                                            {offer.name} - €{Number(displayPriceEUR).toFixed(2)}/{t('perNight')}
                                                        </option>
                                                    );
                                                })}
                                            </select>
                                        </div>
                                        
                                    </div>
                                )}

                                {/* Custom Price Input */}
                                {pricingMode === 'custom' && (
                                    <div className="space-y-2">
                                        <Label htmlFor="customPriceEUR">{t('customTotalPriceEUR') || 'Custom Total Price (EUR)'}</Label>
                                        <Input
                                            id="customPriceEUR"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={customPriceEUR}
                                            onChange={(e) => {
                                                setCustomPriceEUR(e.target.value);
                                                if (e.target.value) setCustomPrice('');
                                            }}
                                            placeholder="e.g., 230"
                                            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        />

                                        {customPriceEUR && startDate && endDate && calculateDays(startDate, endDate) > 0 && (
                                            <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded">
                                                {(() => {
                                                    const days = calculateDays(startDate, endDate);
                                                    const eurTotal = parseFloat(customPriceEUR) || 0;
                                                    if (eurTotal <= 0) return null;
                                                    const eurPerNight = eurTotal / days;
                                                    return (
                                                        <>
                                                            <p><strong>{t('bookingLabel')}:</strong> {days} day{days !== 1 ? 's' : ''}</p>
                                                            <p><strong>{t('perNightLabel')}:</strong> €{eurPerNight.toFixed(2)}</p>
                                                            <p><strong>{t('totalLabel')}:</strong> €{eurTotal.toFixed(2)}</p>
                                                        </>
                                                    );
                                                })()}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {/* Notes Section */}
                    <div className="border-t pt-6">
                        <div className="space-y-2">
                            <Label htmlFor="notes">{t('notesOptional')}</Label>
                            <Input
                                id="notes"
                                type="text"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder={t('additionalNotes')}
                                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            />
                        </div>
                    </div>

                    {/* Survey Results Section */}
                    {isEditMode && type === 'booked' && editingBooking?.surveyCompleted && surveyResponses.length > 0 && (
                        <div className="border-t pt-6">
                            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                <div className="flex items-center justify-between mb-3">
                                    <Label className="text-green-800 font-medium">{t('surveyResults')}</Label>
                                    <span className="text-xs text-green-600">
                                        {t('submittedOn')}: {surveyResponses[0]?.surveySubmittedAt ? new Date(surveyResponses[0].surveySubmittedAt).toLocaleDateString() : 'Unknown'}
                                    </span>
                                </div>
                                <div className="space-y-3 max-h-60 overflow-y-auto">
                                    {surveyResponses[0]?.surveyData?.answers && Object.entries(surveyResponses[0].surveyData.answers).map(([questionId, answer]) => {
                                        const question = surveyQuestions.find(q => q.id === questionId);
                                        const questionText = question?.question ? 
                                            (language === 'bg' ? question.question.bg : question.question.en) : 
                                            questionId;
                                        
                                        return (
                                            <div key={questionId} className="bg-white rounded p-3 border border-green-100">
                                                <div className="text-sm font-medium text-gray-700 mb-1">
                                                    {questionText}
                                                </div>
                                                <div className="text-sm text-gray-900">
                                                    {typeof answer === 'boolean' 
                                                        ? (answer ? t('yes') : t('no'))
                                                        : typeof answer === 'number' && answer <= 5
                                                        ? `${answer}/5 ${t('stars')}`
                                                        : String(answer)
                                                    }
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Survey Link Section - Bottom of Modal */}
                    {isEditMode && type === 'booked' && editingBooking?.surveyUrl && (
                        <div className="border-t pt-6">
                            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                                <Label className="text-purple-800 font-medium">{t('personalizedSurveyLink')}</Label>
                                <div className="mt-2 flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={editingBooking.surveyUrl}
                                        readOnly
                                        className="flex-1 px-3 py-2 text-sm bg-white border border-purple-200 rounded-md font-mono text-purple-700"
                                        onClick={(e) => (e.target as HTMLInputElement).select()}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            navigator.clipboard.writeText(editingBooking.surveyUrl!);
                                            alert(t('linkCopied'));
                                        }}
                                        className="px-3 py-2 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 transition-colors"
                                    >
                                        {t('copyLink')}
                                    </button>
                                </div>
                                <p className="text-xs text-purple-600 mt-1">
                                    {t('shareSurveyLinkDescription')}
                                </p>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <div className="flex justify-between w-full">
                            <div>
                                {isEditMode && onDelete && editingBooking && (
                                    <Button 
                                        type="button" 
                                        variant="outline" 
                                        onClick={() => {
                                            if (onDelete) {
                                                onDelete(editingBooking.id);
                                            }
                                        }}
                                        className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
                                    >
                                        {t('delete')}
                                    </Button>
                                )}
                            </div>
                            <div className="flex space-x-2">
                                <Button type="button" variant="outline" onClick={handleClose}>
                                    {t('cancelButton')}
                                </Button>
                                <Button type="submit" disabled={loading}>
                                    {loading ? (isEditMode ? t('updating') : t('creating')) : (isEditMode ? t('updateBookingButton') : t('createPeriodButton'))}
                                </Button>
                            </div>
                        </div>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default RentalPeriodModal; 