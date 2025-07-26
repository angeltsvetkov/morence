import { useEffect } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import Hero from '../components/home/Hero';
import Features from '../components/home/Features';
import Gallery from '../components/home/Gallery';
import Location from '../components/home/Location';
import Overview from '../components/home/Overview';
import Pricing from '../components/home/Pricing';
import PromoOffers from '../components/home/PromoOffers';
import Rules from '../components/home/Rules';
import CallToActionButton from '../components/home/CallToActionButton';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Contacts from '../components/home/Contacts';

const HomePage = () => {
  const { loading } = useLanguage();
  
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

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="bg-gray-50">
      <Hero />
      <div className="max-w-7xl mx-auto px-4">
        <Features />
        <Overview />
        <Pricing />
        <Rules />
        <Gallery />
        <PromoOffers />
        <Location />
        <Contacts />
        <CallToActionButton />
      </div>
    </div>
  );
};

export default HomePage;
