import React, { useRef, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useLanguage } from '../hooks/useLanguage';
import LoadingSpinner from '../components/common/LoadingSpinner';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { Apartment } from '../types';
import { AlertTriangle, ImageOff, MapPin, Phone } from 'lucide-react';

const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

type PlaceStatus = 'open' | 'closing-soon' | 'closed' | 'unknown';

function getPlaceStatus(
    workingHours?: { [day: string]: { open: string; close: string } | null }
): PlaceStatus {
    if (!workingHours) return 'unknown';
    const now = new Date();
    const dayKey = DAY_KEYS[now.getDay()];
    const slot = workingHours[dayKey];
    if (slot === undefined) return 'unknown';
    if (slot === null) return 'closed';
    const [oh, om] = slot.open.split(':').map(Number);
    const [ch, cm] = slot.close.split(':').map(Number);
    const nowMins = now.getHours() * 60 + now.getMinutes();
    const openMins = oh * 60 + om;
    const closeMins = ch * 60 + cm;
    if (nowMins < openMins || nowMins >= closeMins) return 'closed';
    if (closeMins - nowMins <= 60) return 'closing-soon';
    return 'open';
}

type Place = NonNullable<NonNullable<Apartment['guestBrochure']>['places']>[number];

const PlaceCard: React.FC<{ place: Place; lang: 'bg' | 'en' }> = ({ place, lang }) => {
    const status = getPlaceStatus(place.workingHours);
    const name = place.name?.[lang] || place.name?.en || place.name?.bg || '';
    const description = place.description?.[lang] || place.description?.en || place.description?.bg || '';

    const bgCls =
        status === 'open' ? 'bg-green-50 border-green-100' :
        status === 'closing-soon' ? 'bg-amber-50 border-amber-100' :
        status === 'closed' ? 'bg-red-50 border-red-100' :
        'bg-white border-gray-100';

    const statusLabel =
        status === 'open' ? (lang === 'bg' ? 'отворено' : 'open') :
        status === 'closing-soon' ? (lang === 'bg' ? 'затваря скоро' : 'closing soon') :
        status === 'closed' ? (lang === 'bg' ? 'затворено' : 'closed') :
        null;

    return (
        <div className={`rounded-2xl border overflow-hidden shadow-sm ${bgCls}`}>
            {place.image && (
                <div className="w-full aspect-video overflow-hidden bg-gray-100">
                    <img
                        src={place.image}
                        alt={name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                    />
                </div>
            )}
            {!place.image && (
                <div className="w-full h-24 bg-gray-100 flex items-center justify-center">
                    <MapPin className="w-8 h-8 text-gray-300" />
                </div>
            )}
            <div className="px-4 py-3 flex flex-col gap-1">
                <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-semibold text-gray-900 leading-snug">{name}</span>
                    {statusLabel && (
                        <span className="text-[10px] text-gray-500 shrink-0 mt-0.5">{statusLabel}</span>
                    )}
                </div>
                {description && (
                    <p className="text-xs text-gray-500 leading-relaxed">{description}</p>
                )}
                {(place.mapsUrl || place.phone) && (
                    <div className="flex items-center gap-2 mt-2">
                        {place.mapsUrl && (
                            <a
                                href={place.mapsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-11 h-11 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm hover:bg-red-50 hover:border-red-300 active:scale-95 transition-all"
                                aria-label="Open in Google Maps"
                            >
                                <MapPin className="w-5 h-5 text-red-500" />
                            </a>
                        )}
                        {place.phone && (
                            <a
                                href={`tel:${place.phone}`}
                                className="w-11 h-11 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm hover:bg-blue-50 hover:border-blue-300 active:scale-95 transition-all"
                                aria-label={`Call ${place.phone}`}
                            >
                                <Phone className="w-5 h-5 text-blue-500" />
                            </a>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

// ─── header ─────────────────────────────────────────────────────────────────
const BrochureHeader: React.FC = () => (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-20">
        <div className="w-[95%] mx-auto py-3 flex items-center justify-between">
            <div className="bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 px-3 py-1.5 rounded-full flex items-center gap-1">
                <span className="text-white text-xs font-bold tracking-wider uppercase">morence</span>
                <span className="text-blue-100 text-xs font-light">.top</span>
            </div>
            <LanguageSwitcher />
        </div>
    </header>
);

// ─── main ────────────────────────────────────────────────────────────────────
const GuestBrochure: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const { language } = useLanguage();
    const [apartment, setApartment] = useState<Apartment | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const carouselRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchApartment = async () => {
            if (!slug) return;
            try {
                const snap = await getDocs(collection(db, 'apartments'));
                const found = snap.docs
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
    const places = apartment?.guestBrochure?.places || [];

    const scrollToPlace = (idx: number) => {
        const el = document.getElementById(`place-${idx}`);
        if (!el) return;
        const top = el.getBoundingClientRect().top + window.scrollY - 110;
        window.scrollTo({ top, behavior: 'smooth' });
    };

    const scrollCarouselTo = (idx: number) => {
        if (!carouselRef.current) return;
        const btns = carouselRef.current.querySelectorAll('[data-carousel-btn]');
        const btn = btns[idx] as HTMLElement;
        if (btn) btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
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

    if (places.length === 0) {
        return (
            <div className="min-h-screen flex flex-col bg-white">
                <BrochureHeader />
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
        <div className="min-h-screen bg-gray-50">
            <BrochureHeader />

            {/* sticky TOC carousel */}
            <div className="sticky top-[56px] z-10 bg-white border-b border-gray-100 py-3 shadow-sm">
                <div
                    ref={carouselRef}
                    className="flex gap-3 overflow-x-auto scrollbar-hide px-[2.5%] snap-x snap-mandatory"
                >
                    {places.map((place, idx) => {
                        const name = place.name?.[lang] || place.name?.en || place.name?.bg || '';
                        return (
                            <button
                                key={idx}
                                data-carousel-btn
                                type="button"
                                onClick={() => { scrollToPlace(idx); scrollCarouselTo(idx); }}
                                className="group flex-shrink-0 snap-start w-28 rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-left"
                            >
                                <div className="aspect-video w-full overflow-hidden bg-gray-100">
                                    {place.image ? (
                                        <img
                                            src={place.image}
                                            alt={name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <MapPin className="w-5 h-5 text-gray-300" />
                                        </div>
                                    )}
                                </div>
                                <div className="px-2 py-1.5">
                                    <p className="text-xs font-semibold text-gray-800 leading-snug line-clamp-2">{name}</p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* places */}
            <main className="w-[95%] mx-auto py-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {places.map((place, idx) => (
                        <div key={idx} id={`place-${idx}`} className="scroll-mt-28">
                            <PlaceCard place={place} lang={lang} />
                        </div>
                    ))}
                </div>
                <p className="text-center text-xs text-gray-300 pb-8 pt-8">morence.top</p>
            </main>
        </div>
    );
};

export default GuestBrochure;
