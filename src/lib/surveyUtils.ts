// Utility functions for survey management

/**
 * Generates a unique survey token for a booking
 */
export function generateSurveyToken(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15) + 
           Date.now().toString(36);
}

/**
 * Generates a personalized survey URL for a booking
 */
export function generateSurveyUrl(bookingId: string, token: string, baseUrl?: string, language?: string): string {
    const base = baseUrl || (typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.com');
    const params = new URLSearchParams();
    params.set('token', token);
    
    // Add language parameter if specified
    if (language) {
        // Convert surveyLanguage values to simple lang codes
        const langCode = language === 'bulgarian' ? 'bg' : 
                        language === 'english' ? 'en' : 
                        language === 'multilingual' ? undefined : // Don't set lang for multilingual
                        language; // Use as-is if already 'bg' or 'en'
        
        if (langCode) {
            params.set('lang', langCode);
        }
    }
    
    const url = `${base}/survey/${bookingId}?${params.toString()}`;
    console.log(`Generated survey URL: ${url} (baseUrl: ${base}, language: ${language})`);
    return url;
} 