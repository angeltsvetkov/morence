import React, { useRef, useEffect, useState } from 'react';
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

// ─── featured place card ─────────────────────────────────────────────────────
const PlaceCard: React.FC<{ place: Place; lang: 'bg' | 'en' }> = ({ place, lang }) => {
    const status = getPlaceStatus(place.workingHours);
    const name = place.name?.[lang] || place.name?.en || place.name?.bg || '';
    const description = place.description?.[lang] || place.description?.en || place.description?.bg || '';

    const statusColor =
        status === 'open' ? 'text-green-600' :
        status === 'closing-soon' ? 'text-amber-500' :
        status === 'closed' ? 'text-red-500' :
        'text-gray-400';

    const statusLabel =
        status === 'open' ? (lang === 'bg' ? 'Отворено' : 'Open') :
        status === 'closing-soon' ? (lang === 'bg' ? 'Затваря скоро' : 'Closing soon') :
        status === 'closed' ? (lang === 'bg' ? 'Затворено' : 'Closed') :
        null;

    return (
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col">
            {/* image */}
            <div className="w-full aspect-[4/3] bg-gray-100 overflow-hidden flex-shrink-0">
                {place.image ? (
                    <img
                        src={place.image}
                        alt={name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <MapPin className="w-8 h-8 text-gray-300" />
                    </div>
                )}
            </div>

            {/* card body */}
            <div className="p-4 flex flex-col gap-2 flex-1">
                <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-bold text-gray-900 leading-snug">{name}</h3>
                    {statusLabel && (
                        <span className={`text-[11px] font-semibold shrink-0 mt-0.5 ${statusColor}`}>
                            {statusLabel}
                        </span>
                    )}
                </div>

                {description && (
                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">{description}</p>
                )}

                {(place.mapsUrl || place.phone) && (
                    <div className="flex items-center gap-3 mt-auto pt-2">
                        {place.mapsUrl && (
                            <a
                                href={place.mapsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-500 transition-colors"
                                aria-label="Open in Google Maps"
                            >
                                <span className="w-8 h-8 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center hover:bg-red-50 hover:border-red-200 transition-colors">
                                    <MapPin className="w-4 h-4 text-red-400" />
                                </span>
                            </a>
                        )}
                        {place.phone && (
                            <a
                                href={`tel:${place.phone}`}
                                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-500 transition-colors"
                                aria-label={`Call ${place.phone}`}
                            >
                                <span className="w-8 h-8 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center hover:bg-blue-50 hover:border-blue-200 transition-colors">
                                    <Phone className="w-4 h-4 text-blue-400" />
                                </span>
                                <span className="text-xs text-gray-500">{place.phone}</span>
                            </a>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

// ─── header ──────────────────────────────────────────────────────────────────
const BrochureHeader: React.FC = () => (
    <header className="bg-white sticky top-0 z-20 border-b border-gray-100">
        <div className="px-5 py-4 flex items-center justify-between">
            <div className="bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 px-3 py-1.5 rounded-full flex items-center gap-1">
                <span className="text-white text-xs font-bold tracking-wider uppercase">morence</span>
                <span className="text-blue-100 text-xs font-light">.top</span>
            </div>
            <LanguageSwitcher />
        </div>
    </header>
);

// ─── main ─────────────────────────────────────────────────────────────────────
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
            } catch {
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
        const headerHeight = 130; // header + carousel
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
        <div className="min-h-screen bg-[#f8f9fb]">
            <BrochureHeader />

            {/* ── horizontal "explore" carousel (sticky) ── */}
            <div className="sticky top-[57px] z-10 bg-[#f8f9fb] pt-5 pb-3">
                <h2 className="px-5 text-xl font-bold text-gray-900 mb-3">
                    {lang === 'bg' ? 'Разгледай наблизо' : 'Explore nearby'}
                </h2>
                <div
                    ref={carouselRef}
                    className="flex gap-3 overflow-x-auto scrollbar-hide px-5 snap-x snap-mandatory"
                >
                    {places.map((place, idx) => {
                        const name = place.name?.[lang] || place.name?.en || place.name?.bg || '';
                        return (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => scrollToPlace(idx)}
                                className="group relative flex-shrink-0 snap-start w-40 h-28 rounded-2xl overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-400 active:scale-95 transition-transform"
                            >
                                {/* background image */}
                                {place.image ? (
                                    <img
                                        src={place.image}
                                        alt={name}
                                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        loading="lazy"
                                    />
                                ) : (
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500" />
                                )}
                                {/* dark gradient overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                                {/* text */}
                                <div className="absolute bottom-0 left-0 right-0 px-3 pb-3">
                                    <p className="text-white text-xs font-bold leading-snug line-clamp-2 drop-shadow-sm">
                                        {name}
                                    </p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ── featured places grid ── */}
            <main className="px-5 pb-10">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                    {lang === 'bg' ? 'Препоръчани места' : 'Featured Places'}
                </h2>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3">
                    {places.map((place, idx) => (
                        <div key={idx} id={`place-${idx}`} className="scroll-mt-36">
                            <PlaceCard place={place} lang={lang} />
                        </div>
                    ))}
                </div>
            </main>

            <p className="text-center text-xs text-gray-300 pb-8">morence.top</p>
        </div>
    );
};

export default GuestBrochure;
