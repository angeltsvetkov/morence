import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth } from '../firebase';
import { User, onAuthStateChanged } from 'firebase/auth';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    isSuperAdmin: boolean;
    userId: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

// Get super admin ID from environment variable
const SUPER_ADMIN_ID = import.meta.env.VITE_SUPER_ADMIN_ID;

if (!SUPER_ADMIN_ID) {
    console.warn('VITE_SUPER_ADMIN_ID environment variable is not set. Super admin features will be disabled.');
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const isSuperAdmin = SUPER_ADMIN_ID && user?.uid === SUPER_ADMIN_ID;
    const userId = user?.uid || null;

    const value: AuthContextType = {
        user,
        loading,
        isSuperAdmin,
        userId,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
