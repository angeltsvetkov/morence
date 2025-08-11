import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAdminLanguage } from '../hooks/useAdminLanguage';
import Sidebar from '../components/admin/Sidebar';
import ApartmentsAdmin from '../components/admin/ApartmentsAdmin';
import ApartmentEditAdmin from './admin/ApartmentEditAdmin';
import PlacesAdmin from '../components/admin/PlacesAdmin';
import SettingsAdmin from '../components/admin/SettingsAdmin';
import { Apartment } from '../types';

const Admin: React.FC = () => {
    const { user, loading, isSuperAdmin } = useAuth();
    const { t, language, setLanguage } = useAdminLanguage();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [userApartment, setUserApartment] = useState<Apartment | null>(null);

    // Get user initials for avatar
    const getUserInitials = (email: string) => {
        return email
            .split('@')[0]
            .split('.')
            .map(part => part.charAt(0).toUpperCase())
            .join('')
            .substring(0, 2);
    };

    // Fetch user's apartment for the public page link
    useEffect(() => {
        const fetchUserApartment = async () => {
            if (!user?.uid || isSuperAdmin) return;

            try {
                const q = query(collection(db, "apartments"), where("ownerId", "==", user.uid));
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    const apartments: Apartment[] = [];
                    querySnapshot.forEach((doc) => {
                        apartments.push({ id: doc.id, ...doc.data() } as Apartment);
                    });

                    // Find default apartment or use the first one
                    const defaultApt = apartments.find(apt => apt.isDefault) || apartments[0];
                    setUserApartment(defaultApt);
                }
            } catch (error) {
                console.error("Error fetching user apartments:", error);
            }
        };

        fetchUserApartment();
    }, [user?.uid, isSuperAdmin]);

    // Handle clicking outside to close dropdown
    useEffect(() => {
        const handleDocumentClick = (event: MouseEvent) => {
            if (!(event.target as Element).closest('.avatar-dropdown')) {
                setIsDropdownOpen(false);
            }
        };

        if (isDropdownOpen) {
            document.addEventListener('click', handleDocumentClick);
        }

        return () => {
            document.removeEventListener('click', handleDocumentClick);
        };
    }, [isDropdownOpen]);

    const handleLogin = () => {
        const provider = new GoogleAuthProvider();
        signInWithPopup(auth, provider);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-100">
                <div className="text-center">
                    <h1 className="text-3xl font-bold mb-4">Loading...</h1>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-100">
                <div className="text-center">
                    <h1 className="text-3xl font-bold mb-4">Welcome to the Admin Panel</h1>
                    <p className="text-gray-600 mb-8">Please sign in to manage your content.</p>
                    <button
                        onClick={handleLogin}
                        className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        Sign in with Google
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <Sidebar />
            <main className={`p-8 ${isSuperAdmin ? 'ml-64' : ''}`}>
                {!isSuperAdmin && (
                    <div className="mb-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg">
                        <div className="px-8 py-6">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center space-x-4">
                                    <div className="bg-white/20 p-3 rounded-lg">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h2M7 7h3m-3 4h3m-3 4h3"></path>
                                        </svg>
                                    </div>
                                    <div>
                                        <h1 className="text-2xl font-bold text-white">{t('yourApartments')}</h1>
                                        <p className="text-blue-100 text-sm">{t('manageYourProperties')}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                    {/* Public Page Button */}
                                    {userApartment && (
                                        <button
                                            onClick={() => {
                                                if (userApartment.slug) {
                                                    window.open(`/apartments/${userApartment.slug}`, '_blank');
                                                } else {
                                                    alert(`Your apartment "${userApartment.name?.en || userApartment.name?.bg || 'Unknown'}" doesn't have a URL slug. Please edit the apartment to add one.`);
                                                }
                                            }}
                                            className="flex items-center px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors duration-200 backdrop-blur-sm border border-white/20"
                                            title={t('viewPublicPage')}
                                        >
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                                            </svg>
                                            <span className="hidden sm:inline">{t('viewPublicPage')}</span>
                                        </button>
                                    )}

                                    {/* Avatar with dropdown menu */}
                                    <div className="relative avatar-dropdown">
                                        <button
                                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                            className="flex items-center space-x-2 p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors duration-200 backdrop-blur-sm border border-white/20"
                                        >
                                            {/* Avatar */}
                                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">
                                                {user?.email ? getUserInitials(user.email) : 'U'}
                                            </div>
                                            {/* Dropdown arrow */}
                                            <svg 
                                                className={`w-4 h-4 text-white transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} 
                                                fill="none" 
                                                stroke="currentColor" 
                                                viewBox="0 0 24 24"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>

                                        {/* Dropdown Menu */}
                                        {isDropdownOpen && (
                                            <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                                                {/* Language Selector Section */}
                                                <div className="px-4 py-3 border-b border-gray-100">
                                                    <div className="flex items-center space-x-2 mb-2">
                                                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"></path>
                                                        </svg>
                                                        <span className="text-sm font-medium text-gray-700">{t('language')}</span>
                                                    </div>
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => {
                                                                setLanguage('bg');
                                                                setIsDropdownOpen(false);
                                                            }}
                                                            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                                                                language === 'bg' 
                                                                    ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                                                                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                                                            }`}
                                                        >
                                                            🇧🇬 Български
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setLanguage('en');
                                                                setIsDropdownOpen(false);
                                                            }}
                                                            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                                                                language === 'en' 
                                                                    ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                                                                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                                                            }`}
                                                        >
                                                            🇬🇧 English
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Sign Out Section */}
                                                <div className="px-2 py-1">
                                                    <button
                                                        onClick={() => {
                                                            auth.signOut();
                                                            setIsDropdownOpen(false);
                                                        }}
                                                        className="w-full flex items-center px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                                    >
                                                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                                                        </svg>
                                                        {t('signOut')}
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                <Routes>
                    <Route path="/" element={<Navigate to="apartments" replace />} />
                    <Route path="apartments" element={<ApartmentsAdmin />} />
                    <Route path="apartments/:slug" element={<ApartmentEditAdmin />} />
                    {isSuperAdmin && <Route path="places" element={<PlacesAdmin />} />}
                    {isSuperAdmin && <Route path="settings" element={<SettingsAdmin />} />}
                    {/* Redirect non-super-admin users trying to access restricted routes */}
                    {!isSuperAdmin && <Route path="places" element={<Navigate to="/admin/apartments" replace />} />}
                    {!isSuperAdmin && <Route path="settings" element={<Navigate to="/admin/apartments" replace />} />}
                </Routes>
            </main>
        </div>
    );
};

export default Admin;
