import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import { format, parse, startOfWeek, getDay, addMonths } from 'date-fns';
import { enUS, bg } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import { useAdminLanguage } from '../../../hooks/useAdminLanguage';
import { useLanguage } from '../../../hooks/useLanguage';
import RentalPeriodModal from '../RentalPeriodModal';
import { Booking } from '../../../types';
import { TabProps } from './types';
import { ArrowUp, ArrowDown, ChevronsUpDown } from 'lucide-react';

// Action dropdown component
interface ActionDropdownProps {
    booking: Booking;
    onEdit: (booking: Booking) => void;
    onDelete: (bookingId: string) => void;
    t: (key: string) => string;
}

const ActionDropdown: React.FC<ActionDropdownProps> = ({ 
    booking, 
    onEdit, 
    onDelete, 
    t 
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200"
                type="button"
                title={t('actions')}
            >
                <svg className="w-4 h-4 text-gray-600 hover:text-gray-800" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
            </button>

            {isOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                    <div className="p-1">
                        <button
                            onClick={() => {
                                onEdit(booking);
                                setIsOpen(false);
                            }}
                            className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-900 transition-colors flex items-center gap-3 rounded-md"
                        >
                            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            <span className="font-medium">{t('edit')}</span>
                        </button>
                        
                        {/* Survey Link - only show for bookings that have survey URLs */}
                        {booking.type === 'booked' && booking.surveyUrl && (
                            <>
                            <button
                                onClick={() => {
                                    window.open(booking.surveyUrl!, '_blank');
                                    setIsOpen(false);
                                }}
                                className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-900 transition-colors flex items-center gap-3 rounded-md"
                            >
                                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-1M14 1l6 6m0 0l-6 6m6-6H5" />
                                </svg>
                                <span className="font-medium">{t('openSurvey')}</span>
                            </button>
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(booking.surveyUrl!);
                                    setIsOpen(false);
                                }}
                                className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-900 transition-colors flex items-center gap-3 rounded-md"
                            >
                                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                <span className="font-medium">{t('copyLink')}</span>
                            </button>
                            </>
                        )}
                        
                        <button
                            onClick={() => {
                                onDelete(booking.id);
                                setIsOpen(false);
                            }}
                            className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-red-900 transition-colors flex items-center gap-3 rounded-md"
                        >
                            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            <span className="font-medium">{t('delete')}</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

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

const DragAndDropCalendar = withDragAndDrop(Calendar);

interface ApartmentCalendarTabProps extends TabProps {
    apartment: any;
    bookings: Booking[];
    setBookings: React.Dispatch<React.SetStateAction<Booking[]>>;
    isRentalModalOpen: boolean;
    setIsRentalModalOpen: (open: boolean) => void;
    selectedSlot: { start: Date; end: Date } | null;
    setSelectedSlot: (slot: { start: Date; end: Date } | null) => void;
    editingBooking: Booking | null;
    setEditingBooking: (booking: Booking | null) => void;
    handleSaveRentalPeriod: (data: any) => void;
    handleUpdateBooking: (bookingId: string, data: any) => void;
    handleDeleteBooking: (bookingId: string) => void;
    getBookingTypeTranslation: (type: string) => string;
}

const ApartmentCalendarTab: React.FC<ApartmentCalendarTabProps> = ({
    currentApartmentData,
    apartment,
    bookings,
    isRentalModalOpen,
    setIsRentalModalOpen,
    selectedSlot,
    setSelectedSlot,
    editingBooking,
    setEditingBooking,
    handleSaveRentalPeriod,
    handleUpdateBooking,
    handleDeleteBooking,
    getBookingTypeTranslation
}) => {
    const { t } = useAdminLanguage();
    const { language } = useLanguage();
    
    // Initialize calendar to availability start date if defined, otherwise current date
    const getInitialDate = () => {
        if (currentApartmentData.availabilityStart) {
            const availStart = new Date(currentApartmentData.availabilityStart);
            // Set to first day of the month
            return new Date(availStart.getFullYear(), availStart.getMonth(), 1);
        }
        return new Date();
    };
    
    const [currentDate, setCurrentDate] = useState(getInitialDate());
    const nextMonth = addMonths(currentDate, 1);

    // Table state
    const [sortColumn, setSortColumn] = useState<'start' | 'end' | 'visitorName' | 'totalPrice' | 'deposit' | 'remainingAmount' | 'status'>('start');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [filterType] = useState<'all' | 'rental' | 'blocked' | 'maintenance'>('all');
    const [searchTerm] = useState('');

    const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
        // If start and end are the same (single day click), make it a 1-day booking
        // by setting end to the next day
        let adjustedEnd = end;
        if (start.getTime() === end.getTime()) {
            adjustedEnd = new Date(start);
            adjustedEnd.setDate(adjustedEnd.getDate() + 1);
        }
        
        setSelectedSlot({ start, end: adjustedEnd });
        setIsRentalModalOpen(true);
    };

    const handleEventClick = (event: any) => {
        const booking = bookings.find(b => b.id === event.resource?.id || b.id === event.id);
        if (booking) {
            setEditingBooking(booking);
            setIsRentalModalOpen(true);
        }
    };

    const handleEditBooking = (booking: Booking) => {
        setEditingBooking(booking);
        setIsRentalModalOpen(true);
    };

    const handleEventDrop = ({ event, start, end }: any) => {
        const booking = bookings.find(b => b.id === event.resource?.id || b.id === event.id);
        if (booking && apartment) {
            const updatedData = {
                startDate: start,
                endDate: end,
                visitorName: booking.visitorName,
                notes: booking.notes,
                type: booking.type,
                pricingOfferId: booking.pricingOfferId,
                customPrice: booking.customPrice,
                totalPrice: booking.totalPrice,
                deposit: booking.deposit,
                depositCurrency: booking.depositCurrency,
                status: booking.status,
                guestEmail: booking.guestEmail,
                guestPhone: booking.guestPhone,
                surveyLanguage: booking.surveyLanguage,
                surveyToken: booking.surveyToken,
                surveyUrl: booking.surveyUrl
            };
            handleUpdateBooking(booking.id, updatedData);
        }
    };

    const handleEventResize = ({ event, start, end }: any) => {
        const booking = bookings.find(b => b.id === event.resource?.id || b.id === event.id);
        if (booking && apartment) {
            const updatedData = {
                startDate: start,
                endDate: end,
                visitorName: booking.visitorName,
                notes: booking.notes,
                type: booking.type,
                pricingOfferId: booking.pricingOfferId,
                customPrice: booking.customPrice,
                totalPrice: booking.totalPrice,
                deposit: booking.deposit,
                depositCurrency: booking.depositCurrency,
                status: booking.status,
                guestEmail: booking.guestEmail,
                guestPhone: booking.guestPhone,
                surveyLanguage: booking.surveyLanguage,
                surveyToken: booking.surveyToken,
                surveyUrl: booking.surveyUrl
            };
            handleUpdateBooking(booking.id, updatedData);
        }
    };

    // Function to style slots - now allows all dates
    const slotPropGetter = () => {
        return {};
    };

    const dayPropGetter = (date: Date) => {
        const cellDate = new Date(date);
        cellDate.setHours(0, 0, 0, 0);

        const availabilityStart = currentApartmentData.availabilityStart
            ? new Date(currentApartmentData.availabilityStart)
            : null;
        const availabilityEnd = currentApartmentData.availabilityEnd
            ? new Date(currentApartmentData.availabilityEnd)
            : null;
        const availabilityStartDate = availabilityStart
            ? new Date(availabilityStart.getFullYear(), availabilityStart.getMonth(), availabilityStart.getDate())
            : null;
        const availabilityEndDate = availabilityEnd
            ? new Date(availabilityEnd.getFullYear(), availabilityEnd.getMonth(), availabilityEnd.getDate())
            : null;
        const isOutsideAvailability = (
            (availabilityStartDate && cellDate < availabilityStartDate) ||
            (availabilityEndDate && cellDate > availabilityEndDate)
        );

        const hasBooking = bookings.some(booking => {
            if (!booking.start || !booking.end) return false;
            const bookingStart = new Date(booking.start);
            const bookingEnd = new Date(booking.end);
            bookingStart.setHours(0, 0, 0, 0);
            bookingEnd.setHours(0, 0, 0, 0);
            return cellDate >= bookingStart && cellDate < bookingEnd;
        });

        let backgroundColor = '#ffffff';
        let color = '#1f2937';

        if (isOutsideAvailability) {
            backgroundColor = '#f3f4f6';
            color = '#9ca3af';
        } else if (hasBooking) {
            backgroundColor = '#d1fae5';
            color = '#065f46';
        }

        return {
            style: {
                backgroundColor,
                color
            }
        };
    };

    // Generate translated title for calendar events
    const getEventTitle = (booking: Booking) => {
        if (booking.visitorName) {
            return booking.visitorName;
        } else {
            return getBookingTypeTranslation(booking.type || 'rental');
        }
    };

    const calendarEvents = bookings.map(booking => ({
        id: booking.id,
        title: getEventTitle(booking),
        start: booking.start,
        end: booking.end,
        resource: { id: booking.id, booking }
    }));

    const eventStyleGetter = (event: any) => {
        const booking = event.resource?.booking;
        let backgroundColor = '#059669';
        
        if (booking?.type === 'blocked') {
            backgroundColor = '#dc2626';
        } else if (booking?.type === 'maintenance') {
            backgroundColor = '#f59e0b';
        }
        
        return {
            style: {
                backgroundColor,
                border: 'none',
                borderRadius: '4px',
                color: '#ffffff',
                padding: '2px 4px',
                fontSize: '11px',
                fontWeight: '600',
                opacity: 0.95
            }
        };
    };

    const CalendarEvent = ({ event }: { event: any }) => {
        return <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{event.title}</span>;
    };

    const navigateCalendar = (direction: 'prev' | 'next') => {
        if (direction === 'prev') {
            setCurrentDate(addMonths(currentDate, -1));
        } else {
            setCurrentDate(addMonths(currentDate, 1));
        }
    };

    // Table sorting and filtering logic
    const filteredAndSortedBookings = useMemo(() => {
        let filtered = bookings.filter(booking => {
            // Filter by type
            if (filterType !== 'all' && booking.type !== filterType) {
                return false;
            }
            
            // Filter by search term (visitor name)
            if (searchTerm && booking.visitorName && !booking.visitorName.toLowerCase().includes(searchTerm.toLowerCase())) {
                return false;
            }
            
            return true;
        });

        // Sort
        filtered.sort((a, b) => {
            let aValue, bValue;
            
            switch (sortColumn) {
                case 'start':
                    aValue = new Date(a.start).getTime();
                    bValue = new Date(b.start).getTime();
                    break;
                case 'end':
                    aValue = new Date(a.end).getTime();
                    bValue = new Date(b.end).getTime();
                    break;
                case 'visitorName':
                    aValue = a.visitorName?.toLowerCase() || '';
                    bValue = b.visitorName?.toLowerCase() || '';
                    break;
                case 'totalPrice':
                    aValue = a.totalPrice || 0;
                    bValue = a.totalPrice || 0;
                    break;
                case 'deposit':
                    aValue = a.deposit || 0;
                    bValue = b.deposit || 0;
                    break;
                case 'remainingAmount':
                    aValue = calculateRemainingAmount(a);
                    bValue = calculateRemainingAmount(b);
                    break;
                case 'status':
                    // Define sorting order: booked < deposit_paid < fully_paid
                    const statusOrder = { 'booked': 1, 'deposit_paid': 2, 'fully_paid': 3 };
                    aValue = statusOrder[a.status as keyof typeof statusOrder] || 0;
                    bValue = statusOrder[b.status as keyof typeof statusOrder] || 0;
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

        return filtered;
    }, [bookings, sortColumn, sortDirection, filterType, searchTerm]);

    // Group bookings by year
    const bookingsByYear = useMemo(() => {
        const grouped = new Map<number, Booking[]>();
        
        filteredAndSortedBookings.forEach(booking => {
            const year = new Date(booking.start).getFullYear();
            if (!grouped.has(year)) {
                grouped.set(year, []);
            }
            grouped.get(year)!.push(booking);
        });
        
        // Sort years in descending order (most recent first)
        return Array.from(grouped.entries()).sort((a, b) => b[0] - a[0]);
    }, [filteredAndSortedBookings]);

    const handleSort = (column: typeof sortColumn) => {
        if (column === sortColumn) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
    };

    const calculateDuration = (start: Date, end: Date) => {
        return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    };

    // Exchange rate (used for legacy stored values)
    const EUR_TO_BGN_RATE = 1.95583;

    const convertBgnToEur = (bgnPrice: number): number => {
        return Math.round((bgnPrice / EUR_TO_BGN_RATE) * 100) / 100;
    };

    const formatPriceEUR = (price: number | undefined) => {
        if (!price) return '-';
        // Stored legacy value; convert to EUR for display
        const eurPrice = convertBgnToEur(price);
        return `€${eurPrice.toFixed(2)}`;
    };

    const getSortIcon = (column: typeof sortColumn) => {
        const className = "inline-block w-4 h-4 ml-1";
        if (column !== sortColumn) {
            return <ChevronsUpDown className={className} />;
        }
        return sortDirection === 'asc' ? <ArrowUp className={className} /> : <ArrowDown className={className} />;
    };

    // Format date range for display
    const formatDateRange = (start: Date, end: Date) => {
        const startFormatted = start.toLocaleDateString(language === 'bg' ? 'bg-BG' : 'en-US', { 
            month: 'short', 
            day: 'numeric' 
        });
        const endFormatted = end.toLocaleDateString(language === 'bg' ? 'bg-BG' : 'en-US', { 
            month: 'short', 
            day: 'numeric',
            year: start.getFullYear() !== end.getFullYear() ? 'numeric' : undefined
        });
        return `${startFormatted} - ${endFormatted}`;
    };

    // Get status translation
    const getStatusTranslation = (status: string | undefined) => {
        switch (status) {
            case 'booked':
                return t('statusBooked');
            case 'deposit_paid':
                return t('statusDepositPaid');
            case 'fully_paid':
                return t('statusFullyPaid');
            default:
                return t('statusBooked');
        }
    };

    // Calculate remaining amount for a booking
    const calculateRemainingAmount = (booking: Booking): number => {
        if (!booking.totalPrice) return 0;
        if (booking.status === 'fully_paid') return 0;
        
        const deposit = booking.deposit || 0;
        return Math.max(0, booking.totalPrice - deposit);
    };

    // Calculate received money for a booking based on status
    const calculateReceivedMoney = (booking: Booking): number => {
        if (!booking.totalPrice) return 0;
        
        switch (booking.status) {
            case 'fully_paid':
                return booking.totalPrice; // Full amount received
            case 'deposit_paid':
                return booking.deposit || 0; // Only deposit received
            case 'booked':
            default:
                return 0; // No money received yet
        }
    };

    return (
        <div className="space-y-6 pb-16">
            {/* Add CSS for pulse animation */}
            <style>{`
                @keyframes pulse {
                    0%, 100% {
                        opacity: 1;
                    }
                    50% {
                        opacity: 0.7;
                    }
                }
            `}</style>

            {/* Tab Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pb-4 border-b gap-2">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900">{t('calendarAndBookings')}</h3>
                <div className="text-sm text-gray-600">
                    {t('calendarDescription')}
                </div>
            </div>

            {/* Calendar Legend */}
            <div className="flex gap-4 mb-4 p-3 sm:p-4 bg-gray-50 rounded-lg flex-wrap">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                    <span className="text-xs sm:text-sm">{t('bookingTypeBooked')}</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-500 rounded"></div>
                    <span className="text-xs sm:text-sm">{t('bookingTypeBlocked')}</span>
                </div>
            </div>

            {/* Navigation Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center mb-4 gap-3">
                <button 
                    onClick={() => navigateCalendar('prev')}
                    className="px-3 sm:px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-medium transition-colors text-sm sm:text-base"
                >
                    ← {t('previous')}
                </button>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-8 text-center text-base sm:text-lg font-semibold text-gray-800">
                    <span>
                        {currentDate.toLocaleDateString(language === 'bg' ? 'bg-BG' : 'en-US', { 
                            month: 'long', 
                            year: 'numeric' 
                        })}
                    </span>
                    <span className="hidden sm:inline">
                        {nextMonth.toLocaleDateString(language === 'bg' ? 'bg-BG' : 'en-US', { 
                            month: 'long', 
                            year: 'numeric' 
                        })}
                    </span>
                </div>
                <button 
                    onClick={() => navigateCalendar('next')}
                    className="px-3 sm:px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-medium transition-colors text-sm sm:text-base"
                >
                    {t('next')} →
                </button>
            </div>

            {/* Dual Calendar Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 admin-reservations-calendar">
                <style>
                    {`
                        .admin-reservations-calendar .rbc-calendar {
                            border: 1px solid #e5e7eb;
                            border-radius: 8px;
                            overflow: hidden;
                        }
                        .admin-reservations-calendar .rbc-month-view {
                            border: none;
                        }
                        .admin-reservations-calendar .rbc-day-bg {
                            border: 1px solid #e5e7eb;
                        }
                        .admin-reservations-calendar .rbc-month-row {
                            min-height: 100px;
                        }
                        .admin-reservations-calendar .rbc-date-cell {
                            padding: 4px 6px;
                        }
                        .admin-reservations-calendar .rbc-date-cell > a,
                        .admin-reservations-calendar .rbc-date-cell > button {
                            font-weight: 600;
                            font-size: 14px;
                        }
                        .admin-reservations-calendar .rbc-header {
                            border-bottom: 2px solid #e5e7eb;
                            background-color: #f8fafc;
                            font-weight: 600;
                            padding: 12px 8px;
                            text-align: center;
                        }
                        .admin-reservations-calendar .rbc-event {
                            padding: 2px 4px;
                        }
                        .admin-reservations-calendar .rbc-event-content {
                            white-space: nowrap;
                            overflow: hidden;
                            text-overflow: ellipsis;
                            font-size: 11px;
                            font-weight: 600;
                        }
                        .admin-reservations-calendar .rbc-off-range {
                            color: #9ca3af;
                        }
                        .admin-reservations-calendar .rbc-off-range-bg {
                            background-color: #f9fafb;
                        }
                    `}
                </style>
                {/* Current Month Calendar */}
                <div className="bg-white border rounded-lg p-3 sm:p-4 flex flex-col" style={{ height: '600px' }}>
                    <h4 className="text-base sm:text-lg font-semibold text-center mb-3 sm:mb-4 text-gray-700 flex-shrink-0">
                        {currentDate.toLocaleDateString(language === 'bg' ? 'bg-BG' : 'en-US', { 
                            month: 'long', 
                            year: 'numeric' 
                        })}
                    </h4>
                    <div className="flex-1 min-h-0 overflow-hidden">
                        <DragAndDropCalendar
                            localizer={localizer}
                            events={calendarEvents}
                            startAccessor={(event: any) => event.start}
                            endAccessor={(event: any) => event.end}
                            culture={language}
                            onSelectSlot={handleSelectSlot}
                            onSelectEvent={handleEventClick}
                            onEventDrop={handleEventDrop}
                            onEventResize={handleEventResize}
                            selectable
                            resizable
                            eventPropGetter={eventStyleGetter}
                            slotPropGetter={slotPropGetter}
                            dayPropGetter={dayPropGetter}
                            components={{
                                event: CalendarEvent
                            }}
                            views={['month']}
                            defaultView="month"
                            date={currentDate}
                            onNavigate={() => {}} // Disable built-in navigation
                            toolbar={false} // Hide toolbar since we have custom navigation
                            step={60}
                            showMultiDayTimes
                            style={{ height: '100%' }}
                            messages={{
                                date: t('date'),
                                time: t('time'),
                                event: t('event'),
                                allDay: t('allDay'),
                                week: t('week'),
                                work_week: t('workWeek'),
                                day: t('day'),
                                month: t('month'),
                                previous: t('previous'),
                                next: t('next'),
                                yesterday: t('yesterday'),
                                tomorrow: t('tomorrow'),
                                today: t('today'),
                                agenda: t('agenda'),
                                noEventsInRange: t('noEventsInRange'),
                                showMore: (total: number) => `+${total} ${t('more')}`
                            }}
                        />
                    </div>
                </div>

                {/* Next Month Calendar */}
                <div className="bg-white border rounded-lg p-3 sm:p-4 flex flex-col" style={{ height: '600px' }}>
                    <h4 className="text-base sm:text-lg font-semibold text-center mb-3 sm:mb-4 text-gray-700 flex-shrink-0">
                        {nextMonth.toLocaleDateString(language === 'bg' ? 'bg-BG' : 'en-US', { 
                            month: 'long', 
                            year: 'numeric' 
                        })}
                    </h4>
                    <div className="flex-1 min-h-0 overflow-hidden">
                        <DragAndDropCalendar
                            localizer={localizer}
                            events={calendarEvents}
                            startAccessor={(event: any) => event.start}
                            endAccessor={(event: any) => event.end}
                            culture={language}
                            onSelectSlot={handleSelectSlot}
                            onSelectEvent={handleEventClick}
                            onEventDrop={handleEventDrop}
                            onEventResize={handleEventResize}
                            selectable
                            resizable
                            eventPropGetter={eventStyleGetter}
                            slotPropGetter={slotPropGetter}
                            dayPropGetter={dayPropGetter}
                            components={{
                                event: CalendarEvent
                            }}
                            views={['month']}
                            defaultView="month"
                            date={nextMonth}
                            onNavigate={() => {}} // Disable built-in navigation
                            toolbar={false} // Hide toolbar since we have custom navigation
                            step={60}
                            showMultiDayTimes
                            style={{ height: '100%' }}
                            messages={{
                                date: t('date'),
                                time: t('time'),
                                event: t('event'),
                                allDay: t('allDay'),
                                week: t('week'),
                                work_week: t('workWeek'),
                                day: t('day'),
                                month: t('month'),
                                previous: t('previous'),
                                next: t('next'),
                                yesterday: t('yesterday'),
                                tomorrow: t('tomorrow'),
                                today: t('today'),
                                agenda: t('agenda'),
                                noEventsInRange: t('noEventsInRange'),
                                showMore: (total: number) => `+${total} ${t('more')}`
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Bookings Table Section */}
            <div className="bg-white border rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                    <h4 className="text-xl font-semibold text-gray-900">{t('allBookings')} ({bookings.length})</h4>
                </div>
                

                {/* Tables grouped by year */}
                <div className="space-y-8">
                    {bookingsByYear.length === 0 ? (
                        <div className="text-center text-gray-500 py-8">
                            {t('noBookingsFound')}
                        </div>
                    ) : (
                        bookingsByYear.map(([year, yearBookings]) => (
                            <div key={year} className="space-y-4">
                                {/* Year Header */}
                                <div className="flex items-center gap-4">
                                    <h5 className="text-2xl font-bold text-gray-800">{year}</h5>
                                    <div className="flex-1 h-px bg-gray-200"></div>
                                    <span className="text-sm text-gray-500">
                                        {yearBookings.length} {yearBookings.length === 1 ? t('booking') : t('bookings')}
                                    </span>
                                </div>

                                {/* Table for this year */}
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th 
                                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                                    onClick={() => handleSort('start')}
                                                >
                                                    <div className="flex items-center">
                                                        {t('dates')} {getSortIcon('start')}
                                                    </div>
                                                </th>
                                                <th 
                                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                                    onClick={() => handleSort('visitorName')}
                                                >
                                                    <div className="flex items-center">
                                                        {t('visitorName')} {getSortIcon('visitorName')}
                                                    </div>
                                                </th>
                                                <th 
                                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                                    onClick={() => handleSort('totalPrice')}
                                                >
                                                    <div className="flex items-center">
                                                        {t('totalPrice')} {getSortIcon('totalPrice')}
                                                    </div>
                                                </th>
                                                <th 
                                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                                    onClick={() => handleSort('deposit')}
                                                >
                                                    <div className="flex items-center">
                                                        {t('deposit')} {getSortIcon('deposit')}
                                                    </div>
                                                </th>
                                                <th 
                                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                                    onClick={() => handleSort('remainingAmount')}
                                                >
                                                    <div className="flex items-center">
                                                        {t('remainingAmount')} {getSortIcon('remainingAmount')}
                                                    </div>
                                                </th>
                                                <th 
                                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                                    onClick={() => handleSort('status')}
                                                >
                                                    <div className="flex items-center">
                                                        {t('status')} {getSortIcon('status')}
                                                    </div>
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {yearBookings.map((booking) => {
                                                const duration = calculateDuration(booking.start, booking.end);
                                                
                                                return (
                                                    <tr key={booking.id} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {formatDateRange(booking.start, booking.end)}
                                                            <span className="block text-xs text-gray-500">
                                                                ({duration} {duration === 1 ? t('day') : t('days')})
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            <div className="flex items-center gap-2">
                                                                {booking.visitorName ? (
                                                                    <button
                                                                        onClick={() => handleEditBooking(booking)}
                                                                        className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer font-medium transition-colors"
                                                                        title={t('edit')}
                                                                    >
                                                                        {booking.visitorName}
                                                                    </button>
                                                                ) : (
                                                                    '-'
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {booking.totalPrice ? formatPriceEUR(booking.totalPrice) : '-'}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {booking.deposit ? formatPriceEUR(booking.deposit) : '-'}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {calculateRemainingAmount(booking) > 0 ? formatPriceEUR(calculateRemainingAmount(booking)) : '-'}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                                booking.status === 'fully_paid' ? 'bg-green-100 text-green-800' :
                                                                booking.status === 'deposit_paid' ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-gray-100 text-gray-800'
                                                            }`}>
                                                                {getStatusTranslation(booking.status)}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                            <ActionDropdown
                                                                booking={booking}
                                                                onEdit={handleEditBooking}
                                                                onDelete={handleDeleteBooking}
                                                                t={t}
                                                            />
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Year Summary */}
                                <div className="mt-2 text-sm text-gray-600 bg-gray-50 rounded-lg p-4">
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium">
                                            {year} {t('summary')}
                                        </span>
                                        <div className="flex gap-6 text-right">
                                            <div>
                                                <div className="font-semibold text-gray-900">
                                                    {formatPriceEUR(
                                                        yearBookings
                                                            .filter(b => (b.type === 'booked' || b.type === 'rental') && b.totalPrice)
                                                            .reduce((sum, b) => sum + (b.totalPrice || 0), 0)
                                                    )}
                                                </div>
                                                <div className="text-xs text-gray-500">{t('totalRevenue')}</div>
                                            </div>
                                            <div>
                                                <div className="font-semibold text-green-700">
                                                    {formatPriceEUR(
                                                        yearBookings
                                                            .filter(b => (b.type === 'booked' || b.type === 'rental'))
                                                            .reduce((sum, b) => sum + calculateReceivedMoney(b), 0)
                                                    )}
                                                </div>
                                                <div className="text-xs text-gray-500">{t('moneyReceived')}</div>
                                            </div>
                                            <div>
                                                <div className="font-semibold text-orange-700">
                                                    {formatPriceEUR(
                                                        yearBookings
                                                            .filter(b => (b.type === 'booked' || b.type === 'rental'))
                                                            .reduce((sum, b) => sum + calculateRemainingAmount(b), 0)
                                                    )}
                                                </div>
                                                <div className="text-xs text-gray-500">{t('totalRemaining')}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Overall Summary */}
                {filteredAndSortedBookings.length > 0 && (
                    <div className="mt-6 text-sm text-gray-700 border-t-2 border-gray-300 pt-4">
                        <div className="flex justify-between items-center bg-blue-50 rounded-lg p-4">
                            <span className="font-bold text-lg text-gray-900">
                                {t('overallTotal')}
                            </span>
                            <div className="flex gap-6 text-right">
                                <div>
                                    <div className="font-bold text-lg text-gray-900">
                                        {formatPriceEUR(
                                            filteredAndSortedBookings
                                                .filter(b => (b.type === 'booked' || b.type === 'rental') && b.totalPrice)
                                                .reduce((sum, b) => sum + (b.totalPrice || 0), 0)
                                        )}
                                    </div>
                                    <div className="text-xs text-gray-600">{t('totalRevenue')}</div>
                                </div>
                                <div>
                                    <div className="font-bold text-lg text-green-700">
                                        {formatPriceEUR(
                                            filteredAndSortedBookings
                                                .filter(b => (b.type === 'booked' || b.type === 'rental'))
                                                .reduce((sum, b) => sum + calculateReceivedMoney(b), 0)
                                        )}
                                    </div>
                                    <div className="text-xs text-gray-600">{t('moneyReceived')}</div>
                                </div>
                                <div>
                                    <div className="font-bold text-lg text-orange-700">
                                        {formatPriceEUR(
                                            filteredAndSortedBookings
                                                .filter(b => (b.type === 'booked' || b.type === 'rental'))
                                                .reduce((sum, b) => sum + calculateRemainingAmount(b), 0)
                                        )}
                                    </div>
                                    <div className="text-xs text-gray-600">{t('totalRemaining')}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Booking Modal */}
            {isRentalModalOpen && (
                <RentalPeriodModal
                    isOpen={isRentalModalOpen}
                    onClose={() => {
                        setIsRentalModalOpen(false);
                        setSelectedSlot(null);
                        setEditingBooking(null);
                    }}
                    onSave={editingBooking ? 
                        (data: any) => handleUpdateBooking(editingBooking.id, data) : 
                        handleSaveRentalPeriod
                    }
                    onDelete={editingBooking ? 
                        () => {
                            handleDeleteBooking(editingBooking.id);
                            setIsRentalModalOpen(false);
                            setEditingBooking(null);
                        } : 
                        undefined
                    }
                    selectedSlot={selectedSlot}
                    editingBooking={editingBooking}
                    pricingOffers={currentApartmentData.pricingOffers || []}
                    availabilityStart={currentApartmentData.availabilityStart}
                    availabilityEnd={currentApartmentData.availabilityEnd}
                />
            )}
        </div>
    );
};

export default ApartmentCalendarTab; 