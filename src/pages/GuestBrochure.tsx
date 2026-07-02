import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useLanguage } from '../hooks/useLanguage';
import LoadingSpinner from '../components/common/LoadingSpinner';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { Apartment } from '../types';
import {
    Wifi, KeyRound, LogOut, ScrollText, MapPin, Phone, AlertTriangle, Bus
} from 'lucide-react';

const SECTIONS = [
    { key: 'welcomeMessage',        icon: ScrollText,    labelEn: 'Welcome',             labelBg: 'Добре дошли' },
    { key: 'wifiName',              icon: Wifi,          labelEn: 'Wi-Fi',               labelBg: 'Wi-Fi',         group: 'wifi' },
    { key: 'checkInInstructions',   icon: KeyRound,      labelEn: 'Check-in',            labelBg: 'Настаняване' },
    { key: 'checkOutInstructions',  icon: LogOut,        labelEn: 'Check-out',           labelBg: 'Напускане' },
    { key: 'houseRules',            icon: ScrollText,    labelEn: 'House Rules',         labelBg: 'Правила' },
    { key: 'transportInfo',         icon: Bus,           labelEn: 'Transport & Parking', labelBg: 'Транспорт и паркиране' },
    { key: 'localTips',             icon: MapPin,        labelEn: 'Local Tips',          labelBg: 'Местни съвети' },
    { key: 'emergencyContacts',     icon: Phone,         labelEn: 'Emergency Contacts',  labelBg: 'Спешни контакти' },
] as const;

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

                if (found) {
                    setApartment(found);
                } else {
                    setNotFound(true);
                }
            } catch (e) {
                console.error('Error fetching apartment for brochure:', e);
                setNotFound(true);
            } finally {
                setLoading(false);
            }
        };
        fetchApartment();
    }, [slug]);

    const lang = (language as 'bg' | 'en') === 'bg' ? 'bg' : 'en';
    const brochure = apartment?.guestBrochure?.[lang] || apartment?.guestBrochure?.['bg'] || apartment?.guestBrochure?.['en'] || null;

    const hasAnyContent = brochure && (
        brochure.welcomeMessage ||
        brochure.wifiName ||
        brochure.wifiPassword ||
        brochure.checkInInstructions ||
        brochure.checkOutInstructions ||
        brochure.houseRules ||
        brochure.transportInfo ||
        brochure.localTips ||
        brochure.emergencyContacts
    );

    const apartmentName = apartment?.name?.[lang] || apartment?.name?.en || apartment?.name?.bg || '';

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

    if (!hasAnyContent) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <ScrollText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 text-lg">
                        {lang === 'bg' ? 'Брошурата все още не е налична.' : 'Brochure not available yet.'}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
                <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                            <span className="text-white text-xs font-bold tracking-wider uppercase">morence</span>
                            <span className="text-blue-100 text-xs font-light">.top</span>
                        </div>
                        {apartmentName && !apartment.hideName && (
                            <span className="text-gray-600 text-sm font-medium truncate max-w-[160px]">
                                {apartmentName}
                            </span>
                        )}
                    </div>
                    <LanguageSwitcher />
                </div>
            </header>

            {/* Content */}
            <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
                {/* Title */}
                <div className="text-center pb-4">
                    <h1 className="text-2xl font-bold text-gray-900">
                        {lang === 'bg' ? 'Брошура за гости' : 'Guest Brochure'}
                    </h1>
                    {apartmentName && !apartment.hideName && (
                        <p className="text-gray-500 mt-1 text-sm">{apartmentName}</p>
                    )}
                </div>

                {/* Welcome */}
                {brochure?.welcomeMessage && (
                    <Section icon={<ScrollText className="w-5 h-5" />} title={lang === 'bg' ? 'Добре дошли' : 'Welcome'} accent="blue">
                        <p className="whitespace-pre-line text-gray-700">{brochure.welcomeMessage}</p>
                    </Section>
                )}

                {/* Wi-Fi */}
                {(brochure?.wifiName || brochure?.wifiPassword) && (
                    <Section icon={<Wifi className="w-5 h-5" />} title="Wi-Fi" accent="green">
                        <div className="grid grid-cols-2 gap-4">
                            {brochure.wifiName && (
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                                        {lang === 'bg' ? 'Мрежа' : 'Network'}
                                    </p>
                                    <p className="font-mono font-semibold text-gray-900 bg-gray-100 rounded px-2 py-1 text-sm break-all">
                                        {brochure.wifiName}
                                    </p>
                                </div>
                            )}
                            {brochure.wifiPassword && (
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                                        {lang === 'bg' ? 'Парола' : 'Password'}
                                    </p>
                                    <p className="font-mono font-semibold text-gray-900 bg-gray-100 rounded px-2 py-1 text-sm break-all">
                                        {brochure.wifiPassword}
                                    </p>
                                </div>
                            )}
                        </div>
                    </Section>
                )}

                {/* Check-in */}
                {brochure?.checkInInstructions && (
                    <Section icon={<KeyRound className="w-5 h-5" />} title={lang === 'bg' ? 'Настаняване' : 'Check-in'} accent="purple">
                        <p className="whitespace-pre-line text-gray-700">{brochure.checkInInstructions}</p>
                    </Section>
                )}

                {/* Check-out */}
                {brochure?.checkOutInstructions && (
                    <Section icon={<LogOut className="w-5 h-5" />} title={lang === 'bg' ? 'Напускане' : 'Check-out'} accent="orange">
                        <p className="whitespace-pre-line text-gray-700">{brochure.checkOutInstructions}</p>
                    </Section>
                )}

                {/* House Rules */}
                {brochure?.houseRules && (
                    <Section icon={<ScrollText className="w-5 h-5" />} title={lang === 'bg' ? 'Правила' : 'House Rules'} accent="red">
                        <p className="whitespace-pre-line text-gray-700">{brochure.houseRules}</p>
                    </Section>
                )}

                {/* Transport */}
                {brochure?.transportInfo && (
                    <Section icon={<Bus className="w-5 h-5" />} title={lang === 'bg' ? 'Транспорт и паркиране' : 'Transport & Parking'} accent="indigo">
                        <p className="whitespace-pre-line text-gray-700">{brochure.transportInfo}</p>
                    </Section>
                )}

                {/* Local Tips */}
                {brochure?.localTips && (
                    <Section icon={<MapPin className="w-5 h-5" />} title={lang === 'bg' ? 'Местни съвети' : 'Local Tips'} accent="teal">
                        <p className="whitespace-pre-line text-gray-700">{brochure.localTips}</p>
                    </Section>
                )}

                {/* Emergency Contacts */}
                {brochure?.emergencyContacts && (
                    <Section icon={<Phone className="w-5 h-5" />} title={lang === 'bg' ? 'Спешни контакти' : 'Emergency Contacts'} accent="rose">
                        <p className="whitespace-pre-line text-gray-700">{brochure.emergencyContacts}</p>
                    </Section>
                )}

                <p className="text-center text-xs text-gray-400 pb-8">morence.top</p>
            </main>
        </div>
    );
};

type Accent = 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'indigo' | 'teal' | 'rose';

const ACCENT_CLASSES: Record<Accent, { bg: string; border: string; icon: string }> = {
    blue:   { bg: 'bg-blue-50',   border: 'border-blue-200',   icon: 'text-blue-600' },
    green:  { bg: 'bg-green-50',  border: 'border-green-200',  icon: 'text-green-600' },
    purple: { bg: 'bg-purple-50', border: 'border-purple-200', icon: 'text-purple-600' },
    orange: { bg: 'bg-orange-50', border: 'border-orange-200', icon: 'text-orange-600' },
    red:    { bg: 'bg-red-50',    border: 'border-red-200',    icon: 'text-red-600' },
    indigo: { bg: 'bg-indigo-50', border: 'border-indigo-200', icon: 'text-indigo-600' },
    teal:   { bg: 'bg-teal-50',   border: 'border-teal-200',   icon: 'text-teal-600' },
    rose:   { bg: 'bg-rose-50',   border: 'border-rose-200',   icon: 'text-rose-600' },
};

const Section: React.FC<{ icon: React.ReactNode; title: string; accent: Accent; children: React.ReactNode }> = ({
    icon, title, accent, children
}) => {
    const cls = ACCENT_CLASSES[accent];
    return (
        <div className={`rounded-xl border ${cls.border} ${cls.bg} overflow-hidden`}>
            <div className={`flex items-center gap-2 px-4 py-3 border-b ${cls.border}`}>
                <span className={cls.icon}>{icon}</span>
                <h2 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">{title}</h2>
            </div>
            <div className="px-4 py-4 text-sm">
                {children}
            </div>
        </div>
    );
};

export default GuestBrochure;
