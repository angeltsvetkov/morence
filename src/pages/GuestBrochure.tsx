import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useLanguage } from '../hooks/useLanguage';
import BrochureLoader from '../components/common/BrochureLoader';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { Apartment, TimetableEntry, TimetableDay } from '../types';
import { AlertTriangle, ImageOff, MapPin, ChevronDown, ChevronUp, Clock,
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

const ALL_DAYS_ORDERED: TimetableDay[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const DAY_LABEL: Record<TimetableDay, { bg: string; en: string }> = {
    mon: { bg: 'Понеделник', en: 'Monday' },
    tue: { bg: 'Вторник',    en: 'Tuesday' },
    wed: { bg: 'Сряда',      en: 'Wednesday' },
    thu: { bg: 'Четвъртък',  en: 'Thursday' },
    fri: { bg: 'Петък',      en: 'Friday' },
    sat: { bg: 'Събота',     en: 'Saturday' },
    sun: { bg: 'Неделя',     en: 'Sunday' },
};
const DAY_SHORT: Record<TimetableDay, { bg: string; en: string }> = {
    mon: { bg: 'Пон', en: 'Mon' }, tue: { bg: 'Вт', en: 'Tue' }, wed: { bg: 'Ср', en: 'Wed' },
    thu: { bg: 'Чет', en: 'Thu' }, fri: { bg: 'Пет', en: 'Fri' }, sat: { bg: 'Съб', en: 'Sat' },
    sun: { bg: 'Нед', en: 'Sun' },
};

function todayKey(): TimetableDay {
    const map: TimetableDay[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    return map[new Date().getDay()];
}

function timeToMinutes(t: string) {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
}

function currentMinutes() {
    const n = new Date();
    return n.getHours() * 60 + n.getMinutes();
}

interface TimetableSectionProps {
    entries: TimetableEntry[];
    lang: 'bg' | 'en';
    places?: { id: string; name: { bg: string; en: string }; mapsUrl?: string }[];
}

const TimetableSection: React.FC<TimetableSectionProps> = ({ entries, lang, places = [] }) => {
    const [expanded, setExpanded] = useState(false);
    const [activeDay, setActiveDay] = useState<TimetableDay>(todayKey);

    const today = todayKey();
    const now = currentMinutes();

    const todayEntries = entries
        .filter(e => e.days.includes(today))
        .sort((a, b) => a.startTime.localeCompare(b.startTime));

    const activeEntry = todayEntries.find(e =>
        timeToMinutes(e.startTime) <= now && now < timeToMinutes(e.endTime)
    );
    const nextEntry = todayEntries.find(e => timeToMinutes(e.startTime) > now);

    const daysWithEntries = ALL_DAYS_ORDERED.filter(d => entries.some(e => e.days.includes(d)));
    const selectedDayEntries = entries
        .filter(e => e.days.includes(activeDay))
        .sort((a, b) => a.startTime.localeCompare(b.startTime));

    if (entries.length === 0) return null;

    return (
        <section className="px-4 pb-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Header */}
                <div className="px-4 pt-4 pb-3 border-b border-gray-50 flex items-center gap-2">
                    <Clock size={16} className="text-blue-500" />
                    <h2 className="text-sm font-bold text-gray-800">
                        {lang === 'bg' ? 'Програма' : 'Program'}
                    </h2>
                </div>

                <div className="p-4 space-y-3">
                    {/* NOW */}
                    {activeEntry && (
                        <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl px-4 py-3 text-white">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-green-100 mb-0.5">
                                {lang === 'bg' ? '● Сега' : '● Now'}
                            </p>
                            <p className="text-base font-bold leading-tight">
                                {activeEntry.title[lang] || activeEntry.title.bg || activeEntry.title.en}
                            </p>
                            {(activeEntry.location?.bg || activeEntry.location?.en) && (
                                <p className="text-xs text-green-100 mt-0.5">
                                    {activeEntry.location[lang] || activeEntry.location.bg || activeEntry.location.en}
                                </p>
                            )}
                            <p className="text-xs text-green-100 mt-1 font-mono">
                                {activeEntry.startTime} – {activeEntry.endTime}
                            </p>
                            {activeEntry.placeIds && activeEntry.placeIds.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1.5">
                                    {activeEntry.placeIds.map(pid => {
                                        const p = places.find(pl => pl.id === pid);
                                        if (!p) return null;
                                        return p.mapsUrl ? (
                                            <a key={pid} href={p.mapsUrl} target="_blank" rel="noopener noreferrer"
                                                className="inline-flex items-center gap-0.5 text-xs bg-green-900/40 text-green-100 px-2 py-0.5 rounded-full hover:bg-green-900/60">
                                                📍 {p.name[lang] || p.name.bg || p.name.en}
                                            </a>
                                        ) : (
                                            <span key={pid} className="inline-flex items-center gap-0.5 text-xs bg-green-900/40 text-green-100 px-2 py-0.5 rounded-full">
                                                📍 {p.name[lang] || p.name.bg || p.name.en}
                                            </span>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* NEXT */}
                    {nextEntry && (
                        <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400 mb-0.5">
                                {lang === 'bg' ? 'Следващо' : 'Next'}
                            </p>
                            <p className="text-sm font-semibold text-gray-800 leading-tight">
                                {nextEntry.title[lang] || nextEntry.title.bg || nextEntry.title.en}
                            </p>
                            {(nextEntry.location?.bg || nextEntry.location?.en) && (
                                <p className="text-xs text-gray-400 mt-0.5">
                                    {nextEntry.location[lang] || nextEntry.location.bg || nextEntry.location.en}
                                </p>
                            )}
                            <p className="text-xs text-blue-500 mt-1 font-mono font-semibold">
                                {nextEntry.startTime} – {nextEntry.endTime}
                            </p>
                            {nextEntry.placeIds && nextEntry.placeIds.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1.5">
                                    {nextEntry.placeIds.map(pid => {
                                        const p = places.find(pl => pl.id === pid);
                                        if (!p) return null;
                                        return p.mapsUrl ? (
                                            <a key={pid} href={p.mapsUrl} target="_blank" rel="noopener noreferrer"
                                                className="inline-flex items-center gap-0.5 text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full hover:bg-blue-200">
                                                📍 {p.name[lang] || p.name.bg || p.name.en}
                                            </a>
                                        ) : (
                                            <span key={pid} className="inline-flex items-center gap-0.5 text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                                                📍 {p.name[lang] || p.name.bg || p.name.en}
                                            </span>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {!activeEntry && !nextEntry && (
                        <p className="text-sm text-gray-400 text-center py-2">
                            {lang === 'bg' ? 'Няма активности за днес' : 'No activities scheduled for today'}
                        </p>
                    )}

                    {/* Full program toggle */}
                    <button
                        onClick={() => setExpanded(v => !v)}
                        className="w-full flex items-center justify-center gap-1.5 text-xs text-blue-500 font-semibold py-1.5 hover:text-blue-700"
                    >
                        {expanded
                            ? (lang === 'bg' ? 'Скрий програмата' : 'Hide program')
                            : (lang === 'bg' ? 'Виж цялата програма' : 'View full program')
                        }
                        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                </div>

                {/* Full program */}
                {expanded && (
                    <div className="border-t border-gray-100">
                        {/* Day tabs */}
                        <div className="flex overflow-x-auto scrollbar-hide px-4 pt-3 pb-1 gap-1.5">
                            {daysWithEntries.map(day => (
                                <button
                                    key={day}
                                    onClick={() => setActiveDay(day)}
                                    className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                                        activeDay === day
                                            ? 'bg-blue-600 text-white'
                                            : day === today
                                                ? 'bg-blue-50 text-blue-600 border border-blue-200'
                                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                    }`}
                                >
                                    {DAY_SHORT[day][lang]}
                                    {day === today && activeDay !== day && (
                                        <span className="ml-1 inline-block w-1 h-1 rounded-full bg-blue-400" />
                                    )}
                                </button>
                            ))}
                        </div>

                        <div className="px-4 pb-4 pt-2 space-y-1.5">
                            {selectedDayEntries.map(entry => {
                                const isActive = entry.days.includes(today)
                                    && timeToMinutes(entry.startTime) <= now
                                    && now < timeToMinutes(entry.endTime);
                                return (
                                    <div
                                        key={entry.id}
                                        className={`flex gap-3 items-start rounded-xl px-3 py-2.5 ${
                                            isActive
                                                ? 'bg-green-50 border border-green-200'
                                                : 'bg-gray-50'
                                        }`}
                                    >
                                        <span className={`text-xs font-mono flex-shrink-0 pt-0.5 ${isActive ? 'text-green-600 font-bold' : 'text-gray-400'}`}>
                                            {entry.startTime}<br />{entry.endTime}
                                        </span>
                                        <div>
                                            <p className={`text-sm font-semibold leading-tight ${isActive ? 'text-green-800' : 'text-gray-800'}`}>
                                                {entry.title[lang] || entry.title.bg || entry.title.en}
                                                {isActive && <span className="ml-2 text-[10px] text-green-500 font-bold">● СЕГА</span>}
                                            </p>
                                            {(entry.location?.bg || entry.location?.en) && (
                                                <p className="text-xs text-gray-400 mt-0.5">
                                                    {entry.location[lang] || entry.location.bg || entry.location.en}
                                                </p>
                                            )}
                                            {entry.placeIds && entry.placeIds.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-0.5">
                                                    {entry.placeIds.map(pid => {
                                                        const p = places.find(pl => pl.id === pid);
                                                        if (!p) return null;
                                                        return p.mapsUrl ? (
                                                            <a key={pid} href={p.mapsUrl} target="_blank" rel="noopener noreferrer"
                                                                className="inline-flex items-center gap-0.5 text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full hover:bg-gray-200">
                                                                📍 {p.name[lang] || p.name.bg || p.name.en}
                                                            </a>
                                                        ) : (
                                                            <span key={pid} className="inline-flex items-center gap-0.5 text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">
                                                                📍 {p.name[lang] || p.name.bg || p.name.en}
                                                            </span>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

const GuestBrochure: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const { language } = useLanguage();
    const [apartment, setApartment] = useState<Apartment | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [activeGroup, setActiveGroup] = useState<string | null>(null); // null = All
    const [scrollSpyGroup, setScrollSpyGroup] = useState<string | null>(null);
    const carouselRef = useRef<HTMLDivElement>(null);

    // Scroll to top on mount and when category filter changes
    useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior }); }, []);
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
        setScrollSpyGroup(null);
    }, [activeGroup]);

    // Scroll-spy: highlight the carousel chip of the section currently in view
    useEffect(() => {
        if (activeGroup !== null) return; // only when showing all groups
        const sectionEls = document.querySelectorAll<HTMLElement>('[data-spy-id]');
        if (sectionEls.length === 0) return;

        // get sticky header height to offset rootMargin
        const headerEl = document.querySelector('header');
        const headerH = headerEl ? headerEl.getBoundingClientRect().height : 80;

        const observer = new IntersectionObserver(
            entries => {
                // Pick the topmost intersecting entry
                const visible = entries
                    .filter(e => e.isIntersecting)
                    .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
                if (visible.length > 0) {
                    const id = (visible[0].target as HTMLElement).dataset.spyId ?? null;
                    setScrollSpyGroup(id);
                }
            },
            {
                rootMargin: `-${headerH + 8}px 0px -40% 0px`,
                threshold: 0,
            }
        );

        sectionEls.forEach(el => observer.observe(el));
        return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeGroup, apartment?.guestBrochure?.groups?.length, apartment?.guestBrochure?.places?.length]);

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
                scrollSpyGroup={scrollSpyGroup}
                onGroupSelect={setActiveGroup}
                carouselRef={carouselRef}
            />

            <main className="px-4 pt-4 pb-10 space-y-7">
                {sections.map((section, si) => (
                    <div key={section.groupId ?? `ungrouped-${si}`} data-spy-id={section.groupId ?? undefined}>
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

            {apartment.timetable?.entries && apartment.timetable.entries.length > 0 && (
                <TimetableSection entries={apartment.timetable.entries} lang={lang} places={places.map(p => ({ id: p.id, name: p.name, mapsUrl: p.mapsUrl }))} />
            )}

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
    scrollSpyGroup?: string | null;
    onGroupSelect: (id: string | null) => void;
    carouselRef: React.RefObject<HTMLDivElement>;
}

const StickyHeader: React.FC<StickyHeaderProps> = ({
    lang, groups, hasGroups, hasUngrouped, ungroupedCount, totalCount,
    activeGroup, scrollSpyGroup, onGroupSelect, carouselRef
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

    // Scroll active/spy chip into view when selection or scroll-spy changes
    React.useEffect(() => {
        const el = carouselRef.current;
        if (!el) return;
        const target = activeGroup ?? scrollSpyGroup;
        if (!target) return;
        const btn = el.querySelector(`[data-group-id="${target}"]`) as HTMLElement | null;
        if (btn) {
            btn.scrollIntoView({ inline: 'nearest', block: 'nearest', behavior: 'smooth' });
        }
    }, [activeGroup, scrollSpyGroup, carouselRef]);

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
                            const isSpy = activeGroup === null && scrollSpyGroup === s.groupId;
                            return (
                                <button
                                    key={s.groupId}
                                   data-group-id={s.groupId}
                                   onClick={() => onGroupSelect(activeGroup === s.groupId ? null : s.groupId)}
                                    className={`flex-shrink-0 flex items-center gap-1.5 pl-1 pr-3 py-1 rounded-full text-xs font-semibold transition-all active:scale-95 ${
                                        isActive
                                            ? 'bg-blue-600 text-white shadow-md'
                                            : isSpy
                                                ? 'bg-blue-100 text-blue-700 ring-1 ring-blue-300'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    <span className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isActive ? 'bg-blue-500' : isSpy ? 'bg-blue-200' : 'bg-gray-200'}`}>
                                            <GroupIcon name={s.groupIcon} size={16} className={isActive ? 'text-white' : isSpy ? 'text-blue-600' : 'text-gray-500'} />
                                        </span>
                                    {s.groupName}
                                    <span className={`text-[10px] ${isActive ? 'text-blue-200' : isSpy ? 'text-blue-400' : 'text-gray-400'}`}>
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
