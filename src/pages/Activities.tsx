import { MapPin, Utensils, Waves, Castle, Mountain, Ship, Fish, Ticket, Clock, ExternalLink } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../translations';

interface Activity {
  icon: React.ReactNode;
  title: string;
  description: string;
  distance: string;
  price?: string;
  workingHours?: string;
  link?: string;
  category: 'kids' | 'nature' | 'culture' | 'food' | 'sports';
  image: string;
}

function Activities() {
  const { language } = useLanguage();

  const activities: Activity[] = [
    // Kids Activities
    {
      icon: <Waves className="h-6 w-6" />,
      title: translations.neptuneAquapark?.[language] as string || 'Neptune Aquapark',
      description: translations.neptuneAquaparkDesc?.[language] as string || 'Large modern water park with numerous water slides, green areas, and playgrounds. Features daily animation for children, dining facilities, and free WiFi.',
      distance: '5 km',
      link: 'https://aquaparkneptun.com/bg/',
      category: 'kids',
      image: '/photos/posetete-akvapark-neptun-na-3km-ot-sozopol-do-zamaka-vliuben-vav-vyatara-ravadinovo-226814.jpg'
    },
    {
      icon: <Castle className="h-6 w-6" />,
      title: translations.castleInLoveWithWind?.[language] as string || 'Castle "In Love with the Wind"',
      description: translations.castleInLoveWithWindDesc?.[language] as string || 'A fairy-tale castle built in modern times but with a medieval appearance. Features a park with lakes, animals (swans, peacocks), a chapel, and a winery.',
      distance: '3-6 km',
      price: translations.castlePrice?.[language] as string || 'Paid entrance',
      link: 'https://zamaka.bg/',
      category: 'kids',
      image: '/photos/news__0__63614d57ce7ad4908c0430883f2e4be7.jpg'
    },
    // Nature Activities
    {
      icon: <Waves className="h-6 w-6" />,
      title: translations.goldenFishBeach?.[language] as string || 'Golden Fish Beach',
      description: translations.goldenFishBeachDesc?.[language] as string || 'Wide sandy beach between Sozopol and Gradina camping. Protected and very shallow for dozens of meters, perfect for small children.',
      distance: '2 km',
      price: translations.goldenFishBeachPrice?.[language] as string || 'Free access (paid parking)',
      category: 'nature',
      image: '/photos/Zlatna-ribka-06-1024x768.jpg'
    },
    {
      icon: <Mountain className="h-6 w-6" />,
      title: translations.ropotamoReserve?.[language] as string || 'Ropotamo Nature Reserve',
      description: translations.ropotamoReserveDesc?.[language] as string || 'Beautiful nature reserve with dense forests along the Ropotamo River. Features boat tours, water lilies, and diverse wildlife.',
      distance: '15 km',
      category: 'nature',
      image: '/photos/ropotamo-lodki.jpg'
    },
    // Cultural Activities
    {
      icon: <Castle className="h-6 w-6" />,
      title: translations.oldTownSozopol?.[language] as string || 'Old Town Sozopol',
      description: translations.oldTownSozopolDesc?.[language] as string || 'Architectural reserve with cobblestone streets, preserved Renaissance houses, and ancient churches. Features an amphitheater and panoramic coastal walk.',
      distance: '2 km',
      price: translations.oldTownSozopolPrice?.[language] as string || 'Free access (museums and churches have entrance fees)',
      category: 'culture',
      image: '/photos/star-grad.jpg'
    },
    // Food Activities
    {
      icon: <Utensils className="h-6 w-6" />,
      title: translations.restaurantMatis?.[language] as string ,
      description: translations.restaurantMatisDesc?.[language] as string ,
      distance: '2 km',
      category: 'food',
      image: 'photos/matis-interior-2_fit_1200_720.jpg'
    },
    // Sports Activities
    {
      icon: <Ship className="h-6 w-6" />,
      title: translations.boatTour?.[language] as string || 'Boat Tour from Sozopol',
      description: translations.boatTourDesc?.[language] as string || 'One-hour sea tour around the islands of St. Kirik and St. Ivan. Features feeding seagulls and beautiful views of the coast.',
      distance: '0 km',
      price: translations.boatTourPrice?.[language] as string || '10-15 BGN per person',
      workingHours: 'Every hour in season',
      category: 'sports',
      image: 'https://placehold.co/600x400/2563eb/ffffff?text=Boat+Tour'
    },
    {
      icon: <Fish className="h-6 w-6" />,
      title: translations.horseRiding?.[language] as string || 'Horse Riding at Royal Horse Club',
      description: translations.horseRidingDesc?.[language] as string || 'Horse and pony riding lessons, donkey cart rides, and a mini zoo with domestic animals. Features a restaurant with homemade food.',
      distance: '20-25 km',
      price: translations.horseRidingPrice?.[language] as string || '5 BGN entrance, activities paid separately',
      link: 'https://www.royalhorse.bg',
      category: 'sports',
      image: 'https://placehold.co/600x400/2563eb/ffffff?text=Horse+Riding'
    }
  ];

  const categories = [
    { id: 'kids', title: translations.kidsActivities?.[language] as string || 'Kids Activities' },
    { id: 'nature', title: translations.natureActivities?.[language] as string || 'Nature & Walks' },
    { id: 'culture', title: translations.culturalActivities?.[language] as string || 'Cultural & Historical Sites' },
    { id: 'food', title: translations.foodActivities?.[language] as string || 'Restaurants & Food' },
    { id: 'sports', title: translations.sportsActivities?.[language] as string || 'Sports & Adventures' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {translations.activitiesTitle?.[language] as string || 'Summer Activities and Attractions'}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {translations.activitiesSubtitle?.[language] as string || 'Welcome to the Sozopol area - rich in entertainment for the whole family. Within a 30 km radius from complex, you will find many suitable summer attractions and activities.'}
          </p>
        </div>

        {categories.map((category) => (
          <div key={category.id} className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">{category.title}</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {activities
                .filter(activity => activity.category === category.id)
                .map((activity, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 hover-lift"
                  >
                    <div className="relative h-48 mb-4 rounded-lg overflow-hidden">
                      <img
                        src={activity.image}
                        alt={activity.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="bg-blue-100 p-3 rounded-lg text-blue-600">
                        {activity.icon}
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">{activity.title}</h3>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {activity.distance}
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-4">{activity.description}</p>
                    <div className="space-y-2">
                      {activity.price && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Ticket className="h-4 w-4" />
                          <span>{activity.price}</span>
                        </div>
                      )}
                      {activity.workingHours && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="h-4 w-4" />
                          <span>{activity.workingHours}</span>
                        </div>
                      )}
                      {activity.link && (
                        <a
                          href={activity.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                        >
                          <ExternalLink className="h-4 w-4" />
                          <span>{translations.visitWebsite?.[language] as string || 'Visit Website'}</span>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}

      </div>
    </div>
  );
}

export default Activities; 