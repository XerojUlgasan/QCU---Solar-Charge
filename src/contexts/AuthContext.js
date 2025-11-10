import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, signInWithPopup, googleProvider, signOut, onAuthStateChanged } from '../firebase';
import { recordUserLogin, recordUserLogout } from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [idToken, setIdToken] = useState(null);

    // Listen for authentication state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUser(user);
                // Get the ID token for API authentication
                try {
                    const token = await user.getIdToken();
                    setIdToken(token);
                    localStorage.setItem('userLoggedIn', 'true');
                    localStorage.setItem('userToken', token);
                } catch (error) {
                    console.error('Error getting ID token:', error);
                }
            } else {
                setUser(null);
                setIdToken(null);
                localStorage.removeItem('userLoggedIn');
                localStorage.removeItem('userToken');
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Google sign in
    const signInWithGoogle = async () => {
        try {
            setLoading(true);
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;
            const token = await user.getIdToken();
            
            setUser(user);
            setIdToken(token);
            localStorage.setItem('userLoggedIn', 'true');
            localStorage.setItem('userToken', token);

            // Fire-and-forget record login
            try {
                await recordUserLogin({
                    user_id: user.uid,
                    email: user.email || '',
                    full_name: user.displayName || ''
                });
            } catch (e) {
                console.warn('recordUserLogin failed (non-blocking):', e?.message || e);
            }
            
            return { success: true, user, token };
        } catch (error) {
            console.error('Error signing in with Google:', error);
            return { success: false, error: error.message };
        } finally {
            setLoading(false);
        }
    };

    // Sign out
    const logout = async () => {
        try {
            const currentUser = auth.currentUser;
            const uid = currentUser?.uid;
            // Fire-and-forget record logout before firebase signOut
            if (uid) {
                try {
                    await recordUserLogout({ user_id: uid });
                } catch (e) {
                    console.warn('recordUserLogout failed (non-blocking):', e?.message || e);
                }
            }
            await signOut(auth);
            setUser(null);
            setIdToken(null);
            localStorage.removeItem('userLoggedIn');
            localStorage.removeItem('userToken');
            
            // Dispatch custom event to notify all components
            window.dispatchEvent(new CustomEvent('userLoggedOut'));
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    // Refresh token
    const refreshToken = async () => {
        if (user) {
            try {
                const token = await user.getIdToken(true); // Force refresh
                setIdToken(token);
                localStorage.setItem('userToken', token);
                return token;
            } catch (error) {
                console.error('Error refreshing token:', error);
                return null;
            }
        }
        return null;
    };

    const value = {
        user,
        idToken,
        loading,
        signInWithGoogle,
        logout,
        refreshToken,
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
