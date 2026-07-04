import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useLanguage } from '../hooks/useLanguage';
import BrochureLoader from '../components/common/BrochureLoader';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { Apartment } from '../types';
import { AlertTriangle, ImageOff, MapPin,
    Utensils, Coffee, Beer, ShoppingBag, ShoppingCart, Landmark, TreePine, Mountain, Waves, Umbrella, Dumbbell, Bike,
    Car, Bus, Plane, Music, Star, Heart, Camera, Building2, Sun, Moon, Ticket, BookOpen, Leaf, Fish, Baby, Palette, Flame
} from 'lucide-react';

const GROUP_ICON_MAP: Record<string, React.FC<{ size?: number; className?: string }>> = {
    Utensils, Coffee, Beer, Fish, ShoppingBag, ShoppingCart, Landmark, Building2, BookOpen, Palette,
    TreePine, Mountain, Waves, Umbrella, Leaf, Sun, Dumbbell, Bike, Car, Bus, Plane,
    Music, Moon, Ticket, Camera, Star, Heart, Flame, Baby, MapPin,
};

function GroupIcon({ name, size = 14, className }: { name?: string; size?: number; className?: string }) {
    const Comp = name ? GROUP_ICON_MAP[name] : null;
    return Comp ? <Comp size={size} className={className} /> : <MapPin size={size} className={className} />;
}

const GuestBrochure: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const { language } = useLanguage();
    const [apartment, setApartment] = useState<Apartment | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [activeGroup, setActiveGroup] = useState<string | null>(null); // null = All
    const carouselRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!slug) return;
        getDocs(collection(db, 'apartments')).then(snap => {
            const found = snap.docs
                .map(d => ({ id: d.id, ...d.data() } as Apartment))
                .find(a => a.slug === slug);
            if (found) setApartment(found);
            else setNotFound(true);
            setLoading(false);
        }).catch(() => { setNotFound(true); setLoading(false); });
    }, [slug]);

    const lang = (language as string) === 'bg' ? 'bg' : 'en';
    const places = apartment?.guestBrochure?.places || [];
    const groups = apartment?.guestBrochure?.groups || [];

    // Build ordered sections: grouped places under a header, then ungrouped places
    type Section = { groupId: string | null; groupName: string | null; groupIcon?: string; places: typeof places };
    const allSections: Section[] = [];
    const appearedInGroup = new Set<string>();

    groups.forEach(g => {
        const groupPlaces = places.filter(p => (p.groupIds || []).includes(g.id));
        if (groupPlaces.length > 0) {
            allSections.push({ groupId: g.id, groupName: g.name[lang] || g.name.en || g.name.bg || '', groupIcon: g.icon, places: groupPlaces });
            groupPlaces.forEach(p => appearedInGroup.add(p.id));
        }
    });

    const ungrouped = places.filter(p => !appearedInGroup.has(p.id));
    if (ungrouped.length > 0) {
        allSections.push({ groupId: null, groupName: null, places: ungrouped });
    }

    // Filter sections based on activeGroup
    const sections = activeGroup === null
        ? allSections
        : allSections.filter(s => s.groupId === activeGroup || (activeGroup === '__ungrouped__' && s.groupId === null));

    const hasGroups = groups.length > 0;
    const hasUngrouped = ungrouped.length > 0;

    if (loading) return <BrochureLoader />;

    if (notFound || !apartment) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">{lang === 'bg' ? 'Апартаментът не е намерен.' : 'Apartment not found.'}</p>
                </div>
            </div>
        );
    }

    if (places.length === 0) {
        return (
            <div className="min-h-screen flex flex-col bg-white">
                <StickyHeader
                    lang={lang} groups={[]} hasGroups={false} hasUngrouped={false}
                    ungroupedCount={0} totalCount={0} activeGroup={null}
                    onGroupSelect={() => {}} carouselRef={carouselRef}
                />
                <div className="flex-grow flex items-center justify-center text-gray-400">
                    <div className="text-center">
                        <ImageOff className="w-12 h-12 mx-auto mb-3" />
                        <p>{lang === 'bg' ? 'Брошурата все още не е налична.' : 'Brochure not available yet.'}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8f9fb]">
            <StickyHeader
                lang={lang}
                groups={allSections.filter(s => s.groupId !== null)}
                hasGroups={hasGroups}
                hasUngrouped={hasUngrouped}
                ungroupedCount={ungrouped.length}
                totalCount={places.length}
                activeGroup={activeGroup}
                onGroupSelect={setActiveGroup}
                carouselRef={carouselRef}
            />

            <main className="px-4 pt-4 pb-10 space-y-7">
                {sections.map((section, si) => (
                    <div key={section.groupId ?? `ungrouped-${si}`}>
                        {section.groupName && activeGroup === null && (
                            <h2 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
                                <span className="w-1 h-4 rounded-full bg-blue-500 inline-block" />
                                {section.groupName}
                            </h2>
                        )}
                        {!section.groupName && sections.length > 1 && activeGroup === null && (
                            <h2 className="text-base font-bold text-gray-800 mb-3">
                                {lang === 'bg' ? 'Разгледай наблизо' : 'Explore nearby'}
                            </h2>
                        )}
                        {!section.groupName && sections.length === 1 && activeGroup === null && (
                            <h2 className="text-xl font-bold text-gray-900 mb-4">
                                {lang === 'bg' ? 'Разгледай наблизо' : 'Explore nearby'}
                            </h2>
                        )}

                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                            {section.places.map((place, idx) => {
                                const name = place.name?.[lang] || place.name?.en || place.name?.bg || '';
                                return (
                                    <button
                                        key={place.id || idx}
                                        type="button"
                                        onClick={() => navigate(`/apartments/${slug}/brochure/${place.id || idx}`)}
                                        className="group relative w-full aspect-[4/3] rounded-2xl overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-400 active:scale-95 transition-transform shadow-sm"
                                    >
                                        {place.image ? (
                                            <img
                                                src={place.image}
                                                alt={name}
                                                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                loading="lazy"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                                                <MapPin className="w-8 h-8 text-white/60" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                        <div className="absolute bottom-0 left-0 right-0 px-3 pb-3">
                                            <p className="text-white text-xl font-bold leading-snug line-clamp-2 text-left" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>
                                                {name}
                                            </p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </main>

            <p className="text-center text-xs text-gray-300 pb-8">morence.top</p>
        </div>
    );
};

interface StickyHeaderProps {
    lang: 'bg' | 'en';
    groups: { groupId: string | null; groupName: string | null; groupIcon?: string; places: any[] }[];
    hasGroups: boolean;
    hasUngrouped: boolean;
    ungroupedCount: number;
    totalCount: number;
    activeGroup: string | null;
    onGroupSelect: (id: string | null) => void;
    carouselRef: React.RefObject<HTMLDivElement>;
}

const StickyHeader: React.FC<StickyHeaderProps> = ({
    lang, groups, hasGroups, hasUngrouped, ungroupedCount, totalCount,
    activeGroup, onGroupSelect, carouselRef
}) => {
    const [canScrollLeft, setCanScrollLeft] = React.useState(false);
    const [canScrollRight, setCanScrollRight] = React.useState(false);

    const updateFades = React.useCallback(() => {
        const el = carouselRef.current;
        if (!el) return;
        setCanScrollLeft(el.scrollLeft > 4);
        setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    }, [carouselRef]);

    React.useEffect(() => {
        const el = carouselRef.current;
        if (!el) return;
        updateFades();
        el.addEventListener('scroll', updateFades, { passive: true });
        const ro = new ResizeObserver(updateFades);
        ro.observe(el);
        return () => { el.removeEventListener('scroll', updateFades); ro.disconnect(); };
    }, [carouselRef, updateFades]);

    return (
        <header className="bg-white/95 backdrop-blur-sm sticky top-0 z-20 border-b border-gray-100 shadow-sm">
            {/* Row 1: logo + language switcher */}
            <div className="flex items-center justify-between px-4 pt-3 pb-2">
                {/* Logo = select all */}
                <button
                    onClick={() => onGroupSelect(null)}
                    className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full transition-all active:scale-95 bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 shadow-md shadow-blue-200"
                >
                    <span className="text-white text-xs font-bold tracking-wider uppercase">morence</span>
                    <span className="text-blue-100 text-xs font-light">.top</span>
                    {totalCount > 0 && (
                        <span className="ml-1 bg-white/20 text-white text-[10px] font-semibold rounded-full px-1.5 py-0.5 leading-none">
                            {totalCount}
                        </span>
                    )}
                </button>

                <LanguageSwitcher />
            </div>

            {/* Row 2 (mobile): category chips on their own row */}
            {hasGroups && (
                <div className="relative pb-2">
                    {/* left fade */}
                    <div className={`pointer-events-none absolute left-0 top-0 bottom-0 w-8 z-10 transition-opacity duration-200 ${canScrollLeft ? 'opacity-100' : 'opacity-0'}`}
                        style={{ background: 'linear-gradient(to right, rgba(255,255,255,0.95) 0%, transparent 100%)' }}
                    />
                    {/* right fade */}
                    <div className={`pointer-events-none absolute right-0 top-0 bottom-0 w-8 z-10 transition-opacity duration-200 ${canScrollRight ? 'opacity-100' : 'opacity-0'}`}
                        style={{ background: 'linear-gradient(to left, rgba(255,255,255,0.95) 0%, transparent 100%)' }}
                    />
                    <div
                        ref={carouselRef}
                        className="flex gap-2 overflow-x-auto scrollbar-hide px-4"
                        style={{ WebkitOverflowScrolling: 'touch' }}
                    >
                        {groups.map(s => {
                            const isActive = activeGroup === s.groupId;
                            return (
                                <button
                                    key={s.groupId}
                                    onClick={() => onGroupSelect(activeGroup === s.groupId ? null : s.groupId)}
                                    className={`flex-shrink-0 flex items-center gap-1.5 pl-1 pr-3 py-1 rounded-full text-xs font-semibold transition-all active:scale-95 ${
                                        isActive
                                            ? 'bg-blue-600 text-white shadow-md'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    <span className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isActive ? 'bg-blue-500' : 'bg-gray-200'}`}>
                                            <GroupIcon name={s.groupIcon} size={16} className={isActive ? 'text-white' : 'text-gray-500'} />
                                        </span>
                                    {s.groupName}
                                    <span className={`text-[10px] ${isActive ? 'text-blue-200' : 'text-gray-400'}`}>
                                        {s.places.length}
                                    </span>
                                </button>
                            );
                        })}

                        {hasUngrouped && (
                            <button
                                onClick={() => onGroupSelect('__ungrouped__')}
                                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all active:scale-95 ${
                                    activeGroup === '__ungrouped__'
                                        ? 'bg-blue-600 text-white shadow-md'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                {lang === 'bg' ? 'Други' : 'Other'}
                                <span className={`text-[10px] ${activeGroup === '__ungrouped__' ? 'text-blue-200' : 'text-gray-400'}`}>
                                    {ungroupedCount}
                                </span>
                            </button>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
};

export default GuestBrochure;
