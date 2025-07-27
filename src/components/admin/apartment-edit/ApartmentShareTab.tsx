import React from 'react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { useAdminLanguage } from '../../../hooks/useAdminLanguage';
import { Language } from '../../../contexts/LanguageContext';
import { Apartment } from '../../../types';
import OptimizedImage from '../../ui/optimized-image';
import { ExternalLink, Copy, Share2, Eye } from 'lucide-react';

interface ApartmentShareTabProps {
    currentApartmentData: Partial<Apartment>;
    setCurrentApartmentData: React.Dispatch<React.SetStateAction<Partial<Apartment>>>;
    galleryItems: Array<{ id: string; url: string; file?: File }>;
    formLanguage: 'bg' | 'en';
    setFormLanguage: (lang: 'bg' | 'en') => void;
    slug?: string;
    handleShare?: () => void;
    handleCopyUrl?: () => Promise<void>;
}

const ApartmentShareTab: React.FC<ApartmentShareTabProps> = ({
    currentApartmentData,
    setCurrentApartmentData,
    galleryItems,
    formLanguage,
    setFormLanguage,
    slug,
    handleShare,
    handleCopyUrl
}) => {
    const { t } = useAdminLanguage();

    const getPublicUrl = () => {
        if (typeof window !== 'undefined') {
            return `${window.location.origin}/apartments/${slug || currentApartmentData.slug}`;
        }
        return `https://yoursite.com/apartments/${slug || currentApartmentData.slug}`;
    };

    // Social sharing functions
    const handleSocialDataChange = (field: string, value: any) => {
        setCurrentApartmentData(prev => ({
            ...prev,
            socialSharing: {
                ...prev.socialSharing,
                [field]: value
            }
        }));
    };

    const handleLanguageSpecificChange = (field: 'ogTitle' | 'ogDescription', value: string) => {
        const currentValue = currentApartmentData.socialSharing?.[field] || {};
        handleSocialDataChange(field, {
            ...currentValue,
            [formLanguage]: value
        });
    };

    const selectImageForSharing = (imageUrl: string) => {
        handleSocialDataChange('ogImage', imageUrl);
    };

    const getApartmentName = (apartment: Partial<Apartment>): string => {
        if (typeof apartment.name === 'string') {
            return apartment.name;
        }
        return apartment.name?.[formLanguage] || apartment.name?.en || apartment.name?.bg || 'Apartment';
    };

    const getApartmentDescription = (apartment: Partial<Apartment>): string => {
        if (typeof apartment.description === 'string') {
            return apartment.description;
        }
        return apartment.description?.[formLanguage] || apartment.description?.en || apartment.description?.bg || '';
    };

    // Use defaults from apartment data if social sharing fields are empty
    const defaultTitle = currentApartmentData.socialSharing?.ogTitle?.[formLanguage] || getApartmentName(currentApartmentData);
    const defaultDescription = currentApartmentData.socialSharing?.ogDescription?.[formLanguage] || getApartmentDescription(currentApartmentData);
    const selectedImage = currentApartmentData.socialSharing?.ogImage || currentApartmentData.heroImage || galleryItems[0]?.url;

    return (
        <div>
            {/* Tab Header */}
            <div className="flex justify-between items-center mb-6 pb-4 border-b">
                <h3 className="text-xl font-semibold text-gray-900">{t('share')}</h3>
                <div className="flex items-center gap-2">
                    <Share2 className="w-5 h-5 text-gray-600" />
                    <span className="text-sm text-gray-600">{t('shareApartment')}</span>
                </div>
            </div>

            <div className="space-y-8">
                {/* Quick Share Section */}
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-900 mb-3">{t('publicUrl')}</h4>
                    <div className="flex items-center gap-3 mb-4">
                        <input
                            type="text"
                            value={getPublicUrl()}
                            readOnly
                            className="flex-1 px-3 py-2 bg-white border border-blue-300 rounded-md text-sm text-gray-700"
                        />
                        <Button
                            onClick={handleCopyUrl}
                            size="sm"
                            className="flex items-center gap-2"
                        >
                            <Copy className="w-4 h-4" />
                            {t('copy')}
                        </Button>
                        <Button
                            onClick={() => window.open(getPublicUrl(), '_blank')}
                            size="sm"
                            variant="outline"
                            className="flex items-center gap-2"
                        >
                            <ExternalLink className="w-4 h-4" />
                            {t('open')}
                        </Button>
                    </div>

                    {/* Quick Share Buttons */}
                    <h5 className="font-medium text-blue-900 mb-3">{t('quickShare')}</h5>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <Button
                            onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getPublicUrl())}`, '_blank')}
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2"
                        >
                            <span>📘</span>
                            Facebook
                        </Button>
                        <Button
                            onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(getPublicUrl())}`, '_blank')}
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2"
                        >
                            <span>🐦</span>
                            Twitter
                        </Button>
                        <Button
                            onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(getPublicUrl())}`, '_blank')}
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2"
                        >
                            <span>💼</span>
                            LinkedIn
                        </Button>
                        <Button
                            onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(getPublicUrl())}`, '_blank')}
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2"
                        >
                            <span>💬</span>
                            WhatsApp
                        </Button>
                    </div>
                </div>

                {/* Social Media Customization */}
                <div className="bg-gray-50 p-6 rounded-lg border">
                    <div className="flex items-center gap-2 mb-4">
                        <h4 className="font-semibold text-gray-900">{t('socialSharing')}</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-6">
                        {t('socialSharingSettings')}
                    </p>

                    {/* Language Selector */}
                    <div className="mb-6">
                        <Label className="text-sm font-medium text-gray-700">{t('language')}</Label>
                        <div className="flex gap-2 mt-2">
                            <Button
                                type="button"
                                variant={formLanguage === 'bg' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setFormLanguage('bg')}
                            >
                                Български
                            </Button>
                            <Button
                                type="button"
                                variant={formLanguage === 'en' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setFormLanguage('en')}
                            >
                                English
                            </Button>
                        </div>
                    </div>

                    {/* Social Share Image Selection */}
                    <div className="mb-6">
                        <Label className="text-base font-semibold text-gray-900 mb-3 block">
                            {t('socialShareImage')}
                        </Label>
                        <p className="text-sm text-gray-600 mb-4">
                            {t('socialShareImageDescription')}
                        </p>
                        
                        {/* Current Selection */}
                        {selectedImage && (
                            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <Label className="text-sm font-medium text-blue-900 mb-2 block">
                                    {t('currentSelection')}
                                </Label>
                                <div className="flex items-center gap-4">
                                    <OptimizedImage 
                                        src={selectedImage} 
                                        className="w-32 h-20 object-cover rounded border-2 border-blue-300" 
                                        alt="Social sharing preview"
                                        placeholder="skeleton"
                                    />
                                    <div className="text-sm text-blue-700">
                                        {t('thisImageWillBeShown')}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Image Gallery for Selection */}
                        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                            {galleryItems.map((item) => (
                                <div
                                    key={item.id}
                                    className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                                        selectedImage === item.url
                                            ? 'border-blue-500 ring-2 ring-blue-200'
                                            : 'border-gray-200 hover:border-blue-300'
                                    }`}
                                    onClick={() => selectImageForSharing(item.url)}
                                >
                                    <OptimizedImage 
                                        src={item.url} 
                                        className="w-full h-20 object-cover" 
                                        alt="Gallery image"
                                        placeholder="skeleton"
                                    />
                                    {selectedImage === item.url && (
                                        <div className="absolute inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center">
                                            <div className="bg-blue-500 text-white rounded-full p-1">
                                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Social Share Title and Description */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        {/* Social Share Title */}
                        <div>
                            <Label htmlFor="ogTitle" className="text-base font-semibold text-gray-900 mb-2 block">
                                {t('socialShareTitle')}
                            </Label>
                            <p className="text-sm text-gray-600 mb-3">
                                {t('socialShareTitleDescription')}
                            </p>
                            <Input
                                id="ogTitle"
                                type="text"
                                placeholder={t('enterSocialTitle')}
                                value={currentApartmentData.socialSharing?.ogTitle?.[formLanguage] || ''}
                                onChange={(e) => handleLanguageSpecificChange('ogTitle', e.target.value)}
                                className="w-full"
                            />
                            {!currentApartmentData.socialSharing?.ogTitle?.[formLanguage] && (
                                <p className="text-xs text-gray-500 mt-1">
                                    {t('defaultWillBeUsed')}: "{defaultTitle}"
                                </p>
                            )}
                        </div>

                        {/* Social Share Description */}
                        <div>
                            <Label htmlFor="ogDescription" className="text-base font-semibold text-gray-900 mb-2 block">
                                {t('socialShareDescription')}
                            </Label>
                            <p className="text-sm text-gray-600 mb-3">
                                {t('socialShareDescriptionDescription')}
                            </p>
                            <textarea
                                id="ogDescription"
                                placeholder={t('enterSocialDescription')}
                                value={currentApartmentData.socialSharing?.ogDescription?.[formLanguage] || ''}
                                onChange={(e) => handleLanguageSpecificChange('ogDescription', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                rows={3}
                                maxLength={160}
                            />
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>
                                    {!currentApartmentData.socialSharing?.ogDescription?.[formLanguage] && (
                                        <>
                                            {t('defaultWillBeUsed')}: "{defaultDescription.substring(0, 30)}..."
                                        </>
                                    )}
                                </span>
                                <span>
                                    {(currentApartmentData.socialSharing?.ogDescription?.[formLanguage] || '').length}/160
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Preview Section */}
                    <div className="bg-white p-4 rounded-lg border">
                        <div className="flex items-center gap-2 mb-3">
                            <Eye className="w-4 h-4 text-gray-600" />
                            <Label className="text-base font-semibold text-gray-900">
                                {t('socialSharePreview')}
                            </Label>
                        </div>
                        
                        {/* Mock Social Media Card */}
                        <div className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden max-w-md">
                            {selectedImage && (
                                <OptimizedImage 
                                    src={selectedImage} 
                                    className="w-full h-32 object-cover" 
                                    alt="Social preview"
                                    placeholder="skeleton"
                                />
                            )}
                            <div className="p-3">
                                <h4 className="font-semibold text-gray-900 mb-1 text-sm line-clamp-2">
                                    {currentApartmentData.socialSharing?.ogTitle?.[formLanguage] || defaultTitle}
                                </h4>
                                <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                                    {currentApartmentData.socialSharing?.ogDescription?.[formLanguage] || defaultDescription}
                                </p>
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                    <ExternalLink className="w-3 h-3" />
                                    {getPublicUrl()}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Platform Information */}
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mt-4">
                        <h5 className="font-semibold text-blue-900 mb-2">{t('supportedPlatforms')}</h5>
                        <div className="text-sm text-blue-700 space-y-1">
                            <div>• Facebook, LinkedIn, WhatsApp</div>
                            <div>• Twitter/X (uses same settings)</div>
                            <div>• Slack, Discord, Telegram</div>
                            <div>• Google Search results</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ApartmentShareTab; 