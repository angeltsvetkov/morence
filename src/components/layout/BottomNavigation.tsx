import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Activity, Clock } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';

const BottomNavigation = () => {
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  const isAdminPage = location.pathname.startsWith('/admin');
  const isSurveyPage = location.pathname.startsWith('/survey');

  // Don't show on admin or survey pages
  if (isAdminPage || isSurveyPage) {
    return null;
  }

  // Extract apartment slug from URL to support context-aware navigation
  const apartmentSlugMatch = location.pathname.match(/\/apartments\/([^\/]+)/);
  const apartmentSlug = apartmentSlugMatch ? apartmentSlugMatch[1] : null;

  // Determine navigation paths based on context
  const homePath = apartmentSlug ? `/apartments/${apartmentSlug}/brochure` : '/';
  const activitiesPath = apartmentSlug ? `/apartments/${apartmentSlug}/brochure/schedule` : '/places';
  const busSchedulePath = apartmentSlug ? `/apartments/${apartmentSlug}/brochure/bus-schedule` : '#';

  const navItems = [
    { label: 'home', icon: Home, path: homePath, id: 'home' },
    { label: 'activities', icon: Activity, path: activitiesPath, id: 'activities' },
    { label: 'busSchedule', icon: Clock, path: busSchedulePath, id: 'busSchedule' },
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
          const Icon = item.icon;
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
              <Icon size={24} />
              <span className="text-xs font-medium">{t(item.label)}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;
