import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { Home, Activity, Clock, MapPin,
    Utensils, Coffee, Beer, ShoppingBag, ShoppingCart, Landmark, TreePine, Mountain, Waves, Umbrella, Dumbbell, Bike,
    Car, Bus, Plane, Music, Star, Heart, Camera, Building2, Sun, Moon, Ticket, BookOpen, Leaf, Fish, Baby, Palette, Flame
} from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';

const ICON_MAP: Record<string, React.FC<{ size?: number; className?: string }>> = {
    Home, Activity, Clock, MapPin,
    Utensils, Coffee, Beer, Fish, ShoppingBag, ShoppingCart, Landmark, Building2, BookOpen, Palette,
    TreePine, Mountain, Waves, Umbrella, Leaf, Sun, Moon, Dumbbell, Bike, Car, Bus, Plane,
    Music, Ticket, Camera, Star, Heart, Flame, Baby,
};

function NavIcon({ name, size = 24, className }: { name?: string; size?: number; className?: string }) {
    const defaultIcon = name ? ICON_MAP[name] : null;
    const Icon = defaultIcon || Home;
    return <Icon size={size} className={className} />;
}

const BottomNavigation = () => {
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [customIcons, setCustomIcons] = useState<{ homeIcon?: string; activitiesIcon?: string; busScheduleIcon?: string }>({});

  const isAdminPage = location.pathname.startsWith('/admin');
  const isSurveyPage = location.pathname.startsWith('/survey');

  // Don't show on admin or survey pages
  if (isAdminPage || isSurveyPage) {
    return null;
  }

  // Extract apartment slug from URL to support context-aware navigation
  const apartmentSlugMatch = location.pathname.match(/\/apartments\/([^\/]+)/);
  const apartmentSlug = apartmentSlugMatch ? apartmentSlugMatch[1] : null;

  // Load custom icons from apartment data
  useEffect(() => {
    if (!apartmentSlug) return;

    const loadIcons = async () => {
      try {
        const apartmentsRef = collection(db, 'apartments');
        const q = query(apartmentsRef, where('slug', '==', apartmentSlug));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const apartmentDoc = querySnapshot.docs[0];
          const apartmentData = apartmentDoc.data();
          if (apartmentData.navigationIcons) {
            setCustomIcons(apartmentData.navigationIcons);
          }
        }
      } catch (error) {
        console.error('Error loading navigation icons:', error);
      }
    };

    loadIcons();
  }, [apartmentSlug]);

  // Determine navigation paths based on context
  const homePath = apartmentSlug ? `/apartments/${apartmentSlug}/brochure` : '/';
  const activitiesPath = apartmentSlug ? `/apartments/${apartmentSlug}/brochure/schedule` : '/places';
  const busSchedulePath = apartmentSlug ? `/apartments/${apartmentSlug}/brochure/bus-schedule` : '#';

  const navItems = [
    { label: 'home', icon: customIcons.homeIcon || 'Home', path: homePath, id: 'home' },
    { label: 'activities', icon: customIcons.activitiesIcon || 'Activity', path: activitiesPath, id: 'activities' },
    { label: 'busSchedule', icon: customIcons.busScheduleIcon || 'Clock', path: busSchedulePath, id: 'busSchedule' },
  ];

  const handleNavigation = (path: string) => {
    if (path !== '#') {
      navigate(path);
    }
  };

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') {
      return true;
    }
    if (path === '/places' && location.pathname === '/places') {
      return true;
    }
    // Check if on brochure main page (for home)
    if (path.endsWith('/brochure') && location.pathname.endsWith('/brochure')) {
      return true;
    }
    // Check if on brochure schedule page (for activities)
    if (path.endsWith('/schedule') && location.pathname.endsWith('/schedule')) {
      return true;
    }
    // Check if on bus schedule page
    if (path.endsWith('/bus-schedule') && location.pathname.endsWith('/bus-schedule')) {
      return true;
    }
    return false;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex justify-around items-center h-16 max-w-7xl mx-auto w-full">
        {navItems.map((item) => {
          const active = isActive(item.path);

          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.path)}
              className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${
                active
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              aria-label={t(item.label)}
              title={t(item.label)}
            >
              <NavIcon name={item.icon} size={24} />
              <span className="text-xs font-medium">{t(item.label)}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;
