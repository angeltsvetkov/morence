import React from 'react';
import { Button } from '../../ui/button';
import { useAdminLanguage } from '../../../hooks/useAdminLanguage';
import { ApartmentShareTabProps } from './types';

const ApartmentShareTab: React.FC<ApartmentShareTabProps> = ({
    slug,
    handleShare,
    handleCopyUrl
}) => {
    const { t } = useAdminLanguage();

    return (
        <div className="space-y-6">
            {/* Tab Header */}
            <div className="flex justify-between items-center mb-6 pb-4 border-b">
                <h3 className="text-xl font-semibold text-gray-900">{t('share')}</h3>
                <div className="text-sm text-gray-600">
                    {t('shareDescription')}
                </div>
            </div>

            {/* Share Options */}
            <div className="space-y-4">
                <div className="flex items-center gap-4">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t('shareUrl')}
                        </label>
                        <input
                            type="text"
                            value={`${window.location.origin}/apartments/${slug}`}
                            readOnly
                            className="w-full p-2 border rounded"
                        />
                    </div>
                    <Button
                        onClick={handleShare}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        {t('share')}
                    </Button>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t('copyUrl')}
                        </label>
                        <input
                            type="text"
                            value={`${window.location.origin}/apartments/${slug}`}
                            readOnly
                            className="w-full p-2 border rounded"
                        />
                    </div>
                    <Button
                        onClick={handleCopyUrl}
                        className="bg-green-600 hover:bg-green-700"
                    >
                        {t('copy')}
                    </Button>
                </div>
            </div>

            {/* Preview Tip */}
            <div className="text-sm text-gray-500">
                <p>
                    {t('previewTip')}
                    <span className="font-semibold">{t('previewTipHighlight')}</span>
                </p>
            </div>
        </div>
    );
};

export default ApartmentShareTab; 