import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { Calendar, dateFnsLocalizer, Event } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS, bg } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useLanguage } from '../hooks/useLanguage';
import { Language } from '../contexts/LanguageContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";

const locales = {
    en: enUS,
    bg: bg,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

interface Booking extends Event {
    id: string;
    apartmentId: string;
    title: string;
    type?: 'rental' | 'maintenance' | 'blocked';
}

interface Apartment {
    id: string;
    name: { [key in Language]?: string };
    availabilityStart?: string;
    availabilityEnd?: string;
}

const ApartmentCalendar: React.FC = () => {
    const { apartmentId } = useParams<{ apartmentId: string }>();
    const { language, t } = useLanguage();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [apartment, setApartment] = useState<Apartment | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null);
    const [currentDate, setCurrentDate] = useState(new Date());

    // Helper function to safely convert date fields
    const safeToDate = (dateField: any): Date => {
        if (dateField instanceof Date) {
            return dateField;
        }
        if (dateField && typeof dateField.toDate === 'function') {
            return dateField.toDate();
        }
        if (typeof dateField === 'string') {
            return new Date(dateField);
        }
        return new Date(); // fallback
    };

    const fetchApartmentAndBookings = useCallback(async () => {
        if (!apartmentId) return;
        setLoading(true);
        try {
            // Fetch apartment data
            const apartmentDoc = await getDoc(doc(db, "apartments", apartmentId));
            if (apartmentDoc.exists()) {
                const apartmentData = { id: apartmentDoc.id, ...apartmentDoc.data() } as Apartment;
                setApartment(apartmentData);
            }

            // Fetch bookings from both locations (subcollection and old main collection)
            const allBookings: Booking[] = [];
            
            // Fetch from new subcollection
            const newBookingsSnapshot = await getDocs(collection(db, `apartments/${apartmentId}/bookings`));
            const newBookingsData = newBookingsSnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    apartmentId: apartmentId!,
                    start: safeToDate(data.start),
                    end: safeToDate(data.end),
                    title: data.title || 'Reserved',
                } as Booking;
            });
            allBookings.push(...newBookingsData);
            
            // Fetch from old main collection for this apartment
            try {
                const oldBookingsQuery = query(collection(db, "bookings"), where("apartmentId", "==", apartmentId));
                const oldBookingsSnapshot = await getDocs(oldBookingsQuery);
                const oldBookingsData = oldBookingsSnapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        apartmentId: apartmentId!,
                        start: safeToDate(data.start),
                        end: safeToDate(data.end),
                        title: data.title || 'Reserved',
                    } as Booking;
                });
                allBookings.push(...oldBookingsData);
            } catch (error) {
                console.log("No old bookings found or permission denied:", error);
            }
            
            setBookings(allBookings);
        } catch (error) {
            console.error("Error fetching data: ", error);
        } finally {
            setLoading(false);
        }
    }, [apartmentId]);

    useEffect(() => {
        fetchApartmentAndBookings();
    }, [fetchApartmentAndBookings]);

    const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
        setSelectedSlot({ start, end });
        setIsAddModalOpen(true);
    };

    const handleAddBooking = async (title: string) => {
        if (!selectedSlot || !apartmentId) return;
        try {
            await addDoc(collection(db, `apartments/${apartmentId}/bookings`), {
                start: selectedSlot.start,
                end: selectedSlot.end,
                title: title,
                type: 'rental',
                isRentalPeriod: true,
                createdAt: serverTimestamp(),
            });
            setIsAddModalOpen(false);
            fetchApartmentAndBookings(); // Refresh bookings
        } catch (error) {
            console.error("Error adding booking: ", error);
        }
    };

    const handleDeleteBooking = async (bookingId: string) => {
        if (!apartmentId || !window.confirm(t('confirmDeleteBooking'))) return;
        try {
            await deleteDoc(doc(db, `apartments/${apartmentId}/bookings`, bookingId));
            fetchApartmentAndBookings(); // Refresh bookings
        } catch (error) {
            console.error("Error deleting booking: ", error);
        }
    };

    // Calendar navigation functions with availability restrictions
    const getMinCalendarDate = () => {
        if (apartment?.availabilityStart) {
            const availStart = new Date(apartment.availabilityStart);
            const today = new Date();
            return new Date(Math.max(availStart.getTime(), today.getTime()));
        }
        return new Date(); // Default to today if no start date
    };

    const getMaxCalendarDate = () => {
        if (apartment?.availabilityEnd) {
            return new Date(apartment.availabilityEnd);
        }
        return undefined; // No limit if no end date
    };

    const handleNavigate = (newDate: Date) => {
        const minDate = getMinCalendarDate();
        const maxDate = getMaxCalendarDate();
        
        // Check if navigation is within allowed range
        if (newDate >= minDate && (!maxDate || newDate <= maxDate)) {
            setCurrentDate(newDate);
        }
    };

    // Generate available months based on apartment availability
    const getAvailableMonths = () => {
        const months = [];
        const monthNames = [
            t('january'), t('february'), t('march'), t('april'),
            t('may'), t('june'), t('july'), t('august'),
            t('september'), t('october'), t('november'), t('december')
        ];

        const minDate = getMinCalendarDate();
        const maxDate = getMaxCalendarDate();
        
        if (!maxDate) {
            // If no end date, show next 24 months from start date
            const endDate = new Date(minDate);
            endDate.setFullYear(endDate.getFullYear() + 2);
            return generateMonthOptions(minDate, endDate, monthNames);
        }
        
        return generateMonthOptions(minDate, maxDate, monthNames);
    };

    const generateMonthOptions = (startDate: Date, endDate: Date, monthNames: string[]) => {
        const months = [];
        const current = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
        const end = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
        
        while (current <= end) {
            months.push({
                value: `${current.getFullYear()}-${current.getMonth()}`,
                label: `${monthNames[current.getMonth()]} ${current.getFullYear()}`,
                date: new Date(current)
            });
            current.setMonth(current.getMonth() + 1);
        }
        
        return months;
    };

    const handleMonthSelect = (value: string) => {
        const [year, month] = value.split('-').map(Number);
        const newDate = new Date(year, month, 1);
        setCurrentDate(newDate);
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">{t('apartmentCalendar')}</h1>
            
            {/* Modern Month Selector */}
            <div className="mb-8 flex justify-center">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl shadow-lg border border-blue-100 backdrop-blur-sm">
                    <label htmlFor="month-select" className="block text-sm font-semibold text-gray-700 mb-3 text-center">
                        {t('selectMonth') || 'Select Month'}
                    </label>
                    <div className="relative">
                        <select
                            id="month-select"
                            value={`${currentDate.getFullYear()}-${currentDate.getMonth()}`}
                            onChange={(e) => handleMonthSelect(e.target.value)}
                            className="appearance-none px-6 py-3 bg-white border-2 border-blue-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium min-w-[250px] cursor-pointer transition-all duration-200 hover:border-blue-300 hover:shadow-md"
                        >
                            {getAvailableMonths().map((month) => (
                                <option key={month.value} value={month.value}>
                                    {month.label}
                                </option>
                            ))}
                        </select>
                        {/* Custom dropdown arrow */}
                        <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Modern Calendar Container */}
            <div className="relative">
                {/* Calendar Header */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-t-2xl border-b border-gray-200">
                    <h3 className="text-2xl font-bold text-center text-gray-800">
                        {currentDate.toLocaleDateString(language === 'bg' ? 'bg-BG' : 'en-US', { 
                            month: 'long', 
                            year: 'numeric' 
                        })}
                    </h3>
                    <p className="text-center text-gray-600 mt-2 text-sm">
                        {t('calendarDescription') || 'Red dates are not available for booking'}
                    </p>
                </div>
                
                {/* Admin-Style Legend */}
                <div className="mb-4 space-y-2">
                    <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-4 text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#10b981' }}></div>
                                <span className="text-gray-700 font-medium">{t('rental') || 'Rental'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#f59e0b' }}></div>
                                <span className="text-gray-700 font-medium">{t('maintenance') || 'Maintenance'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ef4444' }}></div>
                                <span className="text-gray-700 font-medium">{t('blocked') || 'Blocked'}</span>
                            </div>
                            <div className="border-l border-gray-300 mx-2 h-4"></div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded border-2" style={{ backgroundColor: '#f0fdf4', borderColor: '#86efac' }}></div>
                                <span className="text-gray-700 font-medium">{t('available') || 'Available'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded border-2" style={{ backgroundColor: '#fef2f2', borderColor: '#fca5a5' }}></div>
                                <span className="text-gray-700 font-medium">{t('booked') || 'Booked'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded border-2" style={{ backgroundColor: '#dbeafe', borderColor: '#3b82f6' }}></div>
                                <span className="text-gray-700 font-medium">{t('today') || 'Today'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Calendar Body */}
                <div className="h-[700px] bg-white p-8 rounded-b-2xl shadow-xl border-l border-r border-b border-gray-200 calendar-container">
                    <Calendar
                        localizer={localizer}
                        events={bookings}
                        startAccessor="start"
                        endAccessor="end"
                        style={{ height: '100%' }}
                        culture={language}
                        views={['month']}
                        defaultView="month"
                        date={currentDate}
                        onNavigate={() => {}} // Disable navigation
                        toolbar={false} // Hide the default toolbar
                        selectable
                        onSelectSlot={handleSelectSlot}
                        onSelectEvent={(event) => handleDeleteBooking((event as Booking).id)}
                        eventPropGetter={(event) => {
                            const booking = event as Booking;
                            let backgroundColor = '#10b981'; // default to rental green
                            
                            if (booking.type === 'maintenance') {
                                backgroundColor = '#f59e0b'; // amber
                            } else if (booking.type === 'blocked') {
                                backgroundColor = '#ef4444'; // red
                            } else {
                                backgroundColor = '#10b981'; // green for rental
                            }
                            
                            return {
                                style: {
                                    backgroundColor,
                                    borderColor: backgroundColor,
                                    color: 'white',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    borderRadius: '6px',
                                    border: 'none',
                                    boxShadow: `0 2px 4px ${backgroundColor}30`,
                                    textAlign: 'center'
                                }
                            };
                        }}
                        dayPropGetter={(date) => {
                            const today = new Date();
                            const isToday = date.toDateString() === today.toDateString();
                            const isPast = date < today;
                            
                            // Check if this date has any bookings
                            const hasBooking = bookings.some(booking => {
                                if (!booking.start || !booking.end) return false;
                                const bookingStart = new Date(booking.start.getFullYear(), booking.start.getMonth(), booking.start.getDate());
                                const bookingEnd = new Date(booking.end.getFullYear(), booking.end.getMonth(), booking.end.getDate());
                                const currentDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
                                
                                return currentDate >= bookingStart && currentDate < bookingEnd;
                            });
                            
                            let backgroundColor = 'white';
                            let borderColor = '#e5e7eb';
                            let color = '#374151';
                            
                            if (isPast) {
                                backgroundColor = '#f9fafb';
                                color = '#9ca3af';
                            } else if (hasBooking) {
                                backgroundColor = '#fef2f2'; // Light red for booked days
                                borderColor = '#fca5a5';
                                color = '#dc2626';
                            } else {
                                backgroundColor = '#f0fdf4'; // Light green for available days
                                borderColor = '#86efac';
                                color = '#166534';
                            }
                            
                            if (isToday) {
                                borderColor = '#3b82f6';
                                backgroundColor = isToday && hasBooking ? '#fef2f2' : isToday && !hasBooking ? '#f0fdf4' : '#dbeafe';
                            }
                            
                            return {
                                style: {
                                    backgroundColor,
                                    color,
                                    border: `2px solid ${borderColor}`,
                                    borderRadius: '8px',
                                    margin: '2px',
                                    transition: 'all 0.2s ease',
                                    fontWeight: hasBooking ? '600' : '400'
                                }
                            };
                        }}
                        messages={{
                            next: "▶",
                            previous: "◀",
                            today: t('today') || "Today",
                            month: t('month') || "Month",
                            week: t('week') || "Week", 
                            day: t('day') || "Day",
                            agenda: t('agenda') || "Agenda",
                            date: t('date') || "Date",
                            time: t('time') || "Time",
                            event: t('event') || "Event",
                            noEventsInRange: t('noEventsInRange') || "No bookings in this period.",
                            showMore: total => `+${total} ${t('more') || 'more'}`
                        }}
                    />
                </div>
            </div>
            <AddBookingDialog
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAdd={handleAddBooking}
            />
        </div>
    );
};

interface AddBookingDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (title: string) => void;
}

const AddBookingDialog: React.FC<AddBookingDialogProps> = ({ isOpen, onClose, onAdd }) => {
    const { t } = useLanguage();
    const [title, setTitle] = useState('Reserved');

    const handleAdd = () => {
        onAdd(title);
        setTitle('Reserved'); // Reset for next time
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t('addBooking')}</DialogTitle>
                    <DialogDescription>{t('addBookingDescription')}</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="title" className="text-right">
                            {t('title')}
                        </Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
                            className="col-span-3"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>{t('cancel')}</Button>
                    <Button onClick={handleAdd}>{t('add')}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default ApartmentCalendar;
