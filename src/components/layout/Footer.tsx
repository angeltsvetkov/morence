import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase';
import { useLanguage } from '../../hooks/useLanguage';
import { Language } from '../../contexts/LanguageContext';
import { getCurrentSubdomain } from '../../utils/subdomain';

interface Apartment {
  id: string;
  contactPhone?: string;
  contactEmail?: string;
  contacts?: {
    [key in Language]?: {
      name: string;
    }
  };
  address?: {
    [key in Language]?: string;
  };
}

const Footer = () => {
  const { t, language } = useLanguage();
  const location = useLocation();
  const [apartmentPhone, setApartmentPhone] = useState<string | null>(null);
  const [apartmentEmail, setApartmentEmail] = useState<string | null>(null);
  const [apartmentAddress, setApartmentAddress] = useState<string | null>(null);

  // Helper function to get apartment address
  const getApartmentAddress = (apartment: Apartment): string | null => {
    if (!apartment?.address) return null;
    
    // Try current language first, then fallback to other languages
    const currentLangAddress = apartment.address[language];
    if (currentLangAddress) {
      return currentLangAddress;
    }
    
    // Fallback to any available address
    const allAddresses = Object.values(apartment.address);
    for (const address of allAddresses) {
      if (address) {
        return address;
      }
    }
    
    return null;
  };

  useEffect(() => {
    const fetchApartmentPhone = async () => {
      let apartmentSlug = null;
      let isSubdomainAccess = false;
      
      // Check if we're on a traditional apartment page (/apartments/slug)
      const apartmentMatch = location.pathname.match(/^\/apartments\/([^\/]+)/);
      if (apartmentMatch) {
        apartmentSlug = apartmentMatch[1];
      } else {
        // Check if we're on a subdomain apartment page (apartment-name.morence.top/)
        const subdomain = getCurrentSubdomain();
        if (subdomain && location.pathname === '/') {
          apartmentSlug = subdomain;
          isSubdomainAccess = true;
        }
      }
      
      if (apartmentSlug) {
        try {
          const apartmentsCollection = collection(db, 'apartments');
          let apartmentQuery;
          let querySnapshot;
          
          if (isSubdomainAccess) {
            // For subdomain access, search by domain field
            apartmentQuery = query(apartmentsCollection, where('domain', '==', apartmentSlug));
            querySnapshot = await getDocs(apartmentQuery);
          } else {
            // For traditional access, search by slug first, then by ID
            apartmentQuery = query(apartmentsCollection, where('slug', '==', apartmentSlug));
            querySnapshot = await getDocs(apartmentQuery);
            
            // If not found by slug, try by ID
            if (querySnapshot.empty) {
              apartmentQuery = query(apartmentsCollection, where('__name__', '==', apartmentSlug));
              querySnapshot = await getDocs(apartmentQuery);
            }
          }
          
          if (!querySnapshot.empty) {
            const apartmentDoc = querySnapshot.docs[0];
            const apartmentData = { id: apartmentDoc.id, ...apartmentDoc.data() } as Apartment;
            setApartmentPhone(apartmentData.contactPhone || null);
            setApartmentEmail(apartmentData.contactEmail || null);
            const address = getApartmentAddress(apartmentData);
            setApartmentAddress(address);
          }
        } catch (error) {
          console.error('Error fetching apartment data for footer:', error);
        }
      } else {
        // Reset phone and address when not on apartment page
        setApartmentPhone(null);
        setApartmentEmail(null);
        setApartmentAddress(null);
      }
    };

    fetchApartmentPhone();
  }, [location.pathname, language]);

  // Use apartment phone if available, otherwise fallback to hardcoded
  const displayPhone = apartmentPhone;

  return (
    <footer className="bg-white mt-16 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className={`grid gap-8 ${apartmentAddress ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
          <div>
            <h3 className="text-xl font-semibold mb-4">{t('contactUs')}</h3>
            <p className="text-gray-400">{t('phone')}: {displayPhone}</p>
            {apartmentEmail && <p className="text-gray-400">{t('email')}: {apartmentEmail}</p>}
          </div>
          {apartmentAddress && (
            <div>
              <h3 className="text-xl font-semibold mb-4">{t('location')}</h3>
              <p className="text-gray-400">{apartmentAddress}</p>
            </div>
          )}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
