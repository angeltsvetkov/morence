import React, { useState } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

const Gallery: React.FC = () => {
  const { t } = useLanguage();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);

  const galleryItems = [
    { path: '/photos/10040698_135550663_big.jpg', title: t('galleryTitle') },
    { path: '/photos/10040698_135550664_big.jpg', title: t('galleryTitle') },
    { path: '/photos/10040698_135550665_big.jpg', title: t('galleryTitle') },
    { path: '/photos/10040698_135550666_big.jpg', title: t('galleryTitle') },
    { path: '/photos/10040698_135550667_big.jpg', title: t('galleryTitle') },
    { path: '/photos/10040698_135550668_big.jpg', title: t('galleryTitle') },
    { path: '/photos/10040698_135550669_big.jpg', title: t('galleryTitle') },
    { path: '/photos/10040698_135550671_big.jpg', title: t('galleryTitle') },
    { path: '/photos/10040698_135550685_big.jpg', title: t('galleryTitle') },
    { path: '/photos/Zlatna-ribka-06-1024x768.jpg', title: t('galleryTitle') },
    { path: '/photos/ropotamo-lodki.jpg', title: t('galleryTitle') },
    { path: '/photos/star-grad.jpg', title: t('galleryTitle') },
  ];

  const handleImageClick = (path: string) => {
    setSelectedImage(path);
    const imageIndex = galleryItems.findIndex(item => item.path === path);
    setCurrentImageIndex(imageIndex);
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
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
    <>
      <div id='gallery' className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">{t('gallery')}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {galleryItems.map((photo, index) => (
              <div
                key={index}
                className="relative group overflow-hidden rounded-lg cursor-pointer"
                onClick={() => handleImageClick(photo.path)}
              >
                <img
                  src={photo.path}
                  alt={`${t('galleryTitle')} ${index + 1}`}
                  className="w-full h-48 object-cover transform group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center">
                  <p className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-semibold">{t('clickToView')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50">
            <div className="relative max-w-4xl max-h-full">
                <img src={selectedImage} alt={t('galleryTitle')} className="max-w-full max-h-[90vh] rounded-lg" />
                <button onClick={handleCloseModal} className="absolute top-4 right-4 text-white text-3xl z-50">
                    <X size={32} />
                </button>
                <button onClick={handlePrevImage} className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-3xl z-50">
                    <ChevronLeft size={40} />
                </button>
                <button onClick={handleNextImage} className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-3xl z-50">
                    <ChevronRight size={40} />
                </button>
            </div>
        </div>
      )}
    </>
  );
};

export default Gallery;
