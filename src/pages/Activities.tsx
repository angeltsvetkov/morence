import { MapPin, Coffee, Utensils, Wine, ShoppingBag, Waves, Trees, Phone } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../translations';

interface Activity {
  icon: React.ReactNode;
  title: string;
  description: string;
  distance: string;
}

function Activities() {
  const { language } = useLanguage();

  const activities: Activity[] = [
    {
      icon: <Waves className="h-6 w-6" />,
      title: translations.beachActivities?.[language] as string || 'Beach Activities',
      description: translations.beachActivitiesDesc?.[language] as string || 'Enjoy the beautiful beaches of Kavaci. Perfect for swimming, sunbathing, and water sports.',
      distance: '5 min walk'
    },
    {
      icon: <Utensils className="h-6 w-6" />,
      title: translations.restaurants?.[language] as string || 'Restaurants',
      description: translations.restaurantsDesc?.[language] as string || 'Discover local cuisine at nearby restaurants. Fresh seafood and traditional Bulgarian dishes.',
      distance: '2-10 min walk'
    },
    {
      icon: <Coffee className="h-6 w-6" />,
      title: translations.cafes?.[language] as string || 'Cafes & Bars',
      description: translations.cafesDesc?.[language] as string || 'Relax at cozy cafes and enjoy refreshing drinks at beach bars.',
      distance: '2-5 min walk'
    },
    {
      icon: <Trees className="h-6 w-6" />,
      title: translations.parks?.[language] as string || 'Parks & Nature',
      description: translations.parksDesc?.[language] as string || 'Explore beautiful parks and nature trails perfect for morning walks or evening strolls.',
      distance: '5-15 min walk'
    },
    {
      icon: <ShoppingBag className="h-6 w-6" />,
      title: translations.shopping?.[language] as string || 'Shopping',
      description: translations.shoppingDesc?.[language] as string || 'Visit local shops and markets for souvenirs and essentials.',
      distance: '5-10 min walk'
    },
    {
      icon: <Wine className="h-6 w-6" />,
      title: translations.nightlife?.[language] as string || 'Nightlife',
      description: translations.nightlifeDesc?.[language] as string || 'Experience the vibrant nightlife with bars and entertainment venues.',
      distance: '5-15 min walk'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {translations.activitiesTitle?.[language] as string || 'Things to Do'}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {translations.activitiesSubtitle?.[language] as string || 'Discover the best activities and attractions near your stay'}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {activities.map((activity, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 hover-lift"
            >
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
              <p className="text-gray-600">{activity.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">
            {translations.needHelp?.[language] as string || 'Need Help Planning Your Stay?'}
          </h2>
          <p className="mb-6">
            {translations.needHelpDesc?.[language] as string || 'We\'re here to help you make the most of your vacation. Contact us for recommendations and assistance.'}
          </p>
          <a
            href="tel:+359883460715"
            className="inline-flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-full font-semibold hover:bg-blue-50 transition-colors"
          >
            <Phone className="h-5 w-5" />
            {translations.callUs?.[language] as string || 'Call Us'}
          </a>
        </div>
      </div>
    </div>
  );
}

export default Activities; 