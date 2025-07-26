import { Link, useLocation, NavLink } from 'react-router-dom';
import { Waves, UserCog } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';
import LanguageSwitcher from '../LanguageSwitcher';
import { useState, useEffect } from 'react';
import { auth } from '../../firebase';
import { User } from 'firebase/auth';

const Header = () => {
  const { t } = useLanguage();
  const [user, setUser] = useState<User | null>(null);
  const [activeSection, setActiveSection] = useState<string>('');
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const isApartmentPage = location.pathname.startsWith('/apartments/');
  const [isVisible, setIsVisible] = useState(location.pathname !== '/' && !isApartmentPage);

  useEffect(() => {
    // For apartment pages, visibility is controlled by the apartment page itself
    if (isApartmentPage) {
      return;
    }

    // For other pages (except home), the header should be visible immediately
    if (!isHomePage) {
      setIsVisible(true);
      return;
    }

    // This effect should only apply to the home page
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    // Set initial state for homepage
    handleScroll();

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isHomePage, isApartmentPage]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Track active section on apartment pages
  useEffect(() => {
    if (!isApartmentPage) return;

    const observerOptions = {
      rootMargin: '-20% 0px -40% 0px',
      threshold: [0, 0.3, 0.6, 1.0]
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
          setActiveSection(entry.target.id);
        }
      });
    }, observerOptions);

    // Wait for sections to be rendered
    const checkSections = () => {
      const offersSection = document.getElementById('offers-section');
      const amenitiesSection = document.getElementById('amenities-section');
      const availabilitySection = document.getElementById('availability-section');
      const gallerySection = document.getElementById('gallery-section');
      const placesSection = document.getElementById('places-section');

      if (amenitiesSection && availabilitySection) {
        if (offersSection) {
          observer.observe(offersSection);
        }
        observer.observe(amenitiesSection);
        observer.observe(availabilitySection);
        if (gallerySection) {
          observer.observe(gallerySection);
        }
        if (placesSection) {
          observer.observe(placesSection);
        }
      } else {
        // Retry after a short delay if sections aren't ready
        setTimeout(checkSections, 100);
      }
    };

    checkSections();

    return () => {
      observer.disconnect();
    };
  }, [isApartmentPage]);

  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <>
      <header className={`hidden sm:block bg-white/80 backdrop-blur-lg border-b border-white/20 shadow-lg shadow-black/5 fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link to="/" className="group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <Waves className="relative w-8 h-8 text-blue-500 group-hover:text-blue-600 transition-colors duration-300 transform group-hover:scale-110" />
            </div>
          </Link>
          <nav className="flex items-center gap-2">
            {/* Section Navigation - Only on apartment pages, ordered by page flow */}
            {isApartmentPage ? (
              <div className="flex items-center gap-1 bg-white/60 backdrop-blur-sm rounded-full p-1 border border-white/40 shadow-lg shadow-black/5">
                <button
                  onClick={() => {
                    const section = document.getElementById('offers-section');
                    if (section) {
                      const offsetTop = section.offsetTop - 80; // Account for header height
                      window.scrollTo({ top: offsetTop, behavior: 'smooth' });
                    }
                  }}
                  className={`relative px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 transform ${
                    activeSection === 'offers-section'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25 scale-105'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/80 hover:shadow-md hover:scale-105'
                  }`}
                >
                  <span className="relative z-10">{t('specialOffers')}</span>
                  {activeSection === 'offers-section' && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full opacity-50 blur-sm"></div>
                  )}
                </button>
                <button
                  onClick={() => {
                    const section = document.getElementById('amenities-section');
                    if (section) {
                      const offsetTop = section.offsetTop - 80; // Account for header height
                      window.scrollTo({ top: offsetTop, behavior: 'smooth' });
                    }
                  }}
                  className={`relative px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 transform ${
                    activeSection === 'amenities-section'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25 scale-105'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/80 hover:shadow-md hover:scale-105'
                  }`}
                >
                  <span className="relative z-10">{t('amenities')}</span>
                  {activeSection === 'amenities-section' && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full opacity-50 blur-sm"></div>
                  )}
                </button>
                <button
                  onClick={() => {
                    const section = document.getElementById('availability-section');
                    if (section) {
                      const offsetTop = section.offsetTop - 80; // Account for header height
                      window.scrollTo({ top: offsetTop, behavior: 'smooth' });
                    }
                  }}
                  className={`relative px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 transform ${
                    activeSection === 'availability-section'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25 scale-105'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/80 hover:shadow-md hover:scale-105'
                  }`}
                >
                  <span className="relative z-10">{t('availability')}</span>
                  {activeSection === 'availability-section' && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full opacity-50 blur-sm"></div>
                  )}
                </button>
                <button
                  onClick={() => {
                    const section = document.getElementById('gallery-section');
                    if (section) {
                      const offsetTop = section.offsetTop - 80; // Account for header height
                      window.scrollTo({ top: offsetTop, behavior: 'smooth' });
                    }
                  }}
                  className={`relative px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 transform ${
                    activeSection === 'gallery-section'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25 scale-105'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/80 hover:shadow-md hover:scale-105'
                  }`}
                >
                  <span className="relative z-10">{t('gallery')}</span>
                  {activeSection === 'gallery-section' && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full opacity-50 blur-sm"></div>
                  )}
                </button>
                <button
                  onClick={() => {
                    const section = document.getElementById('places-section');
                    if (section) {
                      const offsetTop = section.offsetTop - 80; // Account for header height
                      window.scrollTo({ top: offsetTop, behavior: 'smooth' });
                    }
                  }}
                  className={`relative px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 transform ${
                    activeSection === 'places-section'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25 scale-105'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/80 hover:shadow-md hover:scale-105'
                  }`}
                >
                  <span className="relative z-10">{t('places')}</span>
                  {activeSection === 'places-section' && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full opacity-50 blur-sm"></div>
                  )}
                </button>
              </div>
            ) : (
              <NavLink 
                to="/places" 
                className={({ isActive }) => `
                  relative px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300 transform hover:scale-105
                  ${isActive 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25' 
                    : 'text-gray-600 hover:text-gray-900 bg-white/60 backdrop-blur-sm border border-white/40 hover:bg-white/80 hover:shadow-md'
                  }
                `}
              >
                <span className="relative z-10">{t('places')}</span>
                {/* Add glow effect for active state */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full opacity-0 hover:opacity-20 transition-opacity duration-300 blur-sm"></div>
              </NavLink>
            )}


            {user && (
              <Link 
                to="/admin" 
                className="group relative p-2.5 rounded-full bg-white/60 backdrop-blur-sm border border-white/40 hover:bg-white/80 hover:shadow-md transition-all duration-300 transform hover:scale-105"
              >
                <UserCog className="w-5 h-5 text-gray-600 group-hover:text-gray-900 transition-colors duration-300" />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-purple-500/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
              </Link>
            )}
            <LanguageSwitcher />
          </nav>
        </div>
      </header>
      {/* Only add padding-top for non-home and non-apartment pages */}
      {location.pathname !== '/' && !isApartmentPage && <div className="pt-16" />}
    </>
  );
};

export default Header;
