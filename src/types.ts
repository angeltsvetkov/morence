export interface PricingOffer {
    id: string;
    name: string;
    days: number;
    price: number; // Kept for backward compatibility (EUR)
    priceBGN?: number; // Price in Bulgarian Lev
    priceEUR?: number; // Price in Euro
    description?: string;
}

export interface Amenity {
    id: string;
    en: string;
    bg: string;
    icon?: string; // Icon identifier/name for the amenity
}

export interface SurveyQuestion {
    id: string;
    question: { [key in 'bg' | 'en']: string };
    type: 'rating' | 'text' | 'yesno' | 'choice';
    required: boolean;
    order: number;
    options?: { [key in 'bg' | 'en']: string[] }; // For choice type questions
    isStandard?: boolean; // Indicates if this is a standard question (vs custom)
    maxSelections?: number; // For choice questions: 1 = single select, >1 = multiple select
}

export interface SurveyResponse {
    id: string;
    bookingId: string;
    guestName?: string;
    guestEmail?: string;
    surveyData: { answers: { [questionId: string]: string | number | boolean } };
    surveySubmittedAt: Date;
    bookingStart: Date;
    bookingEnd: Date;
    apartmentId: string;
    responseLanguage?: string; // The language the survey was submitted in
}

export interface Testimonial {
    id: string;
    text: { [key in 'bg' | 'en']: string };
    guestType: { [key in 'bg' | 'en']: string }; // e.g., "Family with children", "Business traveler", etc.
    nationality: string; // e.g., "Germany", "France", "Bulgaria", etc.
    bookingDuration?: number; // Duration of stay in nights
    ratings?: {
        cleanliness: number; // 1-5 чистота
        communication: number; // 1-5 комуникация с домакина  
        comfort: number; // 1-5 комфорт
    };
    order: number;
    isActive: boolean;
    createdAt: Date;
}

export interface Booking {
    id: string;
    apartmentId: string;
    start: Date;
    end: Date;
    title: string; // e.g., "Reserved" or guest name for admin
    visitorName?: string; // Name of the person renting (for admin use)
    notes?: string; // Additional notes for the booking
    isRentalPeriod?: boolean; // Distinguishes rental periods from regular bookings
    type?: 'booked' | 'blocked' | 'rental' | 'maintenance'; // Type of booking/unavailability (rental and maintenance kept for backward compatibility)
    pricingOfferId?: string; // ID of selected pricing offer
    customPrice?: number; // Custom price if no pricing offer selected
    totalPrice?: number; // Calculated or custom total price
    deposit?: number; // Deposit amount in BGN
    depositCurrency?: 'EUR' | 'BGN'; // Currency the deposit was entered in
    status?: 'booked' | 'deposit_paid' | 'fully_paid'; // Payment status
    surveyToken?: string; // Unique token for guest survey access
    surveyUrl?: string; // Generated survey URL
    surveyLanguage?: 'multilingual' | 'bulgarian' | 'english'; // Language for this booking's survey
    surveyEmailSent?: boolean; // Whether survey email has been sent
    guestEmail?: string; // Guest email for survey sending
    guestPhone?: string; // Guest phone number for contact
    surveyCompleted?: boolean; // Whether the survey has been completed (flag for easy filtering)
}

export interface Apartment {
    id: string;
    name: { [key in 'bg' | 'en']?: string };
    title?: { [key in 'bg' | 'en']?: string }; // Alias for name (backward compatibility)
    description: { [key: string]: string };
    location?: { [key in 'bg' | 'en']?: string };
    address?: { [key in 'bg' | 'en']?: string };
    floor?: number;
    apartmentNumber?: string; // Internal reference number (admin only)
    domain?: string; // Subdomain for public apartment page (e.g., "my-apartment" for https://my-apartment.morence.top)
    minimumNights?: number;
    amenities: string[];
    amenityOrder?: string[];
    photos: string[];
    pricing: {
        perNight: { [key in 'bg' | 'en']?: number };
        perWeek?: number;
        perMonth?: number;
    };
    pricingOffers?: PricingOffer[];
    availabilityStart?: string;
    ownerId?: string; // ID of the user who owns/created this apartment
    availabilityEnd?: string;
    slug: string;
    isDefault?: boolean;
    heroImage?: string;
    favouriteImages?: string[];
    hideName?: boolean;
    hideNameOnPublicPage?: boolean; // Alternative property name for hiding apartment name
    smokingAllowed?: boolean;
    maxGuests?: number;
    contactPhone?: string;
    contactEmail?: string;
    contacts: {
        [key in 'bg' | 'en']?: {
            name: string;
        }
    };
    surveyQuestions?: SurveyQuestion[];
    surveyLanguageMode?: 'multilingual' | 'bulgarian' | 'english';
    socialSharing?: {
        ogImage?: string;
        ogTitle?: { bg?: string; en?: string };
        ogDescription?: { bg?: string; en?: string };
    };
}
