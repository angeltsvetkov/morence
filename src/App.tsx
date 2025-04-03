import { useState } from 'react';
import { MapPin, Waves, Wifi, Car, ChevronRight, ChevronLeft, X, Baby, Shield, Microwave, Coffee, Refrigerator, WashingMachine, Maximize2, Phone, Crosshair, Tv, Snowflake } from 'lucide-react';

function App() {
  const [selectedMonth, setSelectedMonth] = useState(new Date("2025-07-01"));
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);

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

  const weekDays = ['Нд', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

  type GalleryItem = {
    imagePath: string;
    title: string;
  };

  const galleryItems: GalleryItem[] = [
    {
      imagePath: 'photos/10040698_135550663_big.jpg',
      title: 'Двор'
    },
    {
      imagePath: 'photos/10040698_135550664_big.jpg',
      title: 'Хол с кухня'
    },
    {
      imagePath: 'photos/10040698_135550668_big.jpg',
      title: 'Хол'
    },
    {
      imagePath: 'photos/10040698_135550669_big.jpg',
      title: 'Хол'
    },
    {
      imagePath: 'photos/10040698_135550671_big.jpg',
      title: 'Хол'
    },
    {
      imagePath: 'photos/10040698_135550665_big.jpg',
      title: 'Спалня'
    },
    {
      imagePath: 'photos/10040698_135550685_big.jpg',
      title: 'Спалня с гардероб'
    },
    {
      imagePath: 'photos/10040698_135550666_big.jpg',
      title: 'Баня с душ кабина'
    },
    {
      imagePath: 'photos/10040698_135550667_big.jpg',
      title: 'Пералня'
    },
    {
      imagePath: 'photos/13.jpg',
      title: 'Централна пътека'
    },
    {
      imagePath: 'photos/Borissov-Green-Life-Apartment-Sozopol-Exterior.jpeg',
      title: 'Кръгъл басейн'
    },
    {
      imagePath: 'photos/green-life-beach-resort-appartment-sozopol-photo-9.jpeg',
      title: 'Кръгъл басейн'
    },
    {
      imagePath: 'photos/Green-Life-Sozopol-Antares-Hotel-Exterior.jpeg',
      title: 'Каскаден басейн'
    },
    {
      imagePath: 'photos/apartamenti-v-griin-laif-v-sozopol-7689577_116902639.jpg',
      title: 'Каскаден басейн'
    },
    {
      imagePath: 'photos/img-greenlife-beach-apartments-kavatzite-sozopol-9.jpeg',
      title: 'Детска площадка'
    }
  ];

  const handleImageClick = (imagePath: string) => {
    setSelectedImage(imagePath);
    setCurrentImageIndex(galleryItems.findIndex(item => item.imagePath === imagePath));
  };

  const handleNextImage = () => {
    const nextIndex = (currentImageIndex + 1) % galleryItems.length;
    setSelectedImage(galleryItems[nextIndex].imagePath);
    setCurrentImageIndex(nextIndex);
  };

  const handlePrevImage = () => {
    const prevIndex = (currentImageIndex - 1 + galleryItems.length) % galleryItems.length;
    setSelectedImage(galleryItems[prevIndex].imagePath);
    setCurrentImageIndex(prevIndex);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative min-h-[60vh] sm:h-[70vh] bg-cover bg-center" style={{ backgroundImage: 'url("/photos/10040698_135550664_big.jpg")' }}>
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/80" />
        <div className="relative h-full flex items-center justify-center py-12 sm:py-0">
          <div className="text-center text-white max-w-4xl px-4">
            <h1 className="text-4xl sm:text-6xl font-extrabold mb-4 sm:mb-6 text-shadow-2xl drop-shadow-2xl">С деца на Каваци</h1>
            <p className="text-xl sm:text-2xl font-semibold mb-6 sm:mb-8 text-shadow-xl drop-shadow-xl">Мястото, където децата играят, а родителите си почиват</p>
            <div className="flex flex-wrap justify-center gap-3 sm:gap-6 mb-6 sm:mb-8">
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-white/20">
                <span className="text-sm sm:text-base text-shadow-sm">Партерен етаж</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-white/20">
                <span className="text-sm sm:text-base text-shadow-sm">Хол с Кухня</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-white/20">
                <span className="text-sm sm:text-base text-shadow-sm">1 х Спалня</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-white/20">
                <span className="text-sm sm:text-base text-shadow-sm">Разтегателен диван</span>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-4 sm:p-6 rounded-xl mb-6 sm:mb-8 border border-white/20">
              <div className="text-3xl sm:text-4xl font-bold mb-2">150 лв. <span className='text-base sm:text-lg opacity-90'>/ нощувка</span></div>
              <div className="text-base sm:text-lg opacity-90">при повече от 14 нощувки</div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <a
                href='#overview'
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg shadow-lg text-sm sm:text-base"
              >
                Проверете свободни дати
              </a>
              <a href='#gallery' className="bg-white/20 hover:bg-white/30 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg border border-white shadow-lg text-sm sm:text-base">
                Галерия
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-6 rounded-lg">
              <Baby className="text-blue-600 mb-4 h-8 w-8" />
              <h3 className="text-xl font-semibold mb-2">Простор и безопасност за децата</h3>
              <p className="text-gray-600">Апартаментът се намира на партерен етаж с директен достъп до зелена поляна, където децата могат да играят спокойно, докато вие си почивате на терасата.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <Waves className="text-blue-600 mb-4 h-8 w-8" />
              <h3 className="text-xl font-semibold mb-2">Всичко на крачка разстояние</h3>
              <p className="text-gray-600">Два басейна, детски площадки, ресторант и тенис кортове са буквално на няколко метра – без нужда от шофиране.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <Shield className="text-blue-600 mb-4 h-8 w-8" />
              <h3 className="text-xl font-semibold mb-2">Спокойствие и сигурност</h3>
              <p className="text-gray-600">Комплексът Greenlife е ограден и охраняем, което го прави идеален за семейства, търсещи безопасна и тиха почивка.</p>
            </div>
          </div>
          <div className="mt-8 text-center">
            <a
              href="tel:+359883460715"
              className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
            >
              <Phone className="h-5 w-5" />
              Обадете се: +359883460715
            </a>
          </div>
        </div>
      </div>

      {/* Location Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Разположение</h2>
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-semibold mb-4">Greenlife Каваци</h3>
                <p className="text-gray-600 mb-6">
                  Апартаментът се намира в комплекса Greenlife Каваци, разположен в сърцето на курорта.
                  В непосредствена близост ще откриете:
                </p>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-center gap-2">
                    <MapPin className="text-blue-600" />
                    <span>2 минути пеша до плажа</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <MapPin className="text-blue-600" />
                    <span>Детски площадки в комплекса</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <MapPin className="text-blue-600" />
                    <span>5 басейна в комплекса</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <MapPin className="text-blue-600" />
                    <span>Ресторанти и магазини наблизо</span>
                  </li>
                </ul>
              </div>

              <div className="flex flex-col gap-4">
                <button
                  className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                  onClick={() => setIsMapFullscreen(true)}
                >
                  <Maximize2 className="h-5 w-5" />
                  Покажи карта на комплекса
                </button>
                <a
                  href="tel:+359883460715"
                  className="flex items-center justify-center gap-2 w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                >
                  <Phone className="h-5 w-5" />
                  Обадете се: +359883460715
                </a>
              </div>
            </div>
            <div className="relative rounded-xl overflow-hidden shadow-lg h-[600px] w-full">
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
          <div>
            <h2 className="text-3xl font-bold mb-6">Уютен семеен апартамент в сърцето на Greenlife Каваци – идеалното място за почивка с деца.</h2>
            <p className="text-gray-600 mb-6">
              Разположен на партерен етаж с директен излаз към зелена поляна, апартаментът предлага свобода за игра и спокойствие за родителите. В непосредствена близост ще откриете детски площадки, два басейна (от общо 5), ресторант, тенис кортове и прохладна горичка – всичко необходимо за безгрижна семейна ваканция на морето. Комфорт като у дома, само на крачка от плажа.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Microwave className="text-blue-600" />
                <span>Фурна</span>
              </div>
              <div className="flex items-center gap-2">
                <Refrigerator className="text-blue-600" />
                <span>Хладилник</span>
              </div>
              <div className="flex items-center gap-2">
                <Crosshair className="text-blue-600" />
                <span>Котлони</span>
              </div>
              <div className="flex items-center gap-2">
                <Coffee className="text-blue-600" />
                <span>Кафе машина</span>
              </div>
              <div className="flex items-center gap-2">
                <Tv className="text-blue-600" />
                <span>Телевизор</span>
              </div>
              <div className="flex items-center gap-2">
                <WashingMachine className="text-blue-600" />
                <span>Пералня</span>
              </div>
              <div className="flex items-center gap-2">
                <Snowflake className="text-blue-600" />
                <span>Климатик</span>
              </div>
              <div className="flex items-center gap-2">
                <Wifi className="text-blue-600" />
                <span>WiFi</span>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg">
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
                  <span>Свободни дати</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 bg-gray-100 border border-gray-300 rounded-full"></div>
                  <span>Заети дати</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Цени</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-semibold mb-2">До 14 Нощувки</h3>
                <p className="text-gray-600">Минимален престой: 3 нощувки</p>
              </div>
              <div className="bg-blue-50 p-6 rounded-lg text-center">
                <div className="text-4xl font-bold mb-2">200 лв.</div>
                <p className="text-gray-600">за нощувка</p>
              </div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-semibold mb-2">Над 14 Нощувки</h3>
                <p className="text-gray-600">Специални цени за дълъг престой - 25% отстъпка</p>
              </div>
              <div className="bg-green-50 p-6 rounded-lg text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">150 лв.</div>
                <p className="text-gray-600">за нощувка</p>
              </div>
            </div>
          </div>
        </div>
      </div>

        {/* Promo Offers Section */}
        <div className="mt-8 bg-white p-8 rounded-xl shadow-sm">
          <h3 className="text-2xl font-semibold text-center mb-8">Специални Оферти</h3>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="flex flex-col items-center gap-3 p-6  rounded-lg text-center">

            </div>
            <div className="flex flex-col items-center gap-3 p-6 bg-blue-50 rounded-lg text-center">
            <Car className="h-8 w-8 text-blue-600" />
              <div>
                <p className="font-medium text-lg">Безплатно паркомясто</p>
                <p className="text-sm text-gray-600">При ранно записване до 30 Април</p>
              </div>
            </div>
            <div className="flex flex-col items-center gap-3 p-6  rounded-lg text-center">
     
            </div>
          </div>
        </div>

        {/* Gallery Section */}
        <div id='gallery' className="mb-16">
          <h2 className="text-3xl font-bold mb-8">Галерия</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {galleryItems.map((item, index) => (
              <div
                key={index}
                className="relative group overflow-hidden rounded-xl cursor-pointer"
                onClick={() => handleImageClick(item.imagePath)}
              >
                <img
                  src={`/photos/${item.imagePath.split('/').pop()}`}
                  alt={item.title}
                  className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center flex-col">
                  <p className="text-white font-semibold">{item.title}</p>
                  <p className="text-white/80 text-sm mt-2">Кликни за преглед</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <a
              href="tel:+359883460715"
              className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
            >
              <Phone className="h-5 w-5" />
              Обадете се: +359883460715
            </a>
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
                alt="Галерия"
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

        {/* Reviews */}
        {/* <div>
          <h2 className="text-3xl font-bold mb-8">Отзиви от Гости</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="border p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-current" />
                  ))}
                </div>
                <span className="ml-2 text-gray-600">5.0</span>
              </div>
              <p className="text-gray-600 mb-4">
                "Невероятен апартамент със зашеметяваща гледка! Локацията е перфектна, а удобствата са от най-високо 
                качество. Със сигурност ще се върнем отново!"
              </p>
              <p className="font-semibold">Мария С.</p>
            </div>
            <div className="border p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-current" />
                  ))}
                </div>
                <span className="ml-2 text-gray-600">5.0</span>
              </div>
              <p className="text-gray-600 mb-4">
                "Перфектното място за почивка! Чисто, модерно и точно на плажа. Домакинът беше много отзивчив
                и направи престоя ни незабравим."
              </p>
              <p className="font-semibold">Михаил Р.</p>
            </div>
          </div>
        </div> */}
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">Свържете се с Нас</h3>
              <p className="text-gray-400">Имейл: angel@kavaci.com</p>
              <p className="text-gray-400">Телефон: +359 883 460 715</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">Локация</h3>
              <p className="text-gray-400">м.Каваци, Созопол</p>
            </div>
            {/* <div>
              <h3 className="text-xl font-semibold mb-4">Последвайте ни</h3>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition">Instagram</a>
                <a href="#" className="text-gray-400 hover:text-white transition">Facebook</a>
                <a href="#" className="text-gray-400 hover:text-white transition">Twitter</a>
              </div>
            </div> */}
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;