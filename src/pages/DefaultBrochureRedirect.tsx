import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import BrochureLoader from '../components/common/BrochureLoader';
import { useLanguage } from '../hooks/useLanguage';
import { Language } from '../contexts/LanguageContext';

const DefaultBrochureRedirect = () => {
    const navigate = useNavigate();
    const { lang } = useParams<{ lang?: string }>();
    const { setLanguage } = useLanguage();

    useEffect(() => {
        if (lang === 'en' || lang === 'bg') {
            setLanguage(lang as Language);
        }

        const fetchDefault = async () => {
            try {
                const q = query(collection(db, 'apartments'), where('isDefault', '==', true));
                const snap = await getDocs(q);
                if (!snap.empty) {
                    const slug = snap.docs[0].data().slug;
                    if (slug) {
                        navigate(`/apartments/${slug}/brochure`, { replace: true });
                        return;
                    }
                }
                navigate('/', { replace: true });
            } catch {
                navigate('/', { replace: true });
            }
        };
        fetchDefault();
    }, [navigate, lang, setLanguage]);

    return <BrochureLoader />;
};

export default DefaultBrochureRedirect;
