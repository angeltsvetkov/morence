import React from 'react';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { useAdminLanguage } from '../../../hooks/useAdminLanguage';
import { TabProps } from './types';

interface ApartmentDetailsTabProps extends TabProps {
    handleNameChange: (lang: 'bg' | 'en', value: string) => void;
    handleContactChange: (lang: 'bg' | 'en', field: 'name' | 'email', value: string) => void;
}

const ApartmentDetailsTab: React.FC<ApartmentDetailsTabProps> = ({
    currentApartmentData,
    setCurrentApartmentData,
    formLanguage,
    setFormLanguage,
    handleNameChange,
    handleContactChange
}) => {
    const { t } = useAdminLanguage();

    return (
        <div className="space-y-4">
            {/* Tab Language Selector */}
            <div className="flex justify-between items-center mb-6 pb-4 border-b">
                <h3 className="text-xl font-semibold text-gray-900">{t('details')}</h3>
                <div>
                    <span className="text-sm text-gray-600 mr-2">{t('language')}:</span>
                    <button onClick={() => setFormLanguage('bg')} className={`px-3 py-1 text-xs rounded-l-md ${formLanguage === 'bg' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>BG</button>
                    <button onClick={() => setFormLanguage('en')} className={`px-3 py-1 text-xs rounded-r-md ${formLanguage === 'en' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>EN</button>
                </div>
            </div>

            <div>
                <Label htmlFor="name" className="flex items-center gap-2">
                    {t('name')}
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        formLanguage === 'bg' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                        {formLanguage === 'bg' ? '🇧🇬 BG' : '🇬🇧 EN'}
                    </span>
                </Label>
                <Input id="name" value={currentApartmentData.name?.[formLanguage] || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleNameChange(formLanguage, e.target.value)} className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" />
            </div>

            {/* Hide Name Option */}
            <div className="flex items-center space-x-2">
                <input
                    type="checkbox"
                    id="hideName"
                    checked={currentApartmentData.hideName || false}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                        setCurrentApartmentData({
                            ...currentApartmentData,
                            hideName: e.target.checked
                        })
                    }
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <Label htmlFor="hideName" className="text-sm font-medium text-gray-700">
                    {t('hideNameOnPublicPage')}
                </Label>
            </div>

            {/* Apartment Number (Admin Only) */}
            <div>
                <Label htmlFor="apartmentNumber" className="flex items-center gap-2">
                    {t('apartmentNumber')}
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        🔒 {t('adminOnly')}
                    </span>
                </Label>
                <Input 
                    id="apartmentNumber"
                    type="text"
                    value={currentApartmentData.apartmentNumber || ''} 
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                        setCurrentApartmentData({
                            ...currentApartmentData,
                            apartmentNumber: e.target.value
                        })
                    }
                    placeholder={t('apartmentNumberPlaceholder')}
                    className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                />
            </div>


            <div>
                <Label htmlFor="description" className="flex items-center gap-2">
                    {t('description')}
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        formLanguage === 'bg' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                        {formLanguage === 'bg' ? '🇧🇬 BG' : '🇬🇧 EN'}
                    </span>
                </Label>
                <textarea
                    id="description"
                    value={currentApartmentData.description?.[formLanguage] || ''}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCurrentApartmentData({ ...currentApartmentData, description: { ...currentApartmentData.description, [formLanguage]: e.target.value } })}
                    className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    rows={6}
                />
            </div>

            {/* Floor Number */}
            <div>
                <Label htmlFor="floor">{t('floor')}</Label>
                <Input
                    id="floor"
                    type="number"
                    min="0"
                    max="50"
                    placeholder={t('enterFloorNumber')}
                    value={currentApartmentData.floor !== undefined ? currentApartmentData.floor.toString() : ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                        setCurrentApartmentData({
                            ...currentApartmentData,
                            floor: e.target.value !== '' ? parseInt(e.target.value) : undefined
                        })
                    }
                    className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
            </div>

            {/* Minimum Nights */}
            <div>
                <Label htmlFor="minimumNights">{t('minimumNumberOfNights') || 'Minimum Number of Nights'}</Label>
                <Input
                    id="minimumNights"
                    type="number"
                    min="1"
                    max="30"
                    placeholder="e.g., 2"
                    value={currentApartmentData.minimumNights !== undefined ? currentApartmentData.minimumNights.toString() : ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                        setCurrentApartmentData({
                            ...currentApartmentData,
                            minimumNights: e.target.value !== '' ? parseInt(e.target.value) : undefined
                        })
                    }
                    className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
                <p className="text-sm text-gray-500 mt-1">
                    {t('minimumNightsDescription') || 'Minimum number of nights guests must book. Leave empty for no minimum.'}
                </p>
            </div>

            {/* Address */}
            <div>
                <Label htmlFor="address" className="flex items-center gap-2">
                    {t('address')}
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        formLanguage === 'bg' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                        {formLanguage === 'bg' ? '🇧🇬 BG' : '🇬🇧 EN'}
                    </span>
                </Label>
                <Input
                    id="address"
                    placeholder={t('addressPlaceholder')}
                    value={currentApartmentData.address?.[formLanguage] || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setCurrentApartmentData({
                            ...currentApartmentData,
                            address: { ...currentApartmentData.address, [formLanguage]: e.target.value }
                        })
                    }
                    className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
            </div>

            {/* Contacts Section */}
            <div className="border-t pt-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">{t('contacts')}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Contact Name */}
                    <div>
                        <Label htmlFor="contactName" className="flex items-center gap-2">
                            {t('contactName')}
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                formLanguage === 'bg' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                                {formLanguage === 'bg' ? '🇧🇬 BG' : '🇬🇧 EN'}
                            </span>
                        </Label>
                        <Input
                            id="contactName"
                            value={currentApartmentData.contacts?.[formLanguage]?.name || ''}
                            onChange={(e) => handleContactChange(formLanguage, 'name', e.target.value)}
                            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        />
                    </div>

                    {/* Contact Phone */}
                    <div>
                        <Label htmlFor="contactPhone">{t('contactPhone')}</Label>
                        <Input
                            id="contactPhone"
                            value={currentApartmentData.contactPhone || ''}
                            onChange={(e) => setCurrentApartmentData({ ...currentApartmentData, contactPhone: e.target.value })}
                            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        />
                    </div>

                    {/* Contact Email */}
                    <div className="md:col-span-2">
                        <Label htmlFor="contactEmail">{t('contactEmail')}</Label>
                        <Input
                            id="contactEmail"
                            type="email"
                            value={currentApartmentData.contactEmail || ''}
                            onChange={(e) => setCurrentApartmentData({ ...currentApartmentData, contactEmail: e.target.value })}
                            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        />
                    </div>
                </div>
            </div>

            {/* Availability Period */}
            <div className="bg-slate-50 p-6 rounded-lg border">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">{t('availabilityPeriod')}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="availabilityStart">{t('startDate')}</Label>
                        <Input
                            id="availabilityStart"
                            type="date"
                            value={currentApartmentData.availabilityStart || ''}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                setCurrentApartmentData({
                                    ...currentApartmentData,
                                    availabilityStart: e.target.value
                                })
                            }
                            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        />
                    </div>
                    <div>
                        <Label htmlFor="availabilityEnd">{t('endDate')}</Label>
                        <Input
                            id="availabilityEnd"
                            type="date"
                            value={currentApartmentData.availabilityEnd || ''}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                setCurrentApartmentData({
                                    ...currentApartmentData,
                                    availabilityEnd: e.target.value
                                })
                            }
                            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        />
                    </div>
                </div>
                
                {/* Display current availability period */}
                {currentApartmentData.availabilityStart && currentApartmentData.availabilityEnd && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800">
                            {t('availabilityPeriodInfo')}: {' '}
                            <span className="font-medium">
                                {new Date(currentApartmentData.availabilityStart).toLocaleDateString()}
                            </span>
                            {' '}{t('to')}{' '}
                            <span className="font-medium">
                                {new Date(currentApartmentData.availabilityEnd).toLocaleDateString()}
                            </span>
                        </p>
                    </div>
                )}
                
                {(currentApartmentData.availabilityStart || currentApartmentData.availabilityEnd) && (
                    <div className="mt-2">
                        <p className="text-xs text-gray-500">
                            {currentApartmentData.availabilityStart && currentApartmentData.availabilityEnd ? 
                                t('availabilityActiveMessage') :
                                t('availabilityBothDatesRequired')
                            }
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ApartmentDetailsTab; 