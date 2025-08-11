import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut, ArrowLeft, Building, Map, Settings, Globe } from 'lucide-react';
import { auth } from '../../firebase';
import { useAdminLanguage } from '../../hooks/useAdminLanguage';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { t, language, setLanguage } = useAdminLanguage();
    const { isSuperAdmin } = useAuth();

    // Only show sidebar for super admin users
    if (!isSuperAdmin) {
        return null;
    }

    const handleSignOut = () => {
        auth.signOut();
    };

    const getLinkClass = (path: string) => {
        return `w-full flex items-center p-2 rounded-md text-left transition-colors ${
            location.pathname.startsWith('/admin/' + path) ? 'bg-gray-700' : 'hover:bg-gray-700'
        }`;
    };

    return (
        <div className="fixed left-0 top-0 w-64 h-screen bg-gray-800 text-white flex flex-col z-50">
            <div className="p-4 border-b border-gray-700 flex items-center">
                <button 
                    onClick={() => navigate('/')} 
                    className="p-2 rounded-full hover:bg-gray-700 transition-colors mr-2"
                    aria-label="Go to homepage"
                >
                    <ArrowLeft className="h-6 w-6" />
                </button>
                <h2 className="text-xl font-bold">{t('adminPanel')}</h2>
            </div>
            <nav className="flex-1 p-4 space-y-2">
                <button
                    onClick={() => navigate('/admin/apartments')}
                    className={getLinkClass('apartments')}
                >
                    <Building className="mr-3" />
                    <span>{t('apartments')}</span>
                </button>
                
                <button
                    onClick={() => navigate('/admin/places')}
                    className={getLinkClass('places')}
                >
                    <Map className="mr-3" />
                    <span>{t('places')}</span>
                </button>
                <button
                    onClick={() => navigate('/admin/settings')}
                    className={getLinkClass('settings')}
                >
                    <Settings className="mr-3" />
                    <span>{t('settings')}</span>
                </button>
            </nav>
            <div className="p-4 border-t border-gray-700 space-y-2">
                {/* Admin Language Selector */}
                <div className="mb-3">
                    <div className="flex items-center mb-2">
                        <Globe className="mr-2 h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-400">{t('adminLanguage')}</span>
                    </div>
                    <div className="flex rounded-md overflow-hidden">
                        <button
                            onClick={() => setLanguage('bg')}
                            className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
                                language === 'bg' 
                                    ? 'bg-blue-600 text-white' 
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                        >
                            🇧🇬 BG
                        </button>
                        <button
                            onClick={() => setLanguage('en')}
                            className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
                                language === 'en' 
                                    ? 'bg-blue-600 text-white' 
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                        >
                            🇬🇧 EN
                        </button>
                    </div>
                </div>

                <button
                    onClick={handleSignOut}
                    className="w-full flex items-center p-2 rounded-md text-left hover:bg-gray-700 transition-colors"
                >
                    <LogOut className="mr-3" />
                    <span>{t('signOut')}</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
