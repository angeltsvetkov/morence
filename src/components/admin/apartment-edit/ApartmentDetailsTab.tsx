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
        <div className="space-y-4 pb-16">
            {/* Tab Language Selector */}
            <div className="flex justify-between items-center mb-6 pb-4 border-b">
                <h3 className="text-xl font-semibold text-gray-900">{t('details')}</h3>
                <div>
                    <span className="text-sm text-gray-600 mr-2">{t('language')}:</span>
                    <button onClick={() => setFormLanguage('bg')} className={`px-3 py-1 text-xs rounded-l-md ${formLanguage === 'bg' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>BG</button>
                    <button onClick={() => setFormLanguage('en')} className={`px-3 py-1 text-xs rounded-r-md ${formLanguage === 'en' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>EN</button>
                </div>
            </div>

            {/* Name and Domain Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Apartment Name */}
                <div>
                    <Label htmlFor="name" className="flex items-center gap-2">
                        {t('name')}
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            formLanguage === 'bg' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                            {formLanguage === 'bg' ? '🇧🇬 BG' : '🇬🇧 EN'}
                        </span>
                    </Label>
                    <Input 
                        id="name" 
                        value={currentApartmentData.name?.[formLanguage] || ''} 
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleNameChange(formLanguage, e.target.value)} 
                        className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                    />
                </div>

                {/* Custom Domain */}
                <div>
                    <Label htmlFor="domain" className="flex items-center gap-2">
                        {t('customDomain') || 'Custom Domain'}
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            🌐 {t('publicPage') || 'Public Page'}
                        </span>
                    </Label>
                    <div className="flex">
                        <span className="inline-flex items-center px-3 py-2 border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm rounded-l-md">
                            https://
                        </span>
                        <Input 
                            id="domain"
                            type="text"
                            value={currentApartmentData.domain || ''} 
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                // Only allow lowercase letters, numbers, and hyphens
                                const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                                setCurrentApartmentData({
                                    ...currentApartmentData,
                                    domain: value
                                });
                            }}
                            placeholder={t('domainPlaceholder') || 'your-apartment-name'}
                            className="flex-1 border border-l-0 border-gray-300 rounded-none p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                        />
                        <span className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm rounded-r-md">
                            .morence.top
                        </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                        {currentApartmentData.domain ? (
                            <>
                                {t('domainPreview') || 'Your public page will be available at'}: <br />
                                <span className="font-mono text-blue-600">https://{currentApartmentData.domain}.morence.top</span>
                            </>
                        ) : (
                            t('domainDescription') || 'Set a custom subdomain for your apartment\'s public page. Use only lowercase letters, numbers, and hyphens.'
                        )}
                    </p>
                </div>
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

            {/* Description */}
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

            {/* Floor Number and Minimum Nights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </div>
            </div>
            <p className="text-sm text-gray-500 mt-1">
                {t('minimumNightsDescription') || 'Minimum number of nights guests must book. Leave empty for no minimum.'}
            </p>

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
        </div>
    );
};

export default ApartmentDetailsTab; 