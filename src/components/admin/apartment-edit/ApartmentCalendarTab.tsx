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
    const [currentDate, setCurrentDate] = useState(new Date());
    const nextMonth = addMonths(currentDate, 1);

    // Table state
    const [sortColumn, setSortColumn] = useState<'start' | 'end' | 'visitorName' | 'totalPrice' | 'deposit' | 'remainingAmount' | 'status'>('start');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [filterType] = useState<'all' | 'rental' | 'blocked' | 'maintenance'>('all');
    const [searchTerm] = useState('');

    const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
        // Check if the selected dates are within the availability period
        if (currentApartmentData.availabilityStart || currentApartmentData.availabilityEnd) {
            const availStart = currentApartmentData.availabilityStart ? new Date(currentApartmentData.availabilityStart) : null;
            const availEnd = currentApartmentData.availabilityEnd ? new Date(currentApartmentData.availabilityEnd) : null;
            
            // Check if start date is within availability
            if (availStart && start < availStart) {
                alert(t('bookingStartOutsideAvailability') || 'Start date is before the apartment availability period.');
                return;
            }
            
            // Check if end date is within availability  
            if (availEnd && end > availEnd) {
                alert(t('bookingEndOutsideAvailability') || 'End date is after the apartment availability period.');
                return;
            }
        }
        
        setSelectedSlot({ start, end });
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
            // Check if the new dates are within the availability period
            if (currentApartmentData.availabilityStart || currentApartmentData.availabilityEnd) {
                const availStart = currentApartmentData.availabilityStart ? new Date(currentApartmentData.availabilityStart) : null;
                const availEnd = currentApartmentData.availabilityEnd ? new Date(currentApartmentData.availabilityEnd) : null;
                
                if ((availStart && start < availStart) || (availEnd && end > availEnd)) {
                    alert(t('cannotMoveBookingOutsideAvailability') || 'Cannot move booking outside the apartment availability period.');
                    return;
                }
            }
            
            const updatedData = {
                startDate: start,
                endDate: end,
                visitorName: booking.visitorName,
                type: booking.type,
                pricingOfferId: booking.pricingOfferId,
                customPrice: booking.customPrice,
                totalPrice: booking.totalPrice
            };
            handleUpdateBooking(booking.id, updatedData);
        }
    };

    const handleEventResize = ({ event, start, end }: any) => {
        const booking = bookings.find(b => b.id === event.resource?.id || b.id === event.id);
        if (booking && apartment) {
            // Check if the new dates are within the availability period
            if (currentApartmentData.availabilityStart || currentApartmentData.availabilityEnd) {
                const availStart = currentApartmentData.availabilityStart ? new Date(currentApartmentData.availabilityStart) : null;
                const availEnd = currentApartmentData.availabilityEnd ? new Date(currentApartmentData.availabilityEnd) : null;
                
                if ((availStart && start < availStart) || (availEnd && end > availEnd)) {
                    alert(t('cannotResizeBookingOutsideAvailability') || 'Cannot resize booking outside the apartment availability period.');
                    return;
                }
            }
            
            const updatedData = {
                startDate: start,
                endDate: end,
                visitorName: booking.visitorName,
                type: booking.type,
                pricingOfferId: booking.pricingOfferId,
                customPrice: booking.customPrice,
                totalPrice: booking.totalPrice
            };
            handleUpdateBooking(booking.id, updatedData);
        }
    };

    // Function to style slots based on availability
    const slotPropGetter = (date: Date) => {
        if (currentApartmentData.availabilityStart || currentApartmentData.availabilityEnd) {
            const availStart = currentApartmentData.availabilityStart ? new Date(currentApartmentData.availabilityStart) : null;
            const availEnd = currentApartmentData.availabilityEnd ? new Date(currentApartmentData.availabilityEnd) : null;
            
            const isOutsideAvailability = (availStart && date < availStart) || (availEnd && date > availEnd);
            
            if (isOutsideAvailability) {
                return {
                    style: {
                        backgroundColor: '#f3f4f6',
                        color: '#9ca3af',
                        pointerEvents: 'none' as const,
                        cursor: 'not-allowed'
                    }
                };
            }
        }
        
        return {};
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
        const booking = bookings.find(b => b.id === event.resource?.id || b.id === event.id);
        const bookingType = booking?.type || 'rental';
        
        // Check if booking is currently active (today is between start and end dates)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const isActive = booking && 
            new Date(booking.start) <= today && 
            new Date(booking.end) >= today;
        
        let backgroundColor = '#3174ad';
        let borderColor = '#265a87';
        
        if (isActive) {
            // Active booking - use brighter, more vibrant colors with special styling
            switch (bookingType) {
                case 'blocked':
                    backgroundColor = '#ff0000'; // Bright red
                    borderColor = '#cc0000';
                    break;
                case 'maintenance':
                    backgroundColor = '#ff8c00'; // Bright orange
                    borderColor = '#e67c00';
                    break;
                case 'rental':
                case 'booked':
                default:
                    backgroundColor = '#00cc66'; // Bright green
                    borderColor = '#00b359';
                    break;
            }
            
            return {
                style: {
                    backgroundColor,
                    borderColor,
                    color: 'white',
                    border: `3px solid ${borderColor}`,
                    borderRadius: '6px',
                    fontSize: '12px',
                    padding: '2px 4px',
                    fontWeight: 'bold',
                    boxShadow: `0 0 10px ${backgroundColor}66`,
                    animation: 'pulse 2s infinite'
                }
            };
        } else {
            // Non-active booking - use regular colors
        switch (bookingType) {
            case 'blocked':
                backgroundColor = '#ef4444';
                borderColor = '#dc2626';
                break;
            case 'maintenance':
                backgroundColor = '#f59e0b';
                borderColor = '#d97706';
                break;
            case 'rental':
            case 'booked':
            default:
                backgroundColor = '#10b981';
                borderColor = '#059669';
                break;
        }

        return {
            style: {
                backgroundColor,
                borderColor,
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '12px',
                padding: '2px 4px'
            }
        };
        }
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

    // Exchange rate: 1 EUR = 1.95583 BGN
    const EUR_TO_BGN_RATE = 1.95583;

    const convertBgnToEur = (bgnPrice: number): number => {
        return Math.round((bgnPrice / EUR_TO_BGN_RATE) * 100) / 100;
    };

    const formatPriceDual = (price: number | undefined) => {
        if (!price) return '-';
        // Price is stored in BGN, so we convert to EUR for display
        const eurPrice = convertBgnToEur(price);
        return `${eurPrice.toFixed(2)} € / ${price.toFixed(2)} лв.`;
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
        <div className="space-y-6">
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Current Month Calendar */}
                <div className="bg-white border rounded-lg p-3 sm:p-4 flex flex-col" style={{ height: '500px' }}>
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
                            views={['month']}
                            defaultView="month"
                            date={currentDate}
                            onNavigate={() => {}} // Disable built-in navigation
                            toolbar={false} // Hide toolbar since we have custom navigation
                            step={60}
                            showMultiDayTimes
                            style={{ height: '100%', fontSize: '12px' }}
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
                <div className="bg-white border rounded-lg p-4 flex flex-col" style={{ height: '700px' }}>
                    <h4 className="text-lg font-semibold text-center mb-4 text-gray-700 flex-shrink-0">
                        {nextMonth.toLocaleDateString(language === 'bg' ? 'bg-BG' : 'en-US', { 
                            month: 'long', 
                            year: 'numeric' 
                        })}
                    </h4>
                    <div className="flex-1 min-h-0">
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
                

                {/* Table */}
                <div>
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
                            {filteredAndSortedBookings.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                                        {t('noBookingsFound')}
                                    </td>
                                </tr>
                            ) : (
                                filteredAndSortedBookings.map((booking) => {
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
                                                {booking.totalPrice ? formatPriceDual(booking.totalPrice) : '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {booking.deposit ? formatPriceDual(booking.deposit) : '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {calculateRemainingAmount(booking) > 0 ? formatPriceDual(calculateRemainingAmount(booking)) : '-'}
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
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Table Summary */}
                {filteredAndSortedBookings.length > 0 && (
                    <div className="mt-4 text-sm text-gray-600 border-t pt-4">
                        <div className="flex justify-between">
                            <span>
                                {t('showing')} {filteredAndSortedBookings.length} {t('of')} {bookings.length} {t('bookings')}
                            </span>
                            <div className="text-right">
                                <div>
                                    <strong>{t('totalRevenue')}:</strong> {formatPriceDual(
                                        filteredAndSortedBookings
                                            .filter(b => (b.type === 'booked' || b.type === 'rental') && b.totalPrice)
                                            .reduce((sum, b) => sum + (b.totalPrice || 0), 0)
                                    )}
                                </div>
                                <div className="text-xs mt-1">
                                    <span className="mr-4">
                                        {t('moneyReceived')}: {formatPriceDual(
                                            filteredAndSortedBookings
                                                .filter(b => (b.type === 'booked' || b.type === 'rental'))
                                                .reduce((sum, b) => sum + calculateReceivedMoney(b), 0)
                                        )}
                                    </span>
                                    <span>
                                        {t('totalRemaining')}: {formatPriceDual(
                                            filteredAndSortedBookings
                                                .filter(b => (b.type === 'booked' || b.type === 'rental'))
                                                .reduce((sum, b) => sum + calculateRemainingAmount(b), 0)
                                        )}
                                    </span>
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
                />
            )}
        </div>
    );
};

export default ApartmentCalendarTab; 