import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { enUS, bg } from 'date-fns/locale';
import { useLanguage } from '../../hooks/useLanguage';
import { useAdminLanguage } from '../../hooks/useAdminLanguage';
import { Booking } from '../../types';

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

interface Apartment {
    id: string;
    name: string;
}

const CalendarAdmin: React.FC = () => {
    const { language } = useLanguage();
    const { t } = useAdminLanguage();
    const [apartments, setApartments] = useState<Apartment[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

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

    const fetchApartmentsAndBookings = useCallback(async () => {
        setLoading(true);
        try {
            const apartmentsSnapshot = await getDocs(collection(db, 'apartments'));
            const apartmentsData = apartmentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Apartment));
            setApartments(apartmentsData);

            // Fetch bookings from both locations (apartment subcollections and old main collection)
            const allBookings: Booking[] = [];
            
            // Fetch from new apartment subcollections
            for (const apartment of apartmentsData) {
                const bookingsSnapshot = await getDocs(collection(db, `apartments/${apartment.id}/bookings`));
                const apartmentBookings = bookingsSnapshot.docs.map(doc => {
                    const data = doc.data();
                    
                    // Create admin-friendly title that shows visitor name and apartment
                    let title = apartment.name || 'Unknown Apartment';
                    if (data.visitorName) {
                        title = `${data.visitorName} (${apartment.name || 'Unknown'})`;
                    } else if (data.type === 'maintenance') {
                        title = `${t('bookingTypeMaintenance')} (${apartment.name || 'Unknown'})`;
                    } else if (data.type === 'blocked') {
                        title = `${t('bookingTypeBlocked')} (${apartment.name || 'Unknown'})`;
                    }
                    
                    return {
                        id: doc.id,
                        apartmentId: apartment.id,
                        start: safeToDate(data.start),
                        end: safeToDate(data.end),
                        title,
                        visitorName: data.visitorName,
                        isRentalPeriod: data.isRentalPeriod || (data.type || 'rental') === 'rental',
                        type: data.type || 'rental'
                    } as Booking;
                });
                allBookings.push(...apartmentBookings);
            }
            
            // Also fetch from old main collection (if accessible)
            try {
                const oldBookingsSnapshot = await getDocs(collection(db, 'bookings'));
                const oldBookingsData = oldBookingsSnapshot.docs.map(doc => {
                    const data = doc.data();
                    const apartment = apartmentsData.find(ap => ap.id === data.apartmentId);
                    
                    // Create admin-friendly title that shows visitor name and apartment
                    let title = apartment?.name || 'Unknown Apartment';
                    if (data.visitorName) {
                        title = `${data.visitorName} (${apartment?.name || 'Unknown'})`;
                    } else if (data.type === 'maintenance') {
                        title = `${t('bookingTypeMaintenance')} (${apartment?.name || 'Unknown'})`;
                    } else if (data.type === 'blocked') {
                        title = `${t('bookingTypeBlocked')} (${apartment?.name || 'Unknown'})`;
                    }
                    
                    return {
                        id: doc.id,
                        apartmentId: data.apartmentId,
                        start: safeToDate(data.start),
                        end: safeToDate(data.end),
                        title,
                        visitorName: data.visitorName,
                        isRentalPeriod: data.isRentalPeriod || (data.type || 'rental') === 'rental',
                        type: data.type || 'rental'
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
    }, [t]);

    useEffect(() => {
        fetchApartmentsAndBookings();
    }, [fetchApartmentsAndBookings]);





    const handleSelectEvent = async (event: Booking) => {
        // Just show booking details - calendar is now read-only
        const startDate = event.start.toLocaleDateString();
        const endDate = event.end.toLocaleDateString();
        const duration = Math.ceil((event.end.getTime() - event.start.getTime()) / (1000 * 60 * 60 * 24));
        
        let details = `Booking Details:\n\n`;
        details += `Period: ${startDate} - ${endDate}\n`;
        details += `Duration: ${duration} day${duration !== 1 ? 's' : ''}\n`;
        details += `Type: ${event.type || 'rental'}\n`;
        
        if (event.visitorName) {
            details += `Visitor: ${event.visitorName}\n`;
        }
        
        details += `\nTo manage this booking, go to the apartment's Bookings tab.`;
        
        alert(details);
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <>
                    <div className="h-[calc(100vh-4rem)] p-4">
            <h2 className="text-2xl font-bold mb-4">Apartment Bookings Calendar</h2>
            
            {/* Legend */}
            <div className="mb-4 flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#10b981' }}></div>
                    <span>{t('bookingTypeBooked')}</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#f59e0b' }}></div>
                    <span>{t('bookingTypeMaintenance')}</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ef4444' }}></div>
                    <span>{t('bookingTypeBlocked')}</span>
                </div>
            </div>
            
            <Calendar
                localizer={localizer}
                events={bookings}
                startAccessor="start"
                endAccessor="end"
                style={{ height: '100%' }}
                onSelectEvent={handleSelectEvent}
                culture={language}
                views={['month']}
                defaultView="month"
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
                            fontSize: '12px'
                        }
                    };
                }}
                messages={{
                    next: "Next",
                    previous: "Previous",
                    today: "Today",
                    month: "Month",
                    week: "Week",
                    day: "Day",
                    agenda: "Agenda",
                    date: "Date",
                    time: "Time",
                    event: "Event",
                    noEventsInRange: "There are no events in this range.",
                    showMore: total => `+${total} more`
                }}
            />
        </div>
        </>
    );
};

export default CalendarAdmin;
