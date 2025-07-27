import { Helmet } from 'react-helmet-async';
import { Apartment } from '../types';
import { useLanguage } from '../hooks/useLanguage';

interface SocialMetaTagsProps {
    apartment: Apartment;
}

const SocialMetaTags: React.FC<SocialMetaTagsProps> = ({ apartment }) => {
    const { language } = useLanguage();

    // Get apartment name in current language
    const getApartmentName = (apartment: Apartment): string => {
        if (typeof apartment.name === 'string') {
            return apartment.name;
        }
        return apartment.name?.[language] || apartment.name?.en || apartment.name?.bg || 'Apartment';
    };

    // Get apartment description in current language
    const getApartmentDescription = (apartment: Apartment): string => {
        if (typeof apartment.description === 'string') {
            return apartment.description;
        }
        return apartment.description?.[language] || apartment.description?.en || apartment.description?.bg || '';
    };

    // Get social sharing data with fallbacks
    const ogTitle = apartment.socialSharing?.ogTitle?.[language] || 
                   apartment.socialSharing?.ogTitle?.en || 
                   apartment.socialSharing?.ogTitle?.bg || 
                   getApartmentName(apartment);

    const ogDescription = apartment.socialSharing?.ogDescription?.[language] ||
                         apartment.socialSharing?.ogDescription?.en ||
                         apartment.socialSharing?.ogDescription?.bg ||
                         getApartmentDescription(apartment);

    const ogImage = apartment.socialSharing?.ogImage || 
                   apartment.heroImage || 
                   apartment.photos?.[0] || 
                   '';

    const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://yoursite.com';
    const currentUrl = `${siteUrl}/apartments/${apartment.slug}`;

    return (
        <Helmet>
            {/* Basic Open Graph tags */}
            <meta property="og:type" content="website" />
            <meta property="og:title" content={ogTitle} />
            <meta property="og:description" content={ogDescription} />
            <meta property="og:url" content={currentUrl} />
            {ogImage && <meta property="og:image" content={ogImage} />}
            {ogImage && <meta property="og:image:alt" content={ogTitle} />}
            
            {/* Twitter Card tags */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={ogTitle} />
            <meta name="twitter:description" content={ogDescription} />
            {ogImage && <meta name="twitter:image" content={ogImage} />}
            
            {/* Additional meta tags */}
            <meta name="description" content={ogDescription} />
            <title>{ogTitle}</title>
            
            {/* WhatsApp specific (uses Open Graph) */}
            <meta property="og:site_name" content="Apartment Rental" />
            
            {/* LinkedIn specific */}
            <meta property="og:locale" content={language === 'bg' ? 'bg_BG' : 'en_US'} />
            
            {/* Schema.org for rich snippets */}
            <script type="application/ld+json">
                {JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "Accommodation",
                    "name": ogTitle,
                    "description": ogDescription,
                    "url": currentUrl,
                    ...(ogImage && { "image": ogImage }),
                    "address": {
                        "@type": "PostalAddress",
                        "addressLocality": apartment.location?.[language] || apartment.location?.en || apartment.location?.bg
                    }
                })}
            </script>
        </Helmet>
    );
};

export default SocialMetaTags; 