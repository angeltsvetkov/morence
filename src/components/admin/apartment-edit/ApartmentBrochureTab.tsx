import React, { useState } from 'react';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { TabProps } from './types';
import { useAdminLanguage } from '../../../hooks/useAdminLanguage';
import { Share2, Check } from 'lucide-react';

type BrochureField =
    | 'welcomeMessage'
    | 'checkInInstructions'
    | 'checkOutInstructions'
    | 'houseRules'
    | 'localTips'
    | 'transportInfo'
    | 'emergencyContacts';

interface ApartmentBrochureTabProps extends TabProps {
    slug?: string;
}

const ApartmentBrochureTab: React.FC<ApartmentBrochureTabProps> = ({
    currentApartmentData,
    setCurrentApartmentData,
    formLanguage,
    setFormLanguage,
    slug
}) => {
    const { t } = useAdminLanguage();
    const [isLinkCopied, setIsLinkCopied] = useState(false);

    const brochureData = currentApartmentData.guestBrochure || {};
    const currentLanguageBrochure = brochureData[formLanguage] || {};

    const updateBrochureField = (field: BrochureField, value: string) => {
        setCurrentApartmentData(prev => ({
            ...prev,
            guestBrochure: {
                ...(prev.guestBrochure || {}),
                [formLanguage]: {
                    ...(prev.guestBrochure?.[formLanguage] || {}),
                    [field]: value
                }
            }
        }));
    };

    const updateWifiField = (field: 'wifiName' | 'wifiPassword', value: string) => {
        setCurrentApartmentData(prev => ({
            ...prev,
            guestBrochure: {
                ...(prev.guestBrochure || {}),
                [formLanguage]: {
                    ...(prev.guestBrochure?.[formLanguage] || {}),
                    [field]: value
                }
            }
        }));
    };

    const handleCopyBrochureLink = () => {
        if (!slug) return;

        const brochureUrl = `${window.location.origin}/apartments/${slug}/brochure`;
        navigator.clipboard.writeText(brochureUrl).then(() => {
            setIsLinkCopied(true);
            window.setTimeout(() => setIsLinkCopied(false), 2000);
        }).catch((error) => {
            console.error('Failed to copy brochure link:', error);
        });
    };

    return (
        <div className="space-y-4 pb-16">
            <div className="flex justify-between items-center mb-6 pb-4 border-b">
                <h3 className="text-xl font-semibold text-gray-900">{t('guestBrochure')}</h3>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={handleCopyBrochureLink}
                        disabled={!slug}
                        className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                            isLinkCopied
                                ? 'bg-green-50 text-green-700'
                                : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                        title={isLinkCopied ? t('linkCopied') : t('shareLink')}
                    >
                        {isLinkCopied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                        {isLinkCopied ? t('linkCopied') : t('shareLink')}
                    </button>
                    <span className="text-sm text-gray-600 mr-2">{t('language')}:</span>
                    <button onClick={() => setFormLanguage('bg')} className={`px-3 py-1 text-xs rounded-l-md ${formLanguage === 'bg' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>BG</button>
                    <button onClick={() => setFormLanguage('en')} className={`px-3 py-1 text-xs rounded-r-md ${formLanguage === 'en' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>EN</button>
                </div>
            </div>

            <p className="text-sm text-gray-600 bg-blue-50 border border-blue-100 rounded-lg p-3">
                {t('brochureTabDescription')}
            </p>

            <div>
                <Label htmlFor="brochureWelcomeMessage">{t('brochureWelcomeMessage')}</Label>
                <textarea
                    id="brochureWelcomeMessage"
                    value={currentLanguageBrochure.welcomeMessage || ''}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateBrochureField('welcomeMessage', e.target.value)}
                    placeholder={t('brochureWelcomeMessagePlaceholder')}
                    rows={4}
                    className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="brochureWifiName">{t('brochureWifiName')}</Label>
                    <Input
                        id="brochureWifiName"
                        value={currentLanguageBrochure.wifiName || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateWifiField('wifiName', e.target.value)}
                        placeholder={t('brochureWifiNamePlaceholder')}
                        className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                </div>
                <div>
                    <Label htmlFor="brochureWifiPassword">{t('brochureWifiPassword')}</Label>
                    <Input
                        id="brochureWifiPassword"
                        value={currentLanguageBrochure.wifiPassword || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateWifiField('wifiPassword', e.target.value)}
                        placeholder={t('brochureWifiPasswordPlaceholder')}
                        className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                </div>
            </div>

            <div>
                <Label htmlFor="brochureCheckIn">{t('brochureCheckInInstructions')}</Label>
                <textarea
                    id="brochureCheckIn"
                    value={currentLanguageBrochure.checkInInstructions || ''}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateBrochureField('checkInInstructions', e.target.value)}
                    placeholder={t('brochureCheckInPlaceholder')}
                    rows={4}
                    className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
            </div>

            <div>
                <Label htmlFor="brochureCheckOut">{t('brochureCheckOutInstructions')}</Label>
                <textarea
                    id="brochureCheckOut"
                    value={currentLanguageBrochure.checkOutInstructions || ''}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateBrochureField('checkOutInstructions', e.target.value)}
                    placeholder={t('brochureCheckOutPlaceholder')}
                    rows={4}
                    className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
            </div>

            <div>
                <Label htmlFor="brochureHouseRules">{t('brochureHouseRules')}</Label>
                <textarea
                    id="brochureHouseRules"
                    value={currentLanguageBrochure.houseRules || ''}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateBrochureField('houseRules', e.target.value)}
                    placeholder={t('brochureHouseRulesPlaceholder')}
                    rows={4}
                    className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
            </div>

            <div>
                <Label htmlFor="brochureTransport">{t('brochureTransportInfo')}</Label>
                <textarea
                    id="brochureTransport"
                    value={currentLanguageBrochure.transportInfo || ''}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateBrochureField('transportInfo', e.target.value)}
                    placeholder={t('brochureTransportPlaceholder')}
                    rows={3}
                    className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
            </div>

            <div>
                <Label htmlFor="brochureLocalTips">{t('brochureLocalTips')}</Label>
                <textarea
                    id="brochureLocalTips"
                    value={currentLanguageBrochure.localTips || ''}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateBrochureField('localTips', e.target.value)}
                    placeholder={t('brochureLocalTipsPlaceholder')}
                    rows={4}
                    className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
            </div>

            <div>
                <Label htmlFor="brochureEmergencyContacts">{t('brochureEmergencyContacts')}</Label>
                <textarea
                    id="brochureEmergencyContacts"
                    value={currentLanguageBrochure.emergencyContacts || ''}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateBrochureField('emergencyContacts', e.target.value)}
                    placeholder={t('brochureEmergencyContactsPlaceholder')}
                    rows={3}
                    className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
            </div>
        </div>
    );
};

export default ApartmentBrochureTab;
