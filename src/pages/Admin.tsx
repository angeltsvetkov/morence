import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { GoogleAuthProvider, signInWithPopup, User } from 'firebase/auth';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from '../components/admin/Sidebar';
import ApartmentsAdmin from '../components/admin/ApartmentsAdmin';
import ApartmentEditAdmin from './admin/ApartmentEditAdmin';
import PlacesAdmin from '../components/admin/PlacesAdmin';
import SettingsAdmin from '../components/admin/SettingsAdmin';

const Admin: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    const handleLogin = () => {
        const provider = new GoogleAuthProvider();
        signInWithPopup(auth, provider);
    };

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
            <main className="ml-64 p-8">
                <Routes>
                    <Route path="/" element={<Navigate to="apartments" replace />} />
                    <Route path="apartments" element={<ApartmentsAdmin />} />
                    <Route path="apartments/:slug" element={<ApartmentEditAdmin />} />
                    <Route path="places" element={<PlacesAdmin />} />
                    <Route path="settings" element={<SettingsAdmin />} />
                </Routes>
            </main>
        </div>
    );
};

export default Admin;
