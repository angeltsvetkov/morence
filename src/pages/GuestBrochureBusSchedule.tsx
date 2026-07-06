import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useLanguage } from '../hooks/useLanguage';
import BrochureLoader from '../components/common/BrochureLoader';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { Apartment, TimetableDay } from '../types';
import { AlertTriangle, ArrowLeft, Clock, MapPin, Bus } from 'lucide-react';

const ALL_DAYS: TimetableDay[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
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

const GuestBrochureBusSchedule: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const { language } = useLanguage();
    const [apartment, setApartment] = useState<Apartment | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeDay, setActiveDay] = useState<TimetableDay>(todayKey());

    useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior }); }, []);

    useEffect(() => {
        if (!slug) return;
        getDocs(collection(db, 'apartments')).then(snap => {
            const found = snap.docs
                .map(d => ({ id: d.id, ...d.data() } as Apartment))
                .find(a => a.slug === slug);
            setApartment(found || null);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, [slug]);

    const lang = (language as string) === 'bg' ? 'bg' : 'en';
    const busTracker = apartment?.busTracker;
    const stops = busTracker?.stops || [];
    const trips = busTracker?.trips || [];
    const myStopIndex = busTracker?.myStopIndex ?? -1;

    const daysWithTrips = ALL_DAYS.filter(d => trips.some(t => t.days.includes(d)));
    const today = todayKey();
    const now = currentMinutes();

    const dayTrips = trips
        .filter(t => t.days.includes(activeDay))
        .sort((a, b) => timeToMinutes(a.times[myStopIndex] || '23:59') - timeToMinutes(b.times[myStopIndex] || '23:59'));

    const metaAptName = apartment?.name?.[lang] || apartment?.name?.en || apartment?.name?.bg || '';
    const metaTitle = lang === 'bg' ? `График на автобус · ${metaAptName}` : `Bus Schedule · ${metaAptName}`;
    const metaDesc = lang === 'bg'
        ? `График на автобусния транспорт за ${metaAptName}`
        : `Bus schedule for ${metaAptName}`;
    const metaImage = apartment?.heroImage || apartment?.photos?.[0] || '';
    const metaUrl = `${window.location.origin}/apartments/${slug}/brochure/bus-schedule`;

    if (loading) return <BrochureLoader />;

    if (!busTracker?.enabled || trips.length === 0 || myStopIndex < 0) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">{lang === 'bg' ? 'Няма график на автобус.' : 'No bus schedule available.'}</p>
                    <button onClick={() => navigate(-1)} className="mt-4 text-blue-500 underline text-sm">
                        {lang === 'bg' ? 'Назад' : 'Back'}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8f9fb]">
            <Helmet>
                <title>{metaTitle}</title>
                <meta name="description" content={metaDesc} />
                <meta property="og:type" content="website" />
                <meta property="og:title" content={metaTitle} />
                <meta property="og:description" content={metaDesc} />
                <meta property="og:url" content={metaUrl} />
                {metaImage && <meta property="og:image" content={metaImage} />}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={metaTitle} />
                <meta name="twitter:description" content={metaDesc} />
                {metaImage && <meta name="twitter:image" content={metaImage} />}
                <meta name="robots" content="noindex, nofollow" />
            </Helmet>
            {/* Header */}
            <header className="bg-white sticky top-0 z-20 border-b border-gray-100">
                <div className="px-4 py-3 flex items-center justify-between">
                    <button
                        onClick={() => navigate(`/apartments/${slug}/brochure`)}
                        className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="text-sm font-medium">{lang === 'bg' ? 'Назад' : 'Back'}</span>
                    </button>
                    <div className="flex items-center gap-1.5">
                        <Bus className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-bold text-gray-800">
                            {lang === 'bg' ? 'График на автобус' : 'Bus Schedule'}
                        </span>
                    </div>
                    <LanguageSwitcher />
                </div>

                {/* Day tabs */}
                <div className="flex overflow-x-auto scrollbar-hide px-4 pb-3 gap-1.5">
                    {daysWithTrips.map(day => (
                        <button
                            key={day}
                            onClick={() => setActiveDay(day)}
                            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                                activeDay === day
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : day === today
                                        ? 'bg-blue-50 text-blue-600 border border-blue-200'
                                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                            }`}
                        >
                            {DAY_SHORT[day][lang]}
                            {day === today && activeDay !== day && (
                                <span className="ml-1 inline-block w-1 h-1 rounded-full bg-blue-400 align-middle" />
                            )}
                        </button>
                    ))}
                </div>
            </header>

            {/* Day label */}
            <div className="px-4 pt-4 pb-1 flex items-center gap-2">
                <h2 className="text-base font-bold text-gray-900">{DAY_LABEL[activeDay][lang]}</h2>
                {activeDay === today && (
                    <span className="text-xs text-blue-500 font-medium bg-blue-50 px-2 py-0.5 rounded-full">
                        {lang === 'bg' ? 'Днес' : 'Today'}
                    </span>
                )}
            </div>

            {/* Bus trips */}
            <div className="px-4 pt-2 pb-10 space-y-2">
                {dayTrips.length === 0 && (
                    <p className="text-sm text-gray-400 text-center py-8">
                        {lang === 'bg' ? 'Няма автобуси за този ден.' : 'No buses for this day.'}
                    </p>
                )}
                {dayTrips.map((trip, idx) => {
                    const myStopTime = trip.times[myStopIndex];
                    if (!myStopTime) return null;

                    const isNow = activeDay === today
                        && timeToMinutes(myStopTime) <= now
                        && now < timeToMinutes(myStopTime) + 15;
                    const isPast = activeDay === today && timeToMinutes(myStopTime) + 15 <= now;

                    // Find previous stop info
                    let prevStopIdx = -1;
                    for (let i = myStopIndex - 1; i >= 0; i--) {
                        if (trip.times[i]) { prevStopIdx = i; break; }
                    }

                    // Find next stop info
                    let nextStopIdx = -1;
                    for (let i = myStopIndex + 1; i < stops.length; i++) {
                        if (trip.times[i]) { nextStopIdx = i; break; }
                    }

                    return (
                        <div
                            key={`${trip.days.join('-')}-${idx}`}
                            className={`flex gap-4 rounded-2xl px-4 py-3 ${
                                isNow
                                    ? 'bg-green-50 border border-green-200 shadow-sm'
                                    : isPast
                                        ? 'bg-white border border-gray-100 opacity-50'
                                        : 'bg-white border border-gray-100'
                            }`}
                        >
                            {/* Time column */}
                            <div className="flex-shrink-0 w-14 text-right pt-0.5">
                                <p className={`text-sm font-mono font-semibold ${isNow ? 'text-green-600' : 'text-gray-800'}`}>
                                    {myStopTime}
                                </p>
                            </div>

                            {/* Divider line */}
                            <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
                                <span className={`w-2 h-2 rounded-full mt-1 ${isNow ? 'bg-green-500' : 'bg-blue-300'}`} />
                                <span className={`w-px flex-1 ${isNow ? 'bg-green-200' : 'bg-blue-100'}`} />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start gap-2">
                                    <div className="flex-1">
                                        <p className={`text-sm font-semibold leading-tight ${isNow ? 'text-green-800' : 'text-gray-800'}`}>
                                            {lang === 'bg' ? 'Автобус' : 'Bus'}
                                        </p>
                                        {prevStopIdx >= 0 && (
                                            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                                <span>{lang === 'bg' ? 'От' : 'From'}</span>
                                                <MapPin size={12} />
                                                {stops[prevStopIdx]?.name?.[lang] || stops[prevStopIdx]?.name?.en || stops[prevStopIdx]?.name?.bg}
                                            </p>
                                        )}
                                        {nextStopIdx >= 0 && (
                                            <p className="text-xs text-gray-500 flex items-center gap-1">
                                                <span>{lang === 'bg' ? 'До' : 'To'}</span>
                                                <MapPin size={12} />
                                                {stops[nextStopIdx]?.name?.[lang] || stops[nextStopIdx]?.name?.en || stops[nextStopIdx]?.name?.bg}
                                            </p>
                                        )}
                                    </div>
                                    {isNow && (
                                        <span className="flex-shrink-0 flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                            {lang === 'bg' ? 'Сега' : 'Now'}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default GuestBrochureBusSchedule;
