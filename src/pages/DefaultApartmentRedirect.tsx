import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import LoadingSpinner from '../components/common/LoadingSpinner';

const DefaultApartmentRedirect = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDefaultApartment = async () => {
            console.log('DefaultApartmentRedirect: Starting fetch...');
            try {
                const apartmentsRef = collection(db, "apartments");
                const q = query(apartmentsRef, where("isDefault", "==", true));
                const querySnapshot = await getDocs(q);

                console.log('DefaultApartmentRedirect: Query completed. Empty?', querySnapshot.empty);
                console.log('DefaultApartmentRedirect: Number of docs:', querySnapshot.docs.length);

                if (!querySnapshot.empty) {
                    const defaultApartment = querySnapshot.docs[0].data();
                    console.log('DefaultApartmentRedirect: Found default apartment:', defaultApartment);
                    if (defaultApartment.slug) {
                        console.log('DefaultApartmentRedirect: Navigating to:', `/apartments/${defaultApartment.slug}`);
                        navigate(`/apartments/${defaultApartment.slug}`, { replace: true });
                    } else {
                        console.log('DefaultApartmentRedirect: No slug, redirecting to places');
                        setLoading(false);
                        navigate('/places', { replace: true });
                    }
                } else {
                    console.log('DefaultApartmentRedirect: No default apartment found, redirecting to places');
                    setLoading(false);
                    navigate('/places', { replace: true });
                }
            } catch (error) {
                console.error('DefaultApartmentRedirect: Error fetching default apartment:', error);
                setError(error instanceof Error ? error.message : 'Unknown error');
                setLoading(false);
            }
        };

        fetchDefaultApartment();
    }, [navigate]);

    if (loading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4 text-red-600">Error</h1>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button 
                        onClick={() => navigate('/places')}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        View Apartments
                    </button>
                </div>
            </div>
        );
    }

    // If we reach here, something went wrong
    return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="text-center">
                <h1 className="text-2xl font-bold mb-4">Welcome to Morence</h1>
                <p className="text-gray-600 mb-4">Redirecting you to our apartments...</p>
                <button 
                    onClick={() => navigate('/places')}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    View Apartments
                </button>
            </div>
        </div>
    );
};

export default DefaultApartmentRedirect;
