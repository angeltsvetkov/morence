import { Link, useLocation, NavLink } from 'react-router-dom';
import { Waves, UserCog } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';
import LanguageSwitcher from '../LanguageSwitcher';
import { useState, useEffect } from 'react';
import { auth } from '../../firebase';
import { User } from 'firebase/auth';
import { getSubdomainInfo } from '../../utils/subdomain';

const Header = () => {
  const { t } = useLanguage();
  const [user, setUser] = useState<User | null>(null);
  const [activeSection, setActiveSection] = useState<string>('');
  const location = useLocation();
  const subdomainInfo = getSubdomainInfo();
  
  // We're on the main site's homepage if we're on root path AND not on a subdomain
  const isHomePage = location.pathname === '/' && !subdomainInfo.isSubdomain;
  
  // Consider it an apartment page if either:
  // 1. Traditional apartment URL (/apartments/...)
  // 2. Subdomain access (on subdomain and on root path)
  const isApartmentPage = location.pathname.startsWith('/apartments/') || 
                          (subdomainInfo.isSubdomain && location.pathname === '/');
  
  const [isVisible, setIsVisible] = useState(!isHomePage || isApartmentPage);

  useEffect(() => {
    // For apartment pages, visibility is controlled by the apartment page itself
    if (isApartmentPage) {
      return;
    }

    // For other pages (except main site home), the header should be visible immediately
    if (!isHomePage) {
      setIsVisible(true);
      return;
    }

    // This effect should only apply to the main site home page
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    // Set initial state for main site homepage
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
      rootMargin: '-10% 0px -30% 0px',
      threshold: [0, 0.1, 0.3, 0.5, 1.0]
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.1) {
          setActiveSection(entry.target.id);
        }
      });
    }, observerOptions);

    // Keep track of observed sections to avoid duplicates
    const observedSections = new Set<string>();

    // Wait for sections to be rendered
    const checkSections = () => {
      const offersSection = document.getElementById('offers-section');
      const amenitiesSection = document.getElementById('amenities-section');
      const availabilitySection = document.getElementById('availability-section');
      const gallerySection = document.getElementById('gallery-section');
      const placesSection = document.getElementById('places-section');

      // Observe sections as they become available
      if (offersSection && !observedSections.has('offers-section')) {
        observer.observe(offersSection);
        observedSections.add('offers-section');
      }
      if (amenitiesSection && !observedSections.has('amenities-section')) {
        observer.observe(amenitiesSection);
        observedSections.add('amenities-section');
      }
      if (availabilitySection && !observedSections.has('availability-section')) {
        observer.observe(availabilitySection);
        observedSections.add('availability-section');
      }
      if (gallerySection && !observedSections.has('gallery-section')) {
        observer.observe(gallerySection);
        observedSections.add('gallery-section');
      }
      if (placesSection && !observedSections.has('places-section')) {
        observer.observe(placesSection);
        observedSections.add('places-section');
      }

      // Continue checking if not all expected sections are found yet
      if (!amenitiesSection || !availabilitySection) {
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
                  <span className="relative z-10">{t('pricing')}</span>
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
      {/* Only add padding-top for pages that aren't the main site homepage or apartment pages */}
      {!isHomePage && !isApartmentPage && <div className="pt-16" />}
    </>
  );
};

export default Header;
