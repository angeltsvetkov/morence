import { useState, useEffect } from 'react';
import { collection, getDocs, DocumentData } from 'firebase/firestore';
import { db } from '../firebase';
import { useLanguage } from '../hooks/useLanguage';
import { Link as LinkIcon, MapPin, Milestone } from 'lucide-react';

interface Place {
  id: string;
  title: { [key: string]: string };
  description: { [key: string]: string };
  imageUrl: string;
  url?: string;
  distance?: number;
  location?: string;
}

const Places = () => {
  const { language, t } = useLanguage();
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlaces = async () => {
      setLoading(true);
      setError(null);
      try {
        const placesCollection = collection(db, 'places');
        const placesSnapshot = await getDocs(placesCollection);
        const placesList = placesSnapshot.docs.map((doc: DocumentData) => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title && typeof data.title === 'object' ? data.title : {},
            description: data.description && typeof data.description === 'object' ? data.description : {},
            imageUrl: data.imageUrl || '',
            url: data.url,
            distance: data.distance,
            location: data.location,
          };
        }) as Place[];
        setPlaces(placesList);
      } catch (err) {
        console.error("Error fetching places:", err);
        setError("Failed to load places. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchPlaces();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl font-semibold">Loading places...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl font-semibold text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-center mb-12">{t('places')}</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {places.map((place) => (
            <div key={place.id} className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300 group">
              <div className="relative">
                <img src={place.imageUrl} alt={place.title?.[language] || 'Place image'} className="w-full h-56 object-cover" />
                {place.url && (
                  <a href={place.url} target="_blank" rel="noopener noreferrer" className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors">
                    <LinkIcon className="w-6 h-6 text-gray-700" />
                  </a>
                )}
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{place.title?.[language] || 'No title available'}</h3>
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  {place.location && (
                    <a 
                      href={typeof place.location === 'string' && place.location.startsWith('http') ? place.location : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(String(place.location))}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center mr-4 hover:text-blue-500 transition-colors"
                    >
                      <MapPin className="w-4 h-4 mr-1" />
                      <span>{typeof place.location === 'string' && place.location.startsWith('http') ? t('viewOnMap') : place.location}</span>
                    </a>
                  )}
                  {place.distance != null && (
                    <div className="flex items-center">
                      <Milestone className="w-4 h-4 mr-1" />
                      <span>{place.distance} km</span>
                    </div>
                  )}
                </div>
                <p className="text-gray-600 text-sm">{place.description?.[language] || 'No description available'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Places;