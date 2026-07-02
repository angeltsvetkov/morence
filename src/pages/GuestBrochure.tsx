import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useLanguage } from '../hooks/useLanguage';
import LoadingSpinner from '../components/common/LoadingSpinner';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { Apartment } from '../types';
import { AlertTriangle, ImageOff, MapPin, Phone } from 'lucide-react';

const slugifyTitle = (title: string, idx: number) =>
    `section-${idx}-${title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')}`;

const GuestBrochure: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const { language } = useLanguage();
    const [apartment, setApartment] = useState<Apartment | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        const fetchApartment = async () => {
            if (!slug) return;
            try {
                const querySnapshot = await getDocs(collection(db, 'apartments'));
                const found = querySnapshot.docs
                    .map(d => ({ id: d.id, ...d.data() } as Apartment))
                    .find(a => a.slug === slug);
                if (found) setApartment(found);
                else setNotFound(true);
            } catch (e) {
                console.error('Error fetching apartment for brochure:', e);
                setNotFound(true);
            } finally {
                setLoading(false);
            }
        };
        fetchApartment();
    }, [slug]);

    const lang = (language as string) === 'bg' ? 'bg' : 'en';
    const images: { url: string; title?: string }[] =
        (apartment?.guestBrochure?.[lang] && apartment.guestBrochure[lang]!.length > 0)
            ? apartment.guestBrochure[lang]!
            : (lang === 'bg' ? apartment?.guestBrochure?.en : apartment?.guestBrochure?.bg) || [];

    const apartmentName = apartment?.name?.[lang] || apartment?.name?.en || apartment?.name?.bg || '';

    // Only images that have a title are shown in the table of contents
    const tocItems = images
        .map((item, idx) => ({ ...item, idx }))
        .filter(item => !!item.title);

    const scrollTo = (id: string) => {
        const el = document.getElementById(id);
        if (!el) return;
        const headerHeight = 80;
        const top = el.getBoundingClientRect().top + window.scrollY - headerHeight;
        window.scrollTo({ top, behavior: 'smooth' });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <LoadingSpinner />
            </div>
        );
    }

    if (notFound || !apartment) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 text-lg">
                        {lang === 'bg' ? 'Апартаментът не е намерен.' : 'Apartment not found.'}
                    </p>
                </div>
            </div>
        );
    }

    if (images.length === 0) {
        return (
            <div className="min-h-screen flex flex-col bg-white">
                <BrochureHeader apartmentName={apartmentName} hideName={apartment.hideName} lang={lang} />
                <div className="flex-grow flex items-center justify-center">
                    <div className="text-center text-gray-400">
                        <ImageOff className="w-12 h-12 mx-auto mb-3" />
                        <p>{lang === 'bg' ? 'Брошурата все още не е налична.' : 'Brochure not available yet.'}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <BrochureHeader apartmentName={apartmentName} hideName={apartment.hideName} lang={lang} />

            {/* TOC carousel — sticky below header, always visible */}
            {tocItems.length > 0 && (
                <div className="sticky top-[56px] z-10 bg-white border-b border-gray-100 py-3">
                    <div className="flex gap-3 overflow-x-auto scrollbar-hide px-[2.5%] snap-x snap-mandatory">
                        {tocItems.map(item => (
                            <button
                                key={item.idx}
                                type="button"
                                onClick={() => scrollTo(slugifyTitle(item.title!, item.idx))}
                                className="group flex-shrink-0 snap-start w-36 rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-left"
                            >
                                <div className="aspect-video w-full overflow-hidden bg-gray-100">
                                    <img
                                        src={item.url}
                                        alt={item.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        loading="lazy"
                                    />
                                </div>
                                <div className="px-2 py-1.5">
                                    <p className="text-xs font-semibold text-gray-800 leading-snug line-clamp-2">{item.title}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <main className="w-[95%] mx-auto py-6">
                <div className="space-y-3">
                    {images.map((item, idx) => {
                        const sectionId = item.title ? slugifyTitle(item.title, idx) : undefined;
                        return (
                            <div key={idx} id={sectionId} className="flex flex-col scroll-mt-20">
                                {item.title && (
                                    <h2 className="text-base font-semibold text-gray-800 px-4 sm:px-0 pt-4 pb-2">
                                        {item.title}
                                    </h2>
                                )}
                                <img
                                    src={item.url}
                                    alt={item.title || `${lang === 'bg' ? 'Брошура' : 'Brochure'} ${idx + 1}`}
                                    className="w-full block rounded-none sm:rounded-xl shadow-sm"
                                    loading={idx === 0 ? 'eager' : 'lazy'}
                                />
                                {item.places && item.places.length > 0 && (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 px-1 pt-3 pb-2">
                                        {item.places.map((place, pi) => (
                                            <div
                                                key={pi}
                                                className="flex flex-col items-center justify-center gap-2 px-3 py-4 rounded-2xl bg-gray-50 border border-gray-100 text-center"
                                            >
                                                <span className="text-xs font-semibold text-gray-800 leading-snug line-clamp-2">
                                                    {place.name}
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    {place.mapsUrl && (
                                                        <a
                                                            href={place.mapsUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm hover:bg-red-50 hover:border-red-300 active:scale-95 transition-all"
                                                            aria-label="Open in Google Maps"
                                                        >
                                                            <MapPin className="w-4 h-4 text-red-500" />
                                                        </a>
                                                    )}
                                                    {place.phone && (
                                                        <a
                                                            href={`tel:${place.phone}`}
                                                            className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm hover:bg-blue-50 hover:border-blue-300 active:scale-95 transition-all"
                                                            aria-label={`Call ${place.phone}`}
                                                        >
                                                            <Phone className="w-4 h-4 text-blue-500" />
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                <p className="text-center text-xs text-gray-300 pb-8 pt-6">morence.top</p>
            </main>
        </div>
    );
};

const BrochureHeader: React.FC<{ apartmentName: string; hideName?: boolean; lang: 'bg' | 'en' }> = ({
    apartmentName, hideName, lang
}) => (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="w-[95%] mx-auto py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <div className="bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 px-3 py-1.5 rounded-full flex items-center gap-1">
                    <span className="text-white text-xs font-bold tracking-wider uppercase">morence</span>
                    <span className="text-blue-100 text-xs font-light">.top</span>
                </div>
            </div>
            <LanguageSwitcher />
        </div>
    </header>
);

export default GuestBrochure;

