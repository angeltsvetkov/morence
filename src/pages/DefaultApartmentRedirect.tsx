import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import LoadingSpinner from '../components/common/LoadingSpinner';

const DefaultApartmentRedirect = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDefaultApartment = async () => {
            const apartmentsRef = collection(db, "apartments");
            const q = query(apartmentsRef, where("isDefault", "==", true));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const defaultApartment = querySnapshot.docs[0].data();
                if (defaultApartment.slug) {
                    navigate(`/apartments/${defaultApartment.slug}`, { replace: true });
                } else {
                    setLoading(false);
                    navigate('/places', { replace: true });
                }
            } else {
                setLoading(false);
                navigate('/places', { replace: true });
            }
        };

        fetchDefaultApartment();
    }, [navigate]);

    if (loading) {
        return <LoadingSpinner />;
    }

    return null;
};

export default DefaultApartmentRedirect;
