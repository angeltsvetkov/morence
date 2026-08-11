import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Apartment } from '../types';

/**
 * Loads the apartment backing a guest brochure page.
 * When `slug` is given, resolves that apartment by slug.
 * When `slug` is omitted, resolves the apartment flagged `isDefault`
 * — used for the bare `/brochure` URL that never exposes an apartment ID.
 */
export function useBrochureApartment(slug?: string) {
    const [apartment, setApartment] = useState<Apartment | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setNotFound(false);
        getDocs(collection(db, 'apartments')).then(snap => {
            if (cancelled) return;
            const docs = snap.docs.map(d => ({ id: d.id, ...d.data() } as Apartment));
            const found = slug ? docs.find(a => a.slug === slug) : docs.find(a => a.isDefault);
            if (found) {
                setApartment(found);
            } else {
                setApartment(null);
                setNotFound(true);
            }
            setLoading(false);
        }).catch(() => {
            if (cancelled) return;
            setNotFound(true);
            setLoading(false);
        });
        return () => { cancelled = true; };
    }, [slug]);

    return { apartment, loading, notFound };
}
