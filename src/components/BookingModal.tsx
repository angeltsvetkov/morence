import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useLanguage } from '../hooks/useLanguage';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface BookingFormInputs {
    startDate: string;
    endDate: string;
}

interface BookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    apartmentId: string;
    onBookingConfirmed: () => void;
}

const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, apartmentId, onBookingConfirmed }) => {
    const { t } = useLanguage();
    const { register, handleSubmit, formState: { errors } } = useForm<BookingFormInputs>();

    const onSubmit: SubmitHandler<BookingFormInputs> = async (data) => {
        try {
            await addDoc(collection(db, `apartments/${apartmentId}/bookings`), {
                start: new Date(data.startDate),
                end: new Date(data.endDate),
                title: 'Reserved', // Or some user identifier
                type: 'rental',
                isRentalPeriod: true,
                createdAt: serverTimestamp(),
            });
            onBookingConfirmed();
            onClose();
        } catch (error) {
            console.error("Error creating booking: ", error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6">{t('bookYourStay')}</h2>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="mb-4">
                        <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">{t('startDate')}</label>
                        <input
                            type="date"
                            id="startDate"
                            {...register('startDate', { required: true })}
                            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                        {errors.startDate && <p className="text-red-500 text-xs mt-1">{t('startDateRequired')}</p>}
                    </div>
                    <div className="mb-6">
                        <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">{t('endDate')}</label>
                        <input
                            type="date"
                            id="endDate"
                            {...register('endDate', { required: true })}
                            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                        {errors.endDate && <p className="text-red-500 text-xs mt-1">{t('endDateRequired')}</p>}
                    </div>
                    <div className="flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
                            {t('cancel')}
                        </button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                            {t('confirmBooking')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BookingModal;
