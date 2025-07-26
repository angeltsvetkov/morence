import React, { useState, useEffect } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Testimonial } from '../types';
import { ChevronLeft, ChevronRight, Quote, Star } from 'lucide-react';
import { getCountryByCode } from '../utils/countries';

interface TestimonialsCarouselProps {
    apartmentId: string;
}

const TestimonialsCarousel: React.FC<TestimonialsCarouselProps> = ({ apartmentId }) => {
    const { t, language } = useLanguage();
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTestimonials();
    }, [apartmentId]);

    useEffect(() => {
        if (testimonials.length > 1) {
            const interval = setInterval(() => {
                setCurrentIndex((prevIndex) => 
                    prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
                );
            }, 6000); // Auto-advance every 6 seconds

            return () => clearInterval(interval);
        }
    }, [testimonials.length]);

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

    const goToPrevious = () => {
        setCurrentIndex(currentIndex === 0 ? testimonials.length - 1 : currentIndex - 1);
    };

    const goToNext = () => {
        setCurrentIndex(currentIndex === testimonials.length - 1 ? 0 : currentIndex + 1);
    };

    const goToSlide = (index: number) => {
        setCurrentIndex(index);
    };

    if (loading) {
        return (
            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-lg">
                <div className="animate-pulse">
                    <div className="w-12 h-12 bg-gray-200 rounded-full mx-auto mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3 mx-auto"></div>
                </div>
            </div>
        );
    }

    if (testimonials.length === 0) {
        return null; // Don't render anything if no testimonials
    }

    const currentTestimonial = testimonials[currentIndex];
    
    // Provide defaults for testimonials created before ratings/nationality features
    const testimonialWithRatings = {
        ...currentTestimonial,
        nationality: currentTestimonial.nationality || '',
        ratings: currentTestimonial.ratings || {
            cleanliness: 5,
            communication: 5,
            comfort: 5
        }
    };

    return (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-lg relative overflow-hidden group">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-full -translate-y-16 translate-x-16 opacity-50"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-50 to-pink-100 rounded-full translate-y-12 -translate-x-12 opacity-50"></div>
            
            <div className="relative">
                {/* Header */}
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mb-4 shadow-lg">
                        <Quote className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('guestTestimonials')}</h3>
                    <div className="flex justify-center items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                        ))}
                    </div>
                </div>

                {/* Testimonial Content */}
                <div className="min-h-[200px] flex items-center justify-center">
                    <div className="text-center max-w-2xl mx-auto">
                        <blockquote className="text-xl sm:text-2xl font-medium text-gray-800 leading-relaxed mb-6 italic">
                            "{language === 'bg' ? testimonialWithRatings.text.bg : testimonialWithRatings.text.en}"
                        </blockquote>
                        
                        {/* Ratings */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 mb-6">
                            <div className="flex flex-col items-center">
                                <div className="text-xs font-medium text-gray-600 mb-1">
                                    {language === 'bg' ? 'Чистота' : 'Cleanliness'}
                                </div>
                                <div className="flex">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className={`w-4 h-4 ${i < testimonialWithRatings.ratings.cleanliness ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                                    ))}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">{testimonialWithRatings.ratings.cleanliness}/5</div>
                            </div>
                            
                            <div className="flex flex-col items-center">
                                <div className="text-xs font-medium text-gray-600 mb-1">
                                    {language === 'bg' ? 'Комуникация' : 'Communication'}
                                </div>
                                <div className="flex">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className={`w-4 h-4 ${i < testimonialWithRatings.ratings.communication ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                                    ))}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">{testimonialWithRatings.ratings.communication}/5</div>
                            </div>
                            
                            <div className="flex flex-col items-center">
                                <div className="text-xs font-medium text-gray-600 mb-1">
                                    {language === 'bg' ? 'Комфорт' : 'Comfort'}
                                </div>
                                <div className="flex">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className={`w-4 h-4 ${i < testimonialWithRatings.ratings.comfort ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                                    ))}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">{testimonialWithRatings.ratings.comfort}/5</div>
                            </div>
                        </div>

                        <div className="flex flex-col items-center">
                            <div className="text-lg font-semibold text-gray-900 mb-1">
                                {language === 'bg' ? testimonialWithRatings.guestType.bg : testimonialWithRatings.guestType.en}
                            </div>
                            {testimonialWithRatings.nationality && (
                                <div className="text-base text-blue-600 font-semibold mb-2 flex items-center justify-center gap-2 bg-blue-50 px-4 py-2 rounded-full border border-blue-200">
                                    {(() => {
                                        const country = getCountryByCode(testimonialWithRatings.nationality);
                                        return country ? (
                                            <>
                                                <span className="text-xl">{country.flag}</span>
                                                <span className="text-blue-700">{country.name[language as 'bg' | 'en']}</span>
                                            </>
                                        ) : (
                                            <>
                                                <span className="text-xl">🌍</span>
                                                <span className="text-blue-700">{testimonialWithRatings.nationality}</span>
                                            </>
                                        );
                                    })()}
                                </div>
                            )}
                            <div className="text-sm text-gray-600">
                                {t('verifiedGuest')}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                {testimonials.length > 1 && (
                    <>
                        {/* Navigation Arrows */}
                        <button
                            onClick={goToPrevious}
                            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-all duration-200 hover:scale-110"
                            aria-label={t('previousTestimonial')}
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                            onClick={goToNext}
                            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-all duration-200 hover:scale-110"
                            aria-label={t('nextTestimonial')}
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>

                        {/* Dots Indicator */}
                        <div className="flex justify-center mt-6 gap-2">
                            {testimonials.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => goToSlide(index)}
                                    className={`w-3 h-3 rounded-full transition-all duration-200 ${
                                        index === currentIndex
                                            ? 'bg-blue-600 scale-110'
                                            : 'bg-gray-300 hover:bg-gray-400'
                                    }`}
                                    aria-label={`${t('goToTestimonial')} ${index + 1}`}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default TestimonialsCarousel; 