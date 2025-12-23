import React, { useState, useEffect } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Testimonial } from '../types';
import { Quote, Star } from 'lucide-react';
import { getCountryByCode } from '../utils/countries';

interface TestimonialsCarouselProps {
    apartmentId: string;
}

const TestimonialsCarousel: React.FC<TestimonialsCarouselProps> = ({ apartmentId }) => {
    const { t, language } = useLanguage();
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTestimonials();
    }, [apartmentId]);

    const fetchTestimonials = async () => {
        if (!apartmentId) return;
        
        setLoading(true);
        try {
            const testimonialsRef = collection(db, `apartments/${apartmentId}/testimonials`);
            const q = query(
                testimonialsRef, 
                where('isActive', '==', true),
                orderBy('order', 'asc')
            );
            const querySnapshot = await getDocs(q);
            
            const testimonialsData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate() || new Date()
            })) as Testimonial[];
            
            setTestimonials(testimonialsData);
        } catch (error) {
            console.error('Error fetching testimonials:', error);
        } finally {
            setLoading(false);
        }
    };

    // Create a single testimonial card component
    const TestimonialCard: React.FC<{ testimonial: Testimonial }> = ({ testimonial }) => {
        // Provide defaults for testimonials created before ratings/nationality/bookingDuration features
        const testimonialWithRatings = {
            ...testimonial,
            nationality: testimonial.nationality || '',
            bookingDuration: testimonial.bookingDuration || 0,
            ratings: testimonial.ratings || {
                cleanliness: 5,
                communication: 5,
                comfort: 5
            }
        };

        return (
            <div 
                className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg relative overflow-hidden group hover:shadow-xl transition-shadow duration-300 flex flex-col w-full"
            >
                {/* Booking Duration Ribbon */}
                {testimonialWithRatings.bookingDuration && testimonialWithRatings.bookingDuration > 0 && (
                    <div className="absolute top-0 right-0 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-3 py-1 rounded-bl-lg shadow-lg z-10">
                        <div className="flex items-center gap-1 text-xs font-semibold">
                            <span>
                                {testimonialWithRatings.bookingDuration}{testimonialWithRatings.bookingDuration === 1 
                                    ? (language === 'bg' ? ' нощувка' : ' night')
                                    : (language === 'bg' ? ' нощувки' : ' nights')
                                }
                            </span>
                        </div>
                    </div>
                )}
                
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-full -translate-y-12 translate-x-12 opacity-50"></div>
                <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-purple-50 to-pink-100 rounded-full translate-y-10 -translate-x-10 opacity-50"></div>
                
                <div className="relative flex flex-col">
                    {/* Header with Stars and Guest Info - Fixed Height */}
                    <div className="text-center mb-4">
                        <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mb-3 shadow-lg">
                            <Quote className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex justify-center items-center gap-1 mb-3">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className="w-3 h-3 text-yellow-400 fill-current" />
                            ))}
                        </div>
                        
                        {/* Guest Information - Fixed Height Section */}
                        <div className="flex flex-col items-center justify-center">
                            <div className="text-sm font-semibold text-gray-900 mb-1 w-full px-2 break-words">
                                {language === 'bg' ? testimonialWithRatings.guestType.bg : testimonialWithRatings.guestType.en}
                            </div>
                            {testimonialWithRatings.nationality ? (
                                <div className="text-xs text-blue-600 font-semibold flex items-center justify-center gap-1 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                                    {(() => {
                                        const country = getCountryByCode(testimonialWithRatings.nationality);
                                        return country ? (
                                            <>
                                                <span className="text-sm">{country.flag}</span>
                                                <span className="text-blue-700 break-words">{country.name[language as 'bg' | 'en']}</span>
                                            </>
                                        ) : (
                                            <>
                                                <span className="text-sm">🌍</span>
                                                <span className="text-blue-700 break-words">{testimonialWithRatings.nationality}</span>
                                            </>
                                        );
                                    })()}
                                </div>
                            ) : (
                                <div className="text-xs text-gray-600">
                                    {t('verifiedGuest')}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Testimonial Content - Flexible Height */}
                    <div className="text-center flex-grow flex items-start mb-4">
                        <blockquote className="text-sm font-light text-gray-700 leading-relaxed italic tracking-wide w-full">
                            "{language === 'bg' ? testimonialWithRatings.text.bg : testimonialWithRatings.text.en}"
                        </blockquote>
                    </div>
                    
                    {/* Ratings - Fixed at Bottom */}
                    <div className="flex items-center justify-center gap-3 mt-auto pt-3">
                        <div className="flex flex-col items-center">
                            <div className="text-xs font-medium text-gray-600 mb-1">
                                {language === 'bg' ? 'Чистота' : 'Cleanliness'}
                            </div>
                            <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className={`w-2 h-2 ${i < testimonialWithRatings.ratings.cleanliness ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                                ))}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">{testimonialWithRatings.ratings.cleanliness}/5</div>
                        </div>
                        
                        <div className="flex flex-col items-center">
                            <div className="text-xs font-medium text-gray-600 mb-1">
                                {language === 'bg' ? 'Комуникация' : 'Communication'}
                            </div>
                            <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className={`w-2 h-2 ${i < testimonialWithRatings.ratings.communication ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                                ))}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">{testimonialWithRatings.ratings.communication}/5</div>
                        </div>
                        
                        <div className="flex flex-col items-center">
                            <div className="text-xs font-medium text-gray-600 mb-1">
                                {language === 'bg' ? 'Комфорт' : 'Comfort'}
                            </div>
                            <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className={`w-2 h-2 ${i < testimonialWithRatings.ratings.comfort ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                                ))}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">{testimonialWithRatings.ratings.comfort}/5</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="overflow-hidden">
                <div className="flex gap-6">
                    {[...Array(3)].map((_, index) => (
                        <div key={index} className="bg-white rounded-2xl p-8 border border-gray-200 shadow-lg flex-shrink-0 w-full md:w-96">
                            <div className="animate-pulse">
                                <div className="w-12 h-12 bg-gray-200 rounded-full mx-auto mb-4"></div>
                                <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-4"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/3 mx-auto"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (testimonials.length === 0) {
        return null; // Don't render anything if no testimonials
    }

    return (
        <div className="space-y-8">
            {/* Section Header */}
            <div className="text-center">
                <h3 className="text-3xl font-bold text-gray-900 mb-4">{t('guestTestimonials')}</h3>
                <div className="flex justify-center items-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
                    ))}
                </div>
                <p className="text-gray-600">{t('verifiedGuest')}</p>
            </div>
            
            {/* Testimonials Carousel - full width track, fixed-size cards */}
            <div className="w-full">
                <div className="px-4 sm:px-6 lg:px-8 py-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 items-stretch">
                        {testimonials.map((testimonial) => (
                            <div
                                key={testimonial.id}
                                className="w-full"
                            >
                                <TestimonialCard testimonial={testimonial} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TestimonialsCarousel; 