import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useLanguage } from '../hooks/useLanguage';
import LoadingSpinner from '../components/common/LoadingSpinner';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { Apartment } from '../types';
import { AlertTriangle, ImageOff, MapPin } from 'lucide-react';

const GuestBrochure: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const { language } = useLanguage();
    const [apartment, setApartment] = useState<Apartment | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

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

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-50"><LoadingSpinner /></div>;
    }

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
                <BrochureHeader />
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
            <BrochureHeader />

            <main className="px-4 pt-5 pb-10">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                    {lang === 'bg' ? 'Разгледай наблизо' : 'Explore nearby'}
                </h2>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {places.map((place, idx) => {
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
                                {/* dark gradient overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                                {/* name */}
                                <div className="absolute bottom-0 left-0 right-0 px-3 pb-3">
                                    <p className="text-white text-xs font-bold leading-snug line-clamp-2 drop-shadow-sm text-left">
                                        {name}
                                    </p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </main>

            <p className="text-center text-xs text-gray-300 pb-8">morence.top</p>
        </div>
    );
};

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

export default GuestBrochure;
