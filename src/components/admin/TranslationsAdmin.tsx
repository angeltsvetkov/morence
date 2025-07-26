import React from 'react';
import { useAdminLanguage } from '../../hooks/useAdminLanguage';
import { usePublicLanguage } from '../../hooks/usePublicLanguage';

const TranslationsAdmin: React.FC = () => {
    const { t } = useAdminLanguage();
    const { getObject } = usePublicLanguage();
    
    // Get a sample of the current translations to display
    const sampleTranslations = [
        'title', 'subtitle', 'bookNow', 'amenities', 'activities', 
        'checkIn', 'checkOut', 'home', 'apartments', 'places'
    ];

    return (
        <div className="p-4 sm:p-8">
            <h1 className="text-3xl font-bold mb-8">{t('manageTranslations')}</h1>

            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <h2 className="text-2xl font-semibold mb-4">🔄 {t('translationSystemUpdated')}</h2>
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-blue-700">
                                <strong>{t('important')}:</strong> {t('translationsMovedToLocalFiles')}
                            </p>
                        </div>
                    </div>
                </div>
                
                <div className="space-y-4">
                    <p className="text-gray-700">{t('translationSystemExplanation')}</p>
                    
                    <div className="bg-gray-50 p-4 rounded-md">
                        <h3 className="font-medium text-gray-900 mb-2">{t('whatChanged')}</h3>
                        <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                            <li>{t('translationsNowLocal')}</li>
                            <li>{t('noMoreFirestore')}</li>
                            <li>{t('betterPerformance')}</li>
                            <li>{t('versionControl')}</li>
                        </ul>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-md">
                        <h3 className="font-medium text-gray-900 mb-2">{t('howToEditNow')}</h3>
                        <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                            <li>{t('editJsonFiles')}</li>
                            <li>{t('englishFile')}: <code className="text-xs bg-gray-200 px-1 rounded">src/locales/public/en.json</code></li>
                            <li>{t('bulgarianFile')}: <code className="text-xs bg-gray-200 px-1 rounded">src/locales/public/bg.json</code></li>
                            <li>{t('deployChanges')}</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Sample translations display */}
            <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">{t('currentTranslationsSample')}</h3>
                    <p className="text-sm text-gray-500">{t('sampleTranslationsNote')}</p>
                </div>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('key')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('bulgarian')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('english')}</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {sampleTranslations.map((key) => (
                            <tr key={key}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">{key}</code>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900">
                                    {/* We'll use a direct access to the local translations */}
                                    <span className="text-gray-600">{t('availableInLocalFile')}</span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900">
                                    <span className="text-gray-600">{t('availableInLocalFile')}</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TranslationsAdmin;
