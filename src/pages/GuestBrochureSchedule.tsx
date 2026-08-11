import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useLanguage } from '../hooks/useLanguage';
import BrochureLoader from '../components/common/BrochureLoader';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { TimetableDay } from '../types';
import { AlertTriangle, ArrowLeft, MapPin, Clock, Activity } from 'lucide-react';
import { useBrochureApartment } from '../hooks/useBrochureApartment';
import { brochureBasePath } from '../utils/brochureUrl';

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

const GuestBrochureSchedule: React.FC = () => {
    const { slug } = useParams<{ slug?: string }>();
    const navigate = useNavigate();
    const { language } = useLanguage();
    const { apartment, loading } = useBrochureApartment(slug);
    const basePath = brochureBasePath(slug);
    const [activeDay, setActiveDay] = useState<TimetableDay>(todayKey());

    useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior }); }, []);

    const lang = (language as string) === 'bg' ? 'bg' : 'en';
    const entries = apartment?.timetable?.entries || [];
    const places = apartment?.guestBrochure?.places || [];

    const daysWithEntries = ALL_DAYS.filter(d => entries.some(e => e.days.includes(d)));
    const today = todayKey();
    const now = currentMinutes();

    const dayEntries = entries
        .filter(e => e.days.includes(activeDay))
        .sort((a, b) => a.startTime.localeCompare(b.startTime));

    const metaAptName = apartment?.name?.[lang] || apartment?.name?.en || apartment?.name?.bg || '';
    const metaTitle = lang === 'bg' ? `Програма · ${metaAptName}` : `Schedule · ${metaAptName}`;
    const metaDesc = lang === 'bg'
        ? `Пълна програма на активности за ${metaAptName}`
        : `Full activity schedule for ${metaAptName}`;
    const metaImage = apartment?.heroImage || apartment?.photos?.[0] || '';
    const metaUrl = `${window.location.origin}${basePath}/schedule`;

    if (loading) return <BrochureLoader />;

    if (!apartment || entries.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">{lang === 'bg' ? 'Няма програма.' : 'No schedule available.'}</p>
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
                        onClick={() => navigate(basePath)}
                        className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="text-sm font-medium">{lang === 'bg' ? 'Назад' : 'Back'}</span>
                    </button>
                    <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-bold text-gray-800">
                            {lang === 'bg' ? 'Програма' : 'Schedule'}
                        </span>
                    </div>
                    <LanguageSwitcher />
                </div>

                {/* Day tabs */}
                <div className="flex overflow-x-auto scrollbar-hide px-4 pb-3 gap-1.5">
                    {daysWithEntries.map(day => (
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

            {/* Entries */}
            <div className="px-4 pt-2 pb-10 space-y-2">
                {dayEntries.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 px-6">
                        <div className="mb-4">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
                                <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                        <h3 className="text-base font-semibold text-gray-700 mb-1">
                            {lang === 'bg' ? 'Няма планирани дейности' : 'No scheduled activities'}
                        </h3>
                        <p className="text-sm text-gray-400 text-center max-w-xs mb-4">
                            {lang === 'bg' 
                                ? 'За този ден няма насрочени дейности. Наслаждайте се свободно време!'
                                : 'There are no scheduled activities for this day. Enjoy your free time!'}
                        </p>
                        <button
                            onClick={() => setActiveDay(daysWithEntries.find(d => d !== activeDay) || activeDay)}
                            className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                        >
                            {lang === 'bg' ? 'Преглед на други дни' : 'Check other days'}
                        </button>
                    </div>
                )}
                {dayEntries.map(entry => {
                    const isNow = activeDay === today
                        && timeToMinutes(entry.startTime) <= now
                        && now < timeToMinutes(entry.endTime);
                    const isPast = activeDay === today && timeToMinutes(entry.endTime) <= now;
                    return (
                        <div
                            key={entry.id}
                            className={`rounded-2xl overflow-hidden ${
                                isNow
                                    ? 'bg-green-50 border border-green-200 shadow-sm'
                                    : isPast
                                        ? 'bg-white border border-gray-100 opacity-50'
                                        : 'bg-white border border-gray-100'
                            }`}
                        >
                            <div className="flex gap-3 p-4">
                                {/* Thumbnail or placeholder on the left */}
                                <div className="flex-shrink-0">
                                    {entry.thumbnail ? (
                                        <img
                                            src={entry.thumbnail}
                                            alt={entry.title[lang] || entry.title.bg || entry.title.en}
                                            className="w-24 h-24 rounded-xl object-cover"
                                        />
                                    ) : (
                                        <div className={`w-24 h-24 rounded-xl flex items-center justify-center ${
                                            isNow
                                                ? 'bg-green-100'
                                                : isPast
                                                    ? 'bg-gray-50'
                                                    : 'bg-gradient-to-br from-blue-50 to-blue-100'
                                        }`}>
                                            <Activity size={40} className={`${
                                                isNow
                                                    ? 'text-green-400'
                                                    : isPast
                                                        ? 'text-gray-300'
                                                        : 'text-blue-300'
                                            }`} />
                                        </div>
                                    )}
                                </div>

                                {/* Time and content */}
                                <div className="flex-1 min-w-0 flex gap-3">
                                    {/* Time column */}
                                    <div className="flex-shrink-0 w-14 text-right pt-0.5">
                                        <p className={`text-xs font-mono font-semibold ${isNow ? 'text-green-600' : 'text-gray-400'}`}>
                                            {entry.startTime}
                                        </p>
                                        <p className={`text-xs font-mono ${isNow ? 'text-green-400' : 'text-gray-300'}`}>
                                            {entry.endTime}
                                        </p>
                                    </div>

                                    {/* Divider line */}
                                    <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
                                        <span className={`w-2 h-2 rounded-full mt-1 ${isNow ? 'bg-green-500' : 'bg-gray-200'}`} />
                                        <span className={`w-px flex-1 ${isNow ? 'bg-green-200' : 'bg-gray-100'}`} />
                                    </div>

                                    {/* Text content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start gap-2">
                                            <p className={`text-sm font-semibold leading-tight flex-1 ${isNow ? 'text-green-800' : 'text-gray-800'}`}>
                                                {entry.title[lang] || entry.title.bg || entry.title.en}
                                            </p>
                                            {isNow && (
                                                <span className="flex-shrink-0 flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                                    {lang === 'bg' ? 'Сега' : 'Now'}
                                                </span>
                                            )}
                                        </div>

                                        {(entry.location?.bg || entry.location?.en) && (
                                            <p className="text-xs text-gray-400 mt-0.5">
                                                {entry.location[lang] || entry.location.bg || entry.location.en}
                                            </p>
                                        )}

                                        {entry.placeIds && entry.placeIds.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-1.5">
                                                {entry.placeIds.map(pid => {
                                                    const p = places.find(pl => pl.id === pid);
                                                    if (!p) return null;
                                                    const pName = p.name[lang] || p.name.bg || p.name.en;
                                                    return p.mapsUrl ? (
                                                        <a key={pid} href={p.mapsUrl} target="_blank" rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-1 text-[11px] bg-gray-100 text-gray-500 hover:bg-blue-50 hover:text-blue-600 px-2 py-0.5 rounded-full transition-colors">
                                                            <MapPin size={10} />
                                                            {pName}
                                                        </a>
                                                    ) : (
                                                        <span key={pid} className="inline-flex items-center gap-1 text-[11px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                                                            <MapPin size={10} />
                                                            {pName}
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <p className="text-center text-xs text-gray-300 pb-8">morence.top</p>
        </div>
    );
};

export default GuestBrochureSchedule;
