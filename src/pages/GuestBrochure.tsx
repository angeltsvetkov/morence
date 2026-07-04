import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useLanguage } from '../hooks/useLanguage';
import BrochureLoader from '../components/common/BrochureLoader';
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
    const groups = apartment?.guestBrochure?.groups || [];

    // Build ordered sections: grouped places under a header, then ungrouped places
    type Section = { groupId: string | null; groupName: string | null; places: typeof places };
    const sections: Section[] = [];
    const appearedInGroup = new Set<string>();

    // Grouped — preserve group order as they appear in the groups array
    groups.forEach(g => {
        const groupPlaces = places.filter(p => (p.groupIds || []).includes(g.id));
        if (groupPlaces.length > 0) {
            sections.push({ groupId: g.id, groupName: g.name[lang] || g.name.en || g.name.bg || '', places: groupPlaces });
            groupPlaces.forEach(p => appearedInGroup.add(p.id));
        }
    });

    // Ungrouped places (no groupIds or all groupIds point to deleted groups)
    const ungrouped = places.filter(p => !appearedInGroup.has(p.id));
    if (ungrouped.length > 0) {
        sections.push({ groupId: null, groupName: null, places: ungrouped });
    }

    if (loading) {
        return <BrochureLoader />;
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

            <main className="px-4 pt-5 pb-10 space-y-7">
                {sections.map((section, si) => (
                    <div key={section.groupId ?? `ungrouped-${si}`}>
                        {section.groupName && (
                            <h2 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
                                <span className="w-1 h-4 rounded-full bg-blue-500 inline-block" />
                                {section.groupName}
                            </h2>
                        )}
                        {!section.groupName && sections.length > 1 && (
                            <h2 className="text-base font-bold text-gray-800 mb-3">
                                {lang === 'bg' ? 'Разгледай наблизо' : 'Explore nearby'}
                            </h2>
                        )}
                        {!section.groupName && sections.length === 1 && (
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
