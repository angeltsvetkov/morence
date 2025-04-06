import { useState, useEffect } from 'react';
import { MapPin, Waves, Wifi, Car, ChevronRight, ChevronLeft, X, Baby, Shield, Microwave, Coffee, Refrigerator, WashingMachine, Maximize2, Phone, Crosshair, Tv, Snowflake, Clock, DoorClosed, CalendarX, DollarSign, PawPrint, Cigarette, Calendar, CalendarDays } from 'lucide-react';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { translations } from './translations';
import { LanguageSwitcher } from './components/LanguageSwitcher';

function AppContent() {
  const { language } = useLanguage();
  const [selectedMonth, setSelectedMonth] = useState(new Date("2025-07-01"));
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);

  // Add scroll animation
  useEffect(() => {
    const handleScroll = () => {
      const reveals = document.querySelectorAll('.reveal, .reveal-slide-left, .reveal-slide-right, .reveal-slide-up');
      
      reveals.forEach((reveal) => {
        const elementTop = reveal.getBoundingClientRect().top;
        const elementBottom = reveal.getBoundingClientRect().bottom;
        const isVisible = (elementTop < window.innerHeight - 100) && (elementBottom > 0);
        
        if (isVisible) {
          reveal.classList.add('active');
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const weekDays = translations.weekDays[language] as string[];
  const rooms = translations.rooms[language] as { [key: string]: string };

  // Helper function to get translated text
  const t = (key: keyof typeof translations) => {
    const value = translations[key][language];
    return typeof value === 'string' ? value : '';
  };

  // Mock available dates (in a real app, this would come from an API)
  const availableDates = [
    '2025-07-01', '2025-07-02', '2025-07-03',
    '2025-07-04', '2025-07-05', '2025-07-06',
    '2025-07-07', '2025-07-08', '2025-07-09',
    '2025-07-10', '2025-07-11', '2025-07-12',
    '2025-07-13', '2025-07-14', '2025-07-15',
    '2025-07-16', '2025-07-17', '2025-07-18',
    '2025-07-19', '2025-07-20', '2025-07-21',
    '2025-07-22', '2025-07-23', '2025-07-24',
    '2025-07-25', '2025-07-26', '2025-07-27',
    '2025-07-28', '2025-07-29', '2025-07-30',
    '2025-07-31', '2025-08-01', '2025-08-02',
    '2025-08-03', '2025-08-04', '2025-08-05',
    '2025-08-06', '2025-08-07', '2025-08-08',
    '2025-08-09', '2025-08-10', '2025-08-11',
    '2025-08-12', '2025-08-13', '2025-08-14',
    '2025-08-15', '2025-08-16', '2025-08-17',
    '2025-08-18', '2025-08-19', '2025-08-20',
    '2025-08-21', '2025-08-22', '2025-08-23',
    '2025-08-24', '2025-08-25', '2025-08-26',
    '2025-08-27', '2025-08-28', '2025-08-29',
    '2025-08-30', '2025-08-31'
  ];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    return { daysInMonth, firstDayOfMonth };
  };

  const isDateAvailable = (date: string) => availableDates.includes(date);

  const formatDate = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const nextMonth = () => {
    setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1));
  };

  const prevMonth = () => {
    setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1));
  };

  const monthNames = [
    'Януари', 'Февруари', 'Март', 'Април', 'Май', 'Юни',
    'Юли', 'Август', 'Септември', 'Октомври', 'Ноември', 'Декември'
  ];

  type GalleryItem = {
    path: string;
    title: string;
  };

  const galleryItems: GalleryItem[] = [
    {
      path: 'photos/viber_image_2025-04-06_20-35-45-040.jpg',
      title: rooms.front
    },
    {
      path: 'photos/10040698_135550663_big.jpg',
      title: rooms.yard
    },
    {
      path: 'photos/2025-04-06_20-35-43-912.jpg',
      title: rooms.front
    },
    {
      path: 'photos/viber_image_2025-04-06_20-35-42-461.jpg',
      title: rooms.front
    },
    {
      path: 'photos/10040698_135550664_big.jpg',
      title: rooms.livingRoomKitchen
    },
    {
      path: 'photos/10040698_135550668_big.jpg',
      title: rooms.livingRoom
    },
    {
      path: 'photos/10040698_135550669_big.jpg',
      title: rooms.livingRoom
    },
    {
      path: 'photos/10040698_135550671_big.jpg',
      title: rooms.livingRoom
    },
    {
      path: 'photos/10040698_135550665_big.jpg',
      title: rooms.bedroom
    },
    {
      path: 'photos/10040698_135550685_big.jpg',
      title: rooms.bedroom
    },
    {
      path: 'photos/10040698_135550666_big.jpg',
      title: rooms.bathroom
    },
    {
      path: 'photos/10040698_135550667_big.jpg',
      title: rooms.washingMachine
    },
    {
      path: 'photos/2025-04-06_20-35-40-941.jpg',
      title: rooms.cascadePool
    },
    {
      path: 'photos/2025-04-06_20-35-42-076.jpg',
      title: rooms.cascadePool
    },
    {
      path: 'photos/2025-04-06_20-35-44-094.jpg',
      title: rooms.cascadePool
    },
    {
      path: 'photos/viber_image_2025-04-06_20-35-41-890.jpg',
      title: rooms.roundPool
    },
    {
      path: 'photos/viber_image_2025-04-06_20-35-43-023.jpg',
      title: rooms.roundPool
    },
    {
      path: 'photos/viber_image_2025-04-06_20-35-43-206.jpg',
      title: rooms.roundPool
    },
    {
      path: 'photos/viber_image_2025-04-06_20-35-44-460.jpg',
      title: rooms.centralPath
    },
    {
      path: 'photos/viber_image_2025-04-06_20-35-43-389.jpg',
      title: rooms.beach
    },
    {
      path: 'photos/viber_image_2025-04-06_20-35-43-740.jpg',
      title: rooms.beach
    },
  ];

  const handleImageClick = (imagePath: string) => {
    setSelectedImage(imagePath);
    setCurrentImageIndex(galleryItems.findIndex(item => item.path === imagePath));
  };

  const handleNextImage = () => {
    const nextIndex = (currentImageIndex + 1) % galleryItems.length;
    setSelectedImage(galleryItems[nextIndex].path);
    setCurrentImageIndex(nextIndex);
  };

  const handlePrevImage = () => {
    const prevIndex = (currentImageIndex - 1 + galleryItems.length) % galleryItems.length;
    setSelectedImage(galleryItems[prevIndex].path);
    setCurrentImageIndex(prevIndex);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <LanguageSwitcher />
      
      {/* Fixed Call to Action Button - Always visible */}
      <div className="fixed bottom-6 right-6 z-40">
        <a
          href="tel:+359883460715"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
        >
          <Phone className="h-5 w-5" />
          <span className="hidden sm:inline">{t('callUs')}: </span>
          <span>+359883460715</span>
        </a>
      </div>

      {/* Hero Section */}
      <div className="relative min-h-[80vh] sm:h-[85vh] bg-cover bg-center bg-fixed motion-safe:animate-kenburns" style={{ backgroundImage: 'url("/photos/10040698_135550664_big.jpg")' }}>
        <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/50 to-black/90" />
        <div className="relative h-full flex items-center justify-center py-12 sm:py-0">
          <div className="text-center text-white max-w-4xl px-4 animate-fade-in">
            <div className="mb-8 inline-block">
              <div className="bg-blue-600/20 backdrop-blur-sm px-4 py-2 rounded-full border border-blue-400/30 mb-4 inline-block">
                <span className="text-blue-200 font-medium">2-стаем апартамент в затворен комплекс</span>
              </div>
            </div>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold mb-6 sm:mb-8 text-shadow-2xl drop-shadow-2xl bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
              {t('title')}
            </h1>
            <p className="text-xl sm:text-2xl lg:text-3xl font-semibold mb-8 sm:mb-10 text-shadow-xl drop-shadow-xl text-blue-100">
              {t('subtitle')}
            </p>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mb-8 sm:mb-10">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 sm:px-5 py-2 sm:py-2.5 rounded-full border border-white/20 hover:bg-white/20 transition-colors">
                <span className="text-sm sm:text-base text-shadow-sm">{t('groundFloor')}</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 sm:px-5 py-2 sm:py-2.5 rounded-full border border-white/20 hover:bg-white/20 transition-colors">
                <span className="text-sm sm:text-base text-shadow-sm">{t('livingRoomKitchen')}</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 sm:px-5 py-2 sm:py-2.5 rounded-full border border-white/20 hover:bg-white/20 transition-colors">
                <span className="text-sm sm:text-base text-shadow-sm">{t('bedroom')}</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 sm:px-5 py-2 sm:py-2.5 rounded-full border border-white/20 hover:bg-white/20 transition-colors">
                <span className="text-sm sm:text-base text-shadow-sm">{t('sofaBed')}</span>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-600/90 via-blue-500/90 to-blue-600/90 backdrop-blur-sm p-6 sm:p-8 rounded-2xl mb-8 sm:mb-10 border border-blue-400/30 transform hover:scale-105 transition-all duration-300 hover:shadow-[0_0_30px_rgba(37,99,235,0.3)] shadow-[0_0_20px_rgba(37,99,235,0.2)]">
              <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-10">
                <div className="text-center sm:text-left">
                  <div className="text-blue-100 text-sm sm:text-base mb-1">{t('standardPrice')}</div>
                  <div className="text-4xl sm:text-5xl font-bold text-white line-through opacity-80">
                    200 лв.
                  </div>
                  <div className="text-blue-100 text-sm mt-1">{t('perNight')}</div>
                </div>

                <div className="hidden sm:block w-px h-24 bg-blue-400/30"></div>

                <div className="text-center sm:text-left">
                  <div className="text-blue-100 text-sm sm:text-base mb-1">{t('discountedPrice')}</div>
                  <div className="text-5xl sm:text-6xl font-bold text-white">
                    150 лв.
                    <span className="text-base sm:text-lg text-blue-100 ml-2 font-normal">{t('perNight')}</span>
                  </div>
                  <div className="text-blue-100 text-sm sm:text-base font-medium mt-1">
                    {t('for14Nights')}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-blue-400/30">
                <div className="flex justify-between items-center text-sm sm:text-base text-blue-100">
                  <span>{t('totalSavings')}:</span>
                  <span className="font-bold text-white">350 лв. / {t('week')}</span>
                </div>
              </div>

              <div className="absolute -right-3 -top-3 bg-yellow-400 text-blue-900 px-4 py-1 rounded-full text-sm font-bold transform rotate-12 shadow-lg">
                -25%
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
              <a
                href='#overview'
                className="group bg-blue-600 hover:bg-blue-700 text-white px-8 sm:px-10 py-3 sm:py-4 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg shadow-lg text-base sm:text-lg relative overflow-hidden"
              >
                <span className="relative z-10">{t('checkAvailability')}</span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-800 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
              </a>
              <a 
                href='#gallery' 
                className="group bg-white/10 hover:bg-white/20 text-white px-8 sm:px-10 py-3 sm:py-4 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg border border-white/30 shadow-lg text-base sm:text-lg backdrop-blur-sm"
              >
                {t('gallery')}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-8 sm:mb-12 reveal-slide-up">
          {t('features')}
        </h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto stagger-children">
          <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow hover-lift">
            <div className="text-center mb-6">
              <Baby className="text-blue-600 mb-4 h-12 w-12 mx-auto" />
              <h3 className="text-2xl font-semibold mb-2">{t('spaceAndSafety')}</h3>
            </div>
            <p className="text-gray-600 text-center">{t('spaceAndSafetyDesc')}</p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow hover-lift">
            <div className="text-center mb-6">
              <Waves className="text-blue-600 mb-4 h-12 w-12 mx-auto" />
              <h3 className="text-2xl font-semibold mb-2">{t('everythingNearby')}</h3>
            </div>
            <p className="text-gray-600 text-center">{t('everythingNearbyDesc')}</p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow hover-lift">
            <div className="text-center mb-6">
              <Shield className="text-blue-600 mb-4 h-12 w-12 mx-auto" />
              <h3 className="text-2xl font-semibold mb-2">{t('peaceAndSecurity')}</h3>
            </div>
            <p className="text-gray-600 text-center">{t('peaceAndSecurityDesc')}</p>
          </div>
        </div>
      </div>

      {/* Gallery Section */}
      <div id='gallery' className="mb-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 reveal-slide-up"></h2>
          <div className="grid md:grid-cols-3 gap-6 stagger-children">
            {galleryItems.map((item, index) => (
              <div
                key={index}
                className="relative group overflow-hidden rounded-xl cursor-pointer hover-scale"
                onClick={() => handleImageClick(item.path)}
              >
                <img
                  src={item.path}
                  alt={item.title}
                  className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center flex-col">
                  <p className="text-white font-semibold">{item.title}</p>
                  <p className="text-white/80 text-sm mt-2">{t('clickToView')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Location Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center reveal-slide-up">{t('location')}</h2>
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-8 reveal-slide-left">
              <div>
                <h3 className="text-2xl font-semibold mb-4">{t('greenlifeKavaci')}</h3>
                <p className="text-gray-600 mb-6">
                  {t('locationDesc')}
                  {t('nearby')}
                </p>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-center gap-2">
                    <MapPin className="text-blue-600" />
                    <span>{t('beach')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <MapPin className="text-blue-600" />
                    <span>{t('playgrounds')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <MapPin className="text-blue-600" />
                    <span>{t('pools')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <MapPin className="text-blue-600" />
                    <span>{t('restaurants')}</span>
                  </li>
                </ul>
              </div>

              <div className="flex flex-col gap-4">
                <button
                  className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                  onClick={() => setIsMapFullscreen(true)}
                >
                  <Maximize2 className="h-5 w-5" />
                  {t('showMap')}
                </button>
              </div>
            </div>
            <div className="relative rounded-xl overflow-hidden shadow-lg h-[600px] w-full reveal-slide-right">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3437.942389736797!2d27.70108999857333!3d42.38924153115056!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zNDLCsDIzJzE1LjEiTiAyN8KwNDInMDMuNSJF!5e1!3m2!1sbg!2sbg!4v1743623725947!5m2!1sbg!2sbg"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="rounded-xl"
              ></iframe>
            </div>
          </div>
        </div>
      </div>

      {/* Map Fullscreen Modal */}
      {isMapFullscreen && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setIsMapFullscreen(false)}
        >
          <div className="relative max-w-7xl w-full h-full flex items-center justify-center">
            <img
              src="/photos/map.jpg"
              alt="Карта на разположението на Greenlife Каваци"
              className="max-w-full max-h-full object-contain"
            />
            <button
              className="absolute top-4 right-4 bg-white/80 hover:bg-white p-2 rounded-full transition-all duration-300"
              onClick={() => setIsMapFullscreen(false)}
            >
              <X className="h-6 w-6 text-gray-700" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div id='overview' className="max-w-7xl mx-auto px-4 py-16">
        {/* Overview */}
        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <div className="reveal-slide-left">
            <h2 className="text-3xl font-bold mb-6">{t('overviewTitle')}</h2>
            <p className="text-gray-600 mb-6">
              {t('overviewDesc')}
            </p>
            <div className="grid grid-cols-2 gap-4 stagger-children">
              <div className="flex items-center gap-2">
                <Microwave className="text-blue-600" />
                <span>{rooms.oven}</span>
              </div>
              <div className="flex items-center gap-2">
                <Refrigerator className="text-blue-600" />
                <span>{rooms.fridge}</span>
              </div>
              <div className="flex items-center gap-2">
                <Crosshair className="text-blue-600" />
                <span>{rooms.fireplace}</span>
              </div>
              <div className="flex items-center gap-2">
                <Coffee className="text-blue-600" />
                <span>{rooms.coffeeMachine}</span>
              </div>
              <div className="flex items-center gap-2">
                <Tv className="text-blue-600" />
                <span>{rooms.tv}</span>
              </div>
              <div className="flex items-center gap-2">
                <WashingMachine className="text-blue-600" />
                <span>{rooms.washingMachine}</span>
              </div>
              <div className="flex items-center gap-2">
                <Snowflake className="text-blue-600" />
                <span>{rooms.airConditioner}</span>
              </div>
              <div className="flex items-center gap-2">
                <Wifi className="text-blue-600" />
                <span>{rooms.wifi}</span>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg reveal-slide-right">
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <button onClick={prevMonth} className="p-2 hover:bg-gray-200 rounded-full">
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <h4 className="text-lg font-medium">
                  {monthNames[selectedMonth.getMonth()]} {selectedMonth.getFullYear()}
                </h4>
                <button onClick={nextMonth} className="p-2 hover:bg-gray-200 rounded-full">
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
              <div className="grid grid-cols-7 gap-1">
                {weekDays.map(day => (
                  <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
                    {day}
                  </div>
                ))}
                {[...Array(getDaysInMonth(selectedMonth).firstDayOfMonth)].map((_, i) => (
                  <div key={`empty-${i}`} className="h-10" />
                ))}
                {[...Array(getDaysInMonth(selectedMonth).daysInMonth)].map((_, i) => {
                  const date = formatDate(selectedMonth.getFullYear(), selectedMonth.getMonth(), i + 1);
                  const available = isDateAvailable(date);
                  return (
                    <div
                      key={i}
                      className={`h-10 flex items-center justify-center relative ${available
                        ? 'bg-blue-50 text-blue-600 cursor-pointer hover:bg-blue-100'
                        : 'bg-gray-100 text-gray-400'
                        }`}
                    >
                      <span>{i + 1}</span>
                      {available && (
                        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                          <div className="h-1 w-1 bg-blue-600 rounded-full"></div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 bg-blue-50 border border-blue-600 rounded-full"></div>
                  <span>{t('availableDates')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 bg-gray-100 border border-gray-300 rounded-full"></div>
                  <span>{t('bookedDates')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Section */}
        <div className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 reveal-slide-up">{t('pricing')}</h2>
            <div className="grid md:grid-cols-2 gap-8 stagger-children">
              <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow hover-lift">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-semibold mb-2">{t('upTo14Nights')}</h3>
                  <p className="text-gray-600">{t('minStay')}</p>
                </div>
                <div className="bg-blue-50 p-6 rounded-lg text-center">
                  <div className="text-4xl font-bold mb-2">200 лв.</div>
                  <p className="text-gray-600">{t('perNightPrice')}</p>
                </div>
              </div>

              <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow hover-lift">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-semibold mb-2">{t('over14Nights')}</h3>
                  <p className="text-gray-600">{t('specialPricing')}</p>
                </div>
                <div className="bg-green-50 p-6 rounded-lg text-center">
                  <div className="text-4xl font-bold text-green-600 mb-2">150 лв.</div>
                  <p className="text-gray-600">{t('perNightPrice')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Promo Offers Section */}
        <div className="mt-8 bg-gradient-to-br from-blue-600 to-blue-800 p-8 sm:p-12 rounded-xl shadow-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-white/[0.1] bg-[size:20px_20px]"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-blue-600/50 to-transparent"></div>
          
          <h3 className="text-2xl sm:text-3xl font-semibold text-center mb-12 text-white relative reveal-slide-up">
            {t('specialOffers')}
          </h3>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto relative stagger-children">

            <div className="group bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20 hover-lift cursor-pointer transition-all duration-300 hover:bg-white/20">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-blue-500/20 rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                  <Car className="h-8 w-8 text-blue-100" />
                </div>
                <p className="font-medium text-lg text-white">
                  {t('earlyBooking')}
                </p>
                <p className="text-sm text-blue-100">
                  {t('freeParkingDesc')}
                </p>
                <div className="text-xl font-bold text-yellow-400">
                  {t('included')}
                </div>
              </div>
            </div>

            <div className="group bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20 hover-lift cursor-pointer transition-all duration-300 hover:bg-white/20">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-blue-500/20 rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                  <CalendarDays className="h-8 w-8 text-blue-100" />
                </div>
                <p className="font-medium text-lg text-white">
                  {t('longStay')}
                </p>
                <p className="text-sm text-blue-100">
                  {t('longStayDesc')}
                </p>
                <div className="text-2xl font-bold text-yellow-400">-25%</div>
              </div>
            </div>
          </div>

          <div className="absolute -left-12 -bottom-8 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl"></div>
          <div className="absolute -right-12 -top-8 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl"></div>
        </div>

        {/* Rules Section */}
        <div className="mt-16 bg-white p-8 rounded-xl shadow-sm">
          <h3 className="text-2xl font-semibold text-center mb-8 reveal-slide-up">{t('rulesTitle')}</h3>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-5xl mx-auto stagger-children">
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-5 w-5 text-blue-600" />
                <h4 className="font-semibold text-lg">{t('depositRule')}</h4>
              </div>
              <p className="text-gray-600">{t('depositDesc')}</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-5 w-5 text-blue-600" />
                <h4 className="font-semibold text-lg">{t('minStayRule')}</h4>
              </div>
              <p className="text-gray-600">{t('minStayDesc')}</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <DoorClosed className="h-5 w-5 text-blue-600" />
                <h4 className="font-semibold text-lg">{t('checkInRule')}</h4>
              </div>
              <p className="text-gray-600">{t('checkInDesc')}</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <DoorClosed className="h-5 w-5 text-blue-600" />
                <h4 className="font-semibold text-lg">{t('checkOutRule')}</h4>
              </div>
              <p className="text-gray-600">{t('checkOutDesc')}</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CalendarX className="h-5 w-5 text-blue-600" />
                <h4 className="font-semibold text-lg">{t('cancellationRule')}</h4>
              </div>
              <p className="text-gray-600">{t('cancellationDesc')}</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <PawPrint className="h-5 w-5 text-blue-600" />
                <h4 className="font-semibold text-lg">{t('petsRule')}</h4>
              </div>
              <p className="text-gray-600">{t('petsDesc')}</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Cigarette className="h-5 w-5 text-blue-600" />
                <h4 className="font-semibold text-lg">{t('smokingRule')}</h4>
              </div>
              <p className="text-gray-600">{t('smokingDesc')}</p>
            </div>
          </div>
        </div>

        {/* Image Fullscreen Modal */}
        {selectedImage && (
          <div
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setSelectedImage(null);
              }
            }}
          >
            <div className="relative max-w-7xl w-full h-full flex items-center justify-center">
              <button
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full transition-all duration-300 z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevImage();
                }}
              >
                <ChevronLeft className="h-6 w-6 text-gray-700" />
              </button>

              <img
                src={selectedImage}
                alt={t('gallery')}
                className="max-w-full max-h-full object-contain"
              />

              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full transition-all duration-300 z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNextImage();
                }}
              >
                <ChevronRight className="h-6 w-6 text-gray-700" />
              </button>

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/80 px-4 py-2 rounded-full text-gray-700 font-medium">
                {currentImageIndex + 1} / {galleryItems.length}
              </div>

              <button
                className="absolute top-4 right-4 bg-white/80 hover:bg-white p-2 rounded-full transition-all duration-300"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImage(null);
                }}
              >
                <X className="h-6 w-6 text-gray-700" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">{t('contactUs')}</h3>
              <p className="text-gray-400">{t('phone')}: +359 883 460 715</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">{t('location')}</h3>
              <p className="text-gray-400">{t('address')}</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

export default App;