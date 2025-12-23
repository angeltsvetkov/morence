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
    handleReorderPricingOffer: (offerId: string, direction: 'up' | 'down') => void;
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
    handleReorderPricingOffer,
    setIsPricingOfferModalOpen,
    convertEurToBgn: _convertEurToBgn
}) => {
    const { t } = useAdminLanguage();
    const { language } = useLanguage();

    const EUR_TO_BGN_RATE = 1.95583;
    const basePriceEUR = currentApartmentData.pricing?.perNight?.en
        ?? (typeof currentApartmentData.pricing?.perNight?.bg === 'number'
            ? Math.ceil(currentApartmentData.pricing.perNight.bg / EUR_TO_BGN_RATE)
            : undefined);

    return (
        <div className="space-y-6 pb-16">
            {/* Tab Header */}
            <div className="flex justify-between items-center mb-6 pb-4 border-b">
                <h3 className="text-xl font-semibold text-gray-900">{t('pricing')}</h3>
            </div>

            {/* Base Price Section */}
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{t('basePrice')}</h3>
                    {!currentApartmentData.pricing?.perNight?.en && !currentApartmentData.pricing?.perNight?.bg && (
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
                    {typeof basePriceEUR === 'number' && (
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
                                <div className="flex justify-between">
                                    <span className="text-sm text-blue-600">{t('priceInEUR')}:</span>
                                    <span className="font-bold text-blue-700 text-lg">€{basePriceEUR}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {!currentApartmentData.pricing?.perNight?.en && !currentApartmentData.pricing?.perNight?.bg && (
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
                    {(currentApartmentData.pricingOffers || []).map((offer, index, allOffers) => {
                        const eurPrice = (offer as any).priceEUR || offer.price || ((offer as any).priceBGN ? Math.round((offer as any).priceBGN / EUR_TO_BGN_RATE) : 0);
                        const isFirst = index === 0;
                        const isLast = index === allOffers.length - 1;
                        
                        return (
                            <div key={offer.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-start gap-2">
                                        <h4 className="font-semibold text-gray-900">{offer.name}</h4>
                                        {!!(offer as any).isSuperSpecial && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-700 border border-orange-200">
                                                {t('superSpecialOffer')}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex space-x-1">
                                        <Button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleReorderPricingOffer(offer.id, 'up');
                                            }}
                                            variant="outline"
                                            size="sm"
                                            className="h-8 w-8 p-0"
                                            disabled={isFirst}
                                            title="Move up"
                                        >
                                            ⬆️
                                        </Button>
                                        <Button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleReorderPricingOffer(offer.id, 'down');
                                            }}
                                            variant="outline"
                                            size="sm"
                                            className="h-8 w-8 p-0"
                                            disabled={isLast}
                                            title="Move down"
                                        >
                                            ⬇️
                                        </Button>
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
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">{t('perNightEUR')}:</span>
                                        <span className="text-sm font-semibold">€{Math.round(eurPrice)}</span>
                                    </div>
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