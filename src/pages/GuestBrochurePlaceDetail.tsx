import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useLanguage } from '../hooks/useLanguage';
import BrochureLoader from '../components/common/BrochureLoader';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { AlertTriangle, ArrowLeft, MapPin, Phone, Clock, Tag, UtensilsCrossed } from 'lucide-react';
import FormattedText from '../components/common/FormattedText';
import { useBrochureApartment } from '../hooks/useBrochureApartment';
import { brochureBasePath } from '../utils/brochureUrl';
import { Language } from '../contexts/LanguageContext';
import { resolvePlaceByUrlSegment } from '../utils/placeSlug';

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

const DAY_LABELS_BG: Record<string, string> = { mon: 'Понеделник', tue: 'Вторник', wed: 'Сряда', thu: 'Четвъртък', fri: 'Петък', sat: 'Събота', sun: 'Неделя' };
const DAY_LABELS_EN: Record<string, string> = { mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday', fri: 'Friday', sat: 'Saturday', sun: 'Sunday' };
const ORDERED_DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

const GuestBrochurePlaceDetail: React.FC = () => {
    const { slug, placeId } = useParams<{ slug?: string; placeId: string }>();
    const navigate = useNavigate();
    const { language, setLanguage } = useLanguage();
    const basePath = brochureBasePath(slug);

    // The bare `/brochure/:lang` URL doubles as a language-setting shortcut
    // for the default apartment's brochure (e.g. /brochure/bg, /brochure/en).
    const isLangShortcut = !slug && (placeId === 'en' || placeId === 'bg');

    useEffect(() => {
        if (isLangShortcut) {
            setLanguage(placeId as Language);
            navigate('/brochure', { replace: true });
        }
    }, [isLangShortcut, placeId, navigate, setLanguage]);

    const { apartment, loading } = useBrochureApartment(slug);

    // Ensure page starts at the top (prevent scroll restoration overlap)
    useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior }); }, []);

    const lang = (language as string) === 'bg' ? 'bg' : 'en';
    const places = apartment?.guestBrochure?.places || [];
    const place = resolvePlaceByUrlSegment(places, placeId);

    const name = place?.name?.[lang] || place?.name?.en || place?.name?.bg || '';
    const description = place?.description?.[lang] || place?.description?.en || place?.description?.bg || '';

    const metaTitle = name ? `${name} · morence` : 'morence';
    const metaDesc = description || name;
    const metaImage = place?.image || '';
    const metaUrl = `${window.location.origin}${basePath}/${placeId}`;

    const status = getPlaceStatus(place?.workingHours);
    const statusLabel =
        status === 'open' ? (lang === 'bg' ? 'Отворено' : 'Open') :
        status === 'closing-soon' ? (lang === 'bg' ? 'Затваря скоро' : 'Closing soon') :
        status === 'closed' ? (lang === 'bg' ? 'Затворено' : 'Closed') : null;
    const statusColor =
        status === 'open' ? 'bg-green-100 text-green-700' :
        status === 'closing-soon' ? 'bg-amber-100 text-amber-700' :
        status === 'closed' ? 'bg-red-100 text-red-700' : '';

    if (loading || isLangShortcut) {
        return <BrochureLoader />;
    }

    if (!place) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">{lang === 'bg' ? 'Мястото не е намерено.' : 'Place not found.'}</p>
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
            {/* header */}
            <header className="bg-white sticky top-0 z-20 border-b border-gray-100">
                <div className="px-4 py-3 flex items-center justify-between">
                    <button
                        onClick={() => navigate(basePath)}
                        className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="text-sm font-medium">{lang === 'bg' ? 'Назад' : 'Back'}</span>
                    </button>
                    <div className="bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 px-3 py-1.5 rounded-full flex items-center gap-1">
                        <span className="text-white text-xs font-bold tracking-wider uppercase">morence</span>
                        <span className="text-blue-100 text-xs font-light">.top</span>
                    </div>
                    <LanguageSwitcher />
                </div>
            </header>

            {/* hero image */}
            {place.image && (
                <div className="w-full aspect-[16/9] overflow-hidden bg-gray-200">
                    <img
                        src={place.image}
                        alt={name}
                        className="w-full h-full object-cover"
                    />
                </div>
            )}

            {/* action buttons */}
            {(place.mapsUrl || place.phone) && (
                <div className="flex gap-3 px-5 pt-5">
                    {place.mapsUrl && (
                        <a
                            href={place.mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-200 rounded-xl py-3 text-sm font-medium text-gray-700 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors shadow-sm"
                        >
                            <MapPin className="w-4 h-4 text-red-400" />
                            {lang === 'bg' ? 'Заведи ме' : 'Go there'}
                        </a>
                    )}
                    {place.phone && (
                        <a
                            href={`tel:${place.phone}`}
                            className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-200 rounded-xl py-3 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-colors shadow-sm"
                        >
                            <Phone className="w-4 h-4 text-blue-400" />
                            {place.phone}
                        </a>
                    )}
                </div>
            )}

            <div className="px-5 py-5 space-y-5">
                {/* name + status */}
                <div className="flex items-start justify-between gap-3">
                    <h1 className="text-2xl font-bold text-gray-900 leading-tight">{name}</h1>
                    {statusLabel && (
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 mt-1 ${statusColor}`}>
                            {statusLabel}
                        </span>
                    )}
                </div>

                {/* description */}
                {description && (
                    <FormattedText text={description} className="text-sm text-gray-600 leading-relaxed" />
                )}

                {/* lunch menu (обедно меню) — only shown on its matching day */}
                {(() => {
                    const todayKey = DAY_KEYS[new Date().getDay()];
                    const todayMenu = place.lunchMenu?.[todayKey];
                    const menuText = todayMenu?.[lang] || todayMenu?.en || todayMenu?.bg || '';
                    if (!menuText) return null;
                    return (
                        <div className="bg-amber-50 rounded-2xl border border-amber-200 p-4 shadow-sm">
                            <div className="flex items-center gap-2 mb-3">
                                <UtensilsCrossed className="w-4 h-4 text-amber-600" />
                                <span className="text-sm font-semibold text-amber-800">
                                    {lang === 'bg' ? 'Обедно меню · Днес' : "Lunch menu · Today"}
                                </span>
                            </div>
                            <FormattedText text={menuText} className="text-sm text-amber-900 leading-relaxed" />
                        </div>
                    );
                })()}

                {/* pricelist */}
                {place.priceList && place.priceList.length > 0 && (
                    <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                        <div className="flex items-center gap-2 mb-3">
                            <Tag className="w-4 h-4 text-gray-500" />
                            <span className="text-sm font-semibold text-gray-800">
                                {lang === 'bg' ? 'Ценова листа' : 'Price list'}
                            </span>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {place.priceList.map((item, idx) => {
                                const itemName = item.name?.[lang] || item.name?.en || item.name?.bg || '';
                                const unit = item.unit?.[lang] || item.unit?.en || item.unit?.bg || '';
                                return (
                                    <div key={idx} className="flex items-center justify-between py-2.5">
                                        <span className="text-sm text-gray-700">{itemName}</span>
                                        <span className="text-sm font-semibold text-gray-900">
                                            {item.price} <span className="text-xs text-gray-400 font-normal">EUR</span>{unit ? <span className="text-xs text-gray-400 font-normal ml-1">/ {unit}</span> : null}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* working hours — only shown when at least one day actually has hours set */}
                {place.workingHours && Object.values(place.workingHours).some(v => v) && (
                    <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                        <div className="flex items-center gap-2 mb-3">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span className="text-sm font-semibold text-gray-800">
                                {lang === 'bg' ? 'Работно време' : 'Opening hours'}
                            </span>
                        </div>
                        <div className="space-y-1.5">
                            {ORDERED_DAYS.map(day => {
                                const entry = place.workingHours?.[day];
                                if (entry === undefined) return null;
                                const dayLabel = lang === 'bg' ? DAY_LABELS_BG[day] : DAY_LABELS_EN[day];
                                const isToday = DAY_KEYS[new Date().getDay()] === day;
                                return (
                                    <div key={day} className={`flex items-center justify-between text-sm ${isToday ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
                                        <span>{dayLabel}{isToday && <span className="ml-1.5 text-xs text-blue-500 font-normal">{lang === 'bg' ? '(днес)' : '(today)'}</span>}</span>
                                        {entry ? (
                                            <span>{entry.open} – {entry.close}</span>
                                        ) : (
                                            <span className="text-gray-400 italic text-xs">{lang === 'bg' ? 'затворено' : 'closed'}</span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            <p className="text-center text-xs text-gray-300 pb-8 pt-4">morence.top</p>
        </div>
    );
};

export default GuestBrochurePlaceDetail;
