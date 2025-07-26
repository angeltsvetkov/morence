import { useEffect } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { generateSurveyToken, generateSurveyUrl } from '../lib/surveyUtils';
import { Booking } from '../types';

/**
 * Hook to automatically generate survey links for bookings that don't have them
 */
export const useSurveyLinkGeneration = (bookings: Booking[], apartmentId: string, setBookings: React.Dispatch<React.SetStateAction<Booking[]>>) => {
    useEffect(() => {
        const generateMissingSurveyLinks = async () => {
            if (!apartmentId || bookings.length === 0) return;
            
            console.log('Checking for bookings without survey links...');
            
            const bookingsToUpdate: Booking[] = [];
            
            // Find bookings that need survey links
            for (const booking of bookings) {
                if (booking.type === 'booked' && !booking.surveyUrl && !booking.surveyToken) {
                    bookingsToUpdate.push(booking);
                }
            }
            
            if (bookingsToUpdate.length === 0) {
                console.log('All bookings already have survey links');
                return;
            }
            
            console.log(`Generating survey links for ${bookingsToUpdate.length} bookings...`);
            
            try {
                // Generate survey links for bookings without them
                const updatedBookings = [...bookings];
                
                for (const booking of bookingsToUpdate) {
                    const surveyToken = generateSurveyToken();
                    const surveyUrl = generateSurveyUrl(booking.id, surveyToken, undefined, booking.surveyLanguage);
                    
                    // Update in Firebase
                    await updateDoc(doc(db, `apartments/${apartmentId}/bookings`, booking.id), {
                        surveyToken: surveyToken,
                        surveyUrl: surveyUrl
                    });
                    
                    // Update local state
                    const bookingIndex = updatedBookings.findIndex(b => b.id === booking.id);
                    if (bookingIndex !== -1) {
                        updatedBookings[bookingIndex] = {
                            ...updatedBookings[bookingIndex],
                            surveyToken,
                            surveyUrl
                        };
                    }
                    
                    console.log(`✅ Generated survey link for booking ${booking.id}`);
                }
                
                // Update the bookings state
                setBookings(updatedBookings);
                
                console.log(`✅ Successfully generated ${bookingsToUpdate.length} survey links`);
                
            } catch (error) {
                console.error('❌ Error generating survey links:', error);
            }
        };
        
        // Small delay to ensure bookings are loaded
        const timeoutId = setTimeout(generateMissingSurveyLinks, 1000);
        
        return () => clearTimeout(timeoutId);
    }, [bookings, apartmentId, setBookings]);
}; 