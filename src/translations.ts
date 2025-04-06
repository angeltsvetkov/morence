export type Language = 'bg' | 'en';

export type TranslationValue = string | string[] | { [key: string]: string };

export type Translations = {
  [key: string]: {
    bg: TranslationValue;
    en: TranslationValue;
  };
};

export const translations: Translations = {
  title: {
    bg: 'С деца на Каваци',
    en: 'With Kids in Kavaci'
  },
  subtitle: {
    bg: 'Мястото, където децата играят, а родителите си почиват',
    en: 'Where kids play and parents relax'
  },
  groundFloor: {
    bg: 'Партерен етаж',
    en: 'Ground Floor'
  },
  livingRoomKitchen: {
    bg: 'Хол с Кухня',
    en: 'Living Room with Kitchen'
  },
  bedroom: {
    bg: '1 х Спалня',
    en: '1 Bedroom'
  },
  sofaBed: {
    bg: 'Разтегателен диван',
    en: 'Sofa Bed'
  },
  perNight: {
    bg: '/ нощувка',
    en: '/ night'
  },
  for14Nights: {
    bg: 'при повече от 14 нощувки',
    en: 'for stays longer than 14 nights'
  },
  checkAvailability: {
    bg: 'Вижте свободните дати',
    en: 'Check Availability'
  },
  gallery: {
    bg: 'Галерия',
    en: 'Gallery'
  },
  features: {
    bg: 'Удобства',
    en: 'Features'
  },
  spaceAndSafety: {
    bg: 'Простор и безопасност за децата',
    en: 'Space and Safety for Kids'
  },
  spaceAndSafetyDesc: {
    bg: 'Апартаментът се намира на партерен етаж с директен достъп до зелена поляна, където децата могат да играят спокойно, докато вие си почивате на терасата.',
    en: 'The apartment is located on the ground floor with direct access to a green lawn where children can play safely while you relax on the terrace.'
  },
  everythingNearby: {
    bg: 'Всичко на крачка разстояние',
    en: 'Everything Within Walking Distance'
  },
  everythingNearbyDesc: {
    bg: 'Два басейна, детски площадки, ресторант и тенис кортове са буквално на няколко метра – без нужда от шофиране.',
    en: 'Two pools, playgrounds, restaurant, and tennis courts are just a few meters away – no need to drive.'
  },
  peaceAndSecurity: {
    bg: 'Спокойствие и сигурност',
    en: 'Peace and Security'
  },
  peaceAndSecurityDesc: {
    bg: 'Комплексът е ограден и охраняем, което го прави идеален за семейства, търсещи безопасна и тиха почивка.',
    en: 'The complex is fenced and guarded, making it ideal for families seeking a safe and quiet vacation.'
  },
  callUs: {
    bg: 'Обадете се',
    en: 'Call Us'
  },
  location: {
    bg: 'Разположение',
    en: 'Location'
  },
  greenlifeKavaci: {
    bg: 'Затворен комплекс в Каваци',
    en: 'Premium resort in Kavaci'
  },
  locationDesc: {
    bg: 'Апартаментът се намира в затворен комплекс в Каваци, разположен в сърцето на курорта.',
    en: 'The apartment is located in a premium resort in Kavaci, situated in the heart of the resort.'
  },
  nearby: {
    bg: 'В непосредствена близост ще откриете:',
    en: 'Nearby you will find:'
  },
  beach: {
    bg: '2 минути пеша до плажа',
    en: '2 minutes walk to the beach'
  },
  playgrounds: {
    bg: 'Детски площадки в комплекса',
    en: 'Playgrounds in the complex'
  },
  pools: {
    bg: '5 басейна в комплекса',
    en: '5 pools in the complex'
  },
  restaurants: {
    bg: 'Ресторанти и магазини наблизо',
    en: 'Restaurants and shops nearby'
  },
  showMap: {
    bg: 'Покажи карта на комплекса',
    en: 'Show Complex Map'
  },
  overview: {
    bg: 'Преглед',
    en: 'Overview'
  },
  overviewTitle: {
    bg: 'Уютен семеен апартамент в сърцето на Каваци – идеалното място за почивка с деца.',
    en: 'A cozy family apartment in the heart of Kavaci – the perfect place for a vacation with children.'
  },
  overviewDesc: {
    bg: 'Разположен на партерен етаж с директен излаз към зелена поляна, апартаментът предлага свобода за игра и спокойствие за родителите. В непосредствена близост ще откриете детски площадки, два басейна (от общо 5), ресторант, тенис кортове и прохладна горичка – всичко необходимо за безгрижна семейна ваканция на морето. Комфорт като у дома, само на крачка от плажа.',
    en: 'Located on the ground floor with direct access to a green lawn, the apartment offers freedom for play and peace for parents. Nearby you will find playgrounds, two pools (out of 5 total), a restaurant, tennis courts, and a cool forest – everything needed for a carefree family vacation by the sea. Home-like comfort, just steps from the beach.'
  },
  oven: {
    bg: 'Фурна',
    en: 'Oven'
  },
  fridge: {
    bg: 'Хладилник',
    en: 'Refrigerator'
  },
  pots: {
    bg: 'Котлони',
    en: 'Pots'
  },
  coffeeMachine: {
    bg: 'Кафе машина',
    en: 'Coffee Machine'
  },
  tv: {
    bg: 'Телевизор',
    en: 'TV'
  },
  washingMachine: {
    bg: 'Пералня',
    en: 'Washing Machine'
  },
  airConditioning: {
    bg: 'Климатик',
    en: 'Air Conditioning'
  },
  wifi: {
    bg: 'WiFi',
    en: 'WiFi'
  },
  pricing: {
    bg: 'Цени',
    en: 'Pricing'
  },
  upTo14Nights: {
    bg: 'До 14 Нощувки',
    en: 'Up to 14 Nights'
  },
  minStay: {
    bg: 'Минимален престой: 3 нощувки',
    en: 'Minimum stay: 3 nights'
  },
  over14Nights: {
    bg: 'Над 14 Нощувки',
    en: 'Over 14 Nights'
  },
  specialPricing: {
    bg: 'Специални цени за дълъг престой - 25% отстъпка',
    en: 'Special prices for long stays - 25% discount'
  },
  perNightPrice: {
    bg: 'за нощувка',
    en: 'per night'
  },
  specialOffers: {
    bg: 'Специални Оферти',
    en: 'Special Offers'
  },
  freeParking: {
    bg: 'Безплатно паркомясто',
    en: 'Free Parking'
  },
  earlyBooking: {
    bg: 'При ранно записване до 30 Април',
    en: 'For Early Booking until April 30th'
  },
  clickToView: {
    bg: 'Кликни за преглед',
    en: 'Click to view'
  },
  contactUs: {
    bg: 'Свържете се с Нас',
    en: 'Contact Us'
  },
  email: {
    bg: 'Имейл',
    en: 'Email'
  },
  phone: {
    bg: 'Телефон',
    en: 'Phone'
  },
  address: {
    bg: 'м.Каваци, Созопол',
    en: 'Kavaci, Sozopol'
  },
  months: {
    bg: ['Януари', 'Февруари', 'Март', 'Април', 'Май', 'Юни', 'Юли', 'Август', 'Септември', 'Октомври', 'Ноември', 'Декември'],
    en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  },
  weekDays: {
    bg: ['Нд', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
    en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  },
  rooms: {
    bg: {
      yard: 'Двор',
      beach: 'Плаж',
      livingRoomKitchen: 'Хол с кухня',
      livingRoom: 'Хол',
      bedroom: 'Спалня',
      bathroom: 'Баня',
      washingMachine: 'Пералня',
      centralPath: 'Красива пътека',
      roundPool: 'Кръгъл басейн',
      front: "Зелена поляна",
      cascadePool: 'Каскаден басейн',
      playground: 'Детска площадка',
      oven: 'Фурна',
      fridge: 'Хладилник',
      fireplace: 'Котлони',
      coffeeMachine: 'Кафе машина',
      tv: 'Телевизор',
      airConditioner: 'Климатик',
      wifi: 'WiFi'
    },
    en: {
      yard: 'Yard',
      beach: 'Beach',
      livingRoomKitchen: 'Living Room with Kitchen',
      livingRoom: 'Living Room',
      bedroom: 'Bedroom',
      bathroom: 'Bathroom',
      washingMachine: 'Washing Machine',
      centralPath: 'Beautiful Path',
      roundPool: 'Round Pool',
      front: "Green Lawn",
      cascadePool: 'Cascade Pool',
      playground: 'Playground',
      oven: 'Oven',
      fridge: 'Refrigerator',
      fireplace: 'Fireplace',
      coffeeMachine: 'Coffee Machine',
      tv: 'TV',
      airConditioner: 'Air Conditioner',
      wifi: 'WiFi'
    }
  },
  availableDates: {
    bg: 'Свободни дати',
    en: 'Available Dates'
  },
  bookedDates: {
    bg: 'Заети дати',
    en: 'Booked Dates'
  },
  rulesTitle: {
    bg: 'Правила за резервация',
    en: 'Reservation Rules'
  },
  depositRule: {
    bg: 'Депозит',
    en: 'Deposit'
  },
  depositDesc: {
    bg: '30% от общата сума при резервация',
    en: '30% of the total amount upon reservation'
  },
  minStayRule: {
    bg: 'Минимален престой',
    en: 'Minimum Stay'
  },
  minStayDesc: {
    bg: '7 нощувки в активен сезон',
    en: '7 nights during peak season'
  },
  checkInRule: {
    bg: 'Настаняване',
    en: 'Check-in'
  },
  checkInDesc: {
    bg: 'След 15:00 часа',
    en: 'After 3:00 PM'
  },
  checkOutRule: {
    bg: 'Напускане',
    en: 'Check-out'
  },
  checkOutDesc: {
    bg: 'До 11:00 часа',
    en: 'Before 11:00 AM'
  },
  cancellationRule: {
    bg: 'Анулации',
    en: 'Cancellation'
  },
  cancellationDesc: {
    bg: 'Безплатно до 14 дни преди настаняване',
    en: 'Free up to 14 days before check-in'
  },
  petsRule: {
    bg: 'Домашни любимци',
    en: 'Pets'
  },
  petsDesc: {
    bg: 'Не са разрешени',
    en: 'Not allowed'
  },
  smokingRule: {
    bg: 'Пушене',
    en: 'Smoking'
  },
  smokingDesc: {
    bg: 'Пушенето е забранено',
    en: 'Smoking is not allowed'
  },
  standardPrice: {
    bg: 'Стандартна цена',
    en: 'Standard Price'
  },
  discountedPrice: {
    bg: 'Специална цена',
    en: 'Special Price'
  },
  totalSavings: {
    bg: 'Спестявате',
    en: 'Total Savings'
  },
  week: {
    bg: 'седмица',
    en: 'week'
  },
  earlyBookingDesc: {
    bg: 'Резервирайте до 30 Април и получете 10% отстъпка',
    en: 'Book before April 30th and get 10% off'
  },
  freeParkingDesc: {
    bg: 'Безплатно паркомясто за целия престой',
    en: 'Free parking spot for your entire stay'
  },
  included: {
    bg: 'Включено',
    en: 'Included'
  },
  longStay: {
    bg: 'Дълъг престой',
    en: 'Long Stay'
  },
  longStayDesc: {
    bg: 'При престой над 14 нощувки получавате 25% отстъпка',
    en: 'Stay for more than 14 nights and get 25% off'
  }
}; 