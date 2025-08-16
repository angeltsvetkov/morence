import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { getCurrentSubdomain } from '../utils/subdomain';
import LoadingSpinner from './common/LoadingSpinner';

/**
 * Component that handles subdomain routing by fetching apartment by domain
 * and either rendering the apartment directly or redirecting to regular routing
 */
const SubdomainRouter: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [apartmentSlug, setApartmentSlug] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleSubdomainRouting = async () => {
      const subdomain = getCurrentSubdomain();
      
      if (!subdomain) {
        // Not on a subdomain, navigate to main site
        setLoading(false);
        return;
      }

      try {
        // Fetch apartment by domain field
        const apartmentsRef = collection(db, "apartments");
        const q = query(apartmentsRef, where("domain", "==", subdomain));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const apartmentData = querySnapshot.docs[0].data();
          const slug = apartmentData.slug;
          
          if (slug) {
            setApartmentSlug(slug);
          } else {
            setError('Apartment found but no slug available');
          }
        } else {
          setError('No apartment found for this domain');
        }
      } catch (err) {
        console.error('Error fetching apartment by domain:', err);
        setError('Error loading apartment');
      }
      
      setLoading(false);
    };

    handleSubdomainRouting();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen p-8 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Domain Not Found</h1>
        <p className="text-gray-600 mb-4">{error}</p>
        <button 
          onClick={() => window.location.href = 'https://morence.top'}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Go to Main Site
        </button>
      </div>
    );
  }

  if (!apartmentSlug) {
    // Not on subdomain, let normal routing handle it
    return null;
  }

  // Render apartment detail with the found slug
  // Redirect to the apartment URL so normal routing takes over
  window.location.href = `/apartments/${apartmentSlug}`;
  
  return (
    <div className="flex justify-center items-center min-h-screen">
      <LoadingSpinner />
    </div>
  );
};

export default SubdomainRouter;
