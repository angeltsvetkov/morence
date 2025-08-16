import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { getCurrentSubdomain } from '../utils/subdomain';
import LoadingSpinner from '../components/common/LoadingSpinner';

/**
 * Wrapper component that handles subdomain-based calendar routing
 * by redirecting to the proper apartment calendar URL structure
 */
const SubdomainCalendarWrapper: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const handleSubdomainCalendarRouting = async () => {
      const subdomain = getCurrentSubdomain();
      
      if (!subdomain) {
        // Not on a subdomain, redirect to main site
        window.location.href = 'https://morence.top';
        return;
      }

      try {
        // Fetch apartment by domain field
        const apartmentsRef = collection(db, "apartments");
        const q = query(apartmentsRef, where("domain", "==", subdomain));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const apartmentId = querySnapshot.docs[0].id;
          // Redirect to the proper calendar URL structure
          navigate(`/apartments/${apartmentId}/calendar`);
        } else {
          // No apartment found for this domain
          window.location.href = 'https://morence.top';
        }
      } catch (err) {
        console.error('Error fetching apartment by domain:', err);
        window.location.href = 'https://morence.top';
      }
      
      setLoading(false);
    };

    handleSubdomainCalendarRouting();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return null;
};

export default SubdomainCalendarWrapper;
