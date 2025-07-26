import React from 'react';
import { Button } from '../../ui/button';
import { useAdminLanguage } from '../../../hooks/useAdminLanguage';
import { useLanguage } from '../../../hooks/useLanguage';
import { TabProps } from './types';

interface ApartmentPricingTabProps extends TabProps {
    handleAddBasePrice: () => void;
    handleEditBasePrice: () => void;
    handleDeleteBasePrice: () => void;
    handleEditPricingOffer: (offer: any) => void;
    handleDeletePricingOffer: (offerId: string) => void;
    setIsPricingOfferModalOpen: (open: boolean) => void;
    convertEurToBgn: (eur: number) => number;
}

const ApartmentPricingTab: React.FC<ApartmentPricingTabProps> = ({
    currentApartmentData,
    handleAddBasePrice,
    handleEditBasePrice,
    handleDeleteBasePrice,
    handleEditPricingOffer,
    handleDeletePricingOffer,
    setIsPricingOfferModalOpen,
    convertEurToBgn
}) => {
    const { t } = useAdminLanguage();
    const { language } = useLanguage();

    return (
        <div className="space-y-6">
            {/* Tab Header */}
            <div className="flex justify-between items-center mb-6 pb-4 border-b">
                <h3 className="text-xl font-semibold text-gray-900">{t('pricing')}</h3>
                <div className="text-sm text-gray-600">
                    {t('dualCurrencyNote')}
                </div>
            </div>

            {/* Base Price Section */}
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{t('basePrice')}</h3>
                    {!currentApartmentData.pricing?.perNight?.bg && (
                        <Button
                            onClick={handleAddBasePrice}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {t('addBasePrice')}
                        </Button>
                    )}
                </div>

                {/* Base Price Card */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {currentApartmentData.pricing?.perNight?.bg && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                    <h4 className="font-semibold text-blue-900">{t('basePrice')}</h4>
                                </div>
                                <div className="flex space-x-1">
                                    <Button
                                        onClick={handleEditBasePrice}
                                        variant="outline"
                                        size="sm"
                                        className="h-8 w-8 p-0"
                                    >
                                        ✏️
                                    </Button>
                                    <Button
                                        onClick={handleDeleteBasePrice}
                                        variant="outline"
                                        size="sm"
                                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                        🗑️
                                    </Button>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <div className="flex justify-between">
                                    <span className="text-sm text-blue-600">{t('duration')}:</span>
                                    <span className="font-medium text-blue-900">1 {t('night')}</span>
                                </div>
                                {language === 'bg' ? (
                                    <>
                                        {/* Primary: BGN */}
                                        <div className="flex justify-between">
                                            <span className="text-sm text-blue-600">{t('priceInBGN')}:</span>
                                            <span className="font-bold text-blue-700 text-lg">{currentApartmentData.pricing.perNight.bg} лв</span>
                                        </div>
                                        {/* Secondary: EUR */}
                                        {currentApartmentData.pricing.perNight.en && (
                                            <div className="flex justify-between">
                                                <span className="text-xs text-blue-500 opacity-75">{t('priceInEUR')}:</span>
                                                <span className="text-sm text-blue-600 opacity-75">≈ €{currentApartmentData.pricing.perNight.en}</span>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        {/* Primary: EUR */}
                                        <div className="flex justify-between">
                                            <span className="text-sm text-blue-600">{t('priceInEUR')}:</span>
                                            <span className="font-bold text-blue-700 text-lg">€{currentApartmentData.pricing.perNight.en}</span>
                                        </div>
                                        {/* Secondary: BGN */}
                                        {currentApartmentData.pricing.perNight.bg && (
                                            <div className="flex justify-between">
                                                <span className="text-xs text-blue-500 opacity-75">{t('priceInBGN')}:</span>
                                                <span className="text-sm text-blue-600 opacity-75">≈ {currentApartmentData.pricing.perNight.bg} лв</span>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {!currentApartmentData.pricing?.perNight?.bg && (
                    <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                        <p>{t('noBasePriceSet')}</p>
                    </div>
                )}
            </div>

            {/* Special Offers Section */}
            <div className="border-t pt-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{t('specialOffers')}</h3>
                    <Button
                        onClick={() => setIsPricingOfferModalOpen(true)}
                        className="bg-green-600 hover:bg-green-700"
                    >
                        {t('addSpecialOffer')}
                    </Button>
                </div>

                {/* Special offers grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(currentApartmentData.pricingOffers || []).map((offer) => {
                        const bgnPrice = (offer as any).priceBGN || convertEurToBgn(offer.price);
                        const eurPrice = (offer as any).priceEUR || offer.price;
                        
                        return (
                            <div key={offer.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-semibold text-gray-900">{offer.name}</h4>
                                    <div className="flex space-x-1">
                                        <Button
                                            onClick={() => handleEditPricingOffer(offer)}
                                            variant="outline"
                                            size="sm"
                                            className="h-8 w-8 p-0"
                                        >
                                            ✏️
                                        </Button>
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleDeletePricingOffer(offer.id);
                                            }}
                                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 border border-gray-300 rounded-md bg-white flex items-center justify-center"
                                            type="button"
                                            title="Delete offer"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">{t('minimumNumberOfNights')}:</span>
                                        <span className="font-medium">{offer.days} {offer.days !== 1 ? t('days') : t('day')}</span>
                                    </div>
                                    {language === 'bg' ? (
                                        <>
                                            {/* Primary: BGN */}
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">{t('perNightBGN')}:</span>
                                                <span className="text-sm font-semibold">{Math.round(bgnPrice)} лв</span>
                                            </div>
                                            {/* Secondary: EUR */}
                                            <div className="flex justify-between">
                                                <span className="text-xs text-gray-500 opacity-75">{t('perNightEUR')}:</span>
                                                <span className="text-xs text-gray-600 opacity-75">≈ €{Math.round(eurPrice)}</span>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            {/* Primary: EUR */}
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">{t('perNightEUR')}:</span>
                                                <span className="text-sm font-semibold">€{Math.round(eurPrice)}</span>
                                            </div>
                                            {/* Secondary: BGN */}
                                            <div className="flex justify-between">
                                                <span className="text-xs text-gray-500 opacity-75">{t('perNightBGN')}:</span>
                                                <span className="text-xs text-gray-600 opacity-75">≈ {Math.round(bgnPrice)} лв</span>
                                            </div>
                                        </>
                                    )}
                                    {offer.description && (
                                        <p className="text-sm text-gray-500 mt-2">{offer.description}</p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {(currentApartmentData.pricingOffers || []).length === 0 && (
                    <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                        <p>{t('noSpecialOffersYet')}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ApartmentPricingTab; 