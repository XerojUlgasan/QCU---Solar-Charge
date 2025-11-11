import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { API_BASE_URL } from '../utils/api';
import { useNotification } from './NotificationContext';

const AdminAuthContext = createContext();

export const useAdminAuth = () => {
    const context = useContext(AdminAuthContext);
    if (!context) {
        throw new Error('useAdminAuth must be used within an AdminAuthProvider');
    }
    return context;
};

export const AdminAuthProvider = ({ children }) => {
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);
    const [adminToken, setAdminToken] = useState(null);
    const { showError } = useNotification();
    const isHandlingUnauthorizedRef = useRef(false);

    const syncAdminState = useCallback(() => {
        const adminLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
        const adminData = localStorage.getItem('adminData');
        const token = localStorage.getItem('adminToken');

        if (adminLoggedIn && adminData && token) {
            try {
                const parsedAdminData = JSON.parse(adminData);
                setAdmin(parsedAdminData);
                setAdminToken(token);
            } catch (error) {
                console.error('Error parsing admin data:', error);
                localStorage.removeItem('adminLoggedIn');
                localStorage.removeItem('adminData');
                localStorage.removeItem('adminToken');
                setAdmin(null);
                setAdminToken(null);
            }
        } else {
            setAdmin(null);
            setAdminToken(null);
        }
    }, []);

    // Check for existing admin session on mount
    useEffect(() => {
        syncAdminState();
        setLoading(false);
    }, [syncAdminState]);

    useEffect(() => {
        const handleStorageChange = (event) => {
            if (!event.key || ['adminLoggedIn', 'adminData', 'adminToken'].includes(event.key)) {
                syncAdminState();
            }
        };

        const handleAdminLoggedOut = () => {
            syncAdminState();
        };

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('adminLoggedOut', handleAdminLoggedOut);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('adminLoggedOut', handleAdminLoggedOut);
        };
    }, [syncAdminState]);

    const clearAdminSession = useCallback(() => {
        setAdmin(null);
        setAdminToken(null);
        localStorage.removeItem('adminLoggedIn');
        localStorage.removeItem('adminData');
        localStorage.removeItem('adminToken');
    }, []);

    // Admin login
    const adminLogin = async (credentials) => {
        try {
            setLoading(true);
            
            console.log('Attempting admin login with credentials:', credentials);
            
            const response = await fetch(API_BASE_URL + '/login/postLogin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials)
            });

            console.log('Response status:', response.status);
            console.log('Response ok:', response.ok);

            if (!response.ok) {
                const errorData = await response.text();
                console.log('Error response:', errorData);
                throw new Error(`HTTP ${response.status}: ${errorData}`);
            }

            const data = await response.json();
            console.log('Success response data:', data);
            console.log('Response data type:', typeof data);
            console.log('Response data keys:', Object.keys(data || {}));
            
            // Strict validation - check for authentication success indicators
            if (!data) {
                throw new Error('No response data received from server');
            }
            
            // Check if the API indicates authentication failure
            if (data.error || data.message === 'Invalid credentials' || data.success === false) {
                throw new Error(data.message || 'Authentication failed');
            }
            
            // More flexible validation - if we get here, the API returned success
            // So we should accept it and create admin data from the credentials
            console.log('API returned success, creating admin data from credentials');
            
            // Check if we have any admin identification in the response
            const hasAdminId = data.username || data.id || data.name || data.user || data.email;
            
            // If no admin identification in response, that's okay - we'll use credentials
            if (!hasAdminId) {
                console.log('No admin identification in API response, using credentials');
            }
            
            // If we get here, authentication was successful
            // Fetch additional admin data using the credentials
            const additionalData = await fetchAdminData(credentials);
            
            // Create admin data object with credentials and API response
            // Prioritize API data, fallback to credentials if needed
            const adminData = {
                username: data.username || credentials.username,
                id: data.id || data.username || credentials.username,
                name: data.name || data.username || credentials.username,
                role: data.role || 'admin',
                token: data.token || data.access_token || data.jwt || `admin-token-${Date.now()}`,
                email: data.email || null,
                ...data, // Include any additional data from API
                ...additionalData // Include fetched admin data
            };
            
            // Ensure we have at least basic admin data
            if (!adminData.username) {
                adminData.username = credentials.username;
            }
            if (!adminData.id) {
                adminData.id = credentials.username;
            }
            if (!adminData.name) {
                adminData.name = credentials.username;
            }
            
            console.log('Created admin data:', adminData);
            
            // Store admin data and token
            setAdmin(adminData);
            setAdminToken(adminData.token);
            
            // Persist to localStorage
            localStorage.setItem('adminLoggedIn', 'true');
            localStorage.setItem('adminData', JSON.stringify(adminData));
            localStorage.setItem('adminToken', adminData.token);
            
            return { success: true, admin: adminData };
        } catch (error) {
            console.error('Admin login error:', error);
            return { success: false, error: error.message };
        } finally {
            setLoading(false);
        }
    };

    // Fetch admin data using credentials
    const fetchAdminData = async (credentials) => {
        try {
            console.log('Fetching admin data with credentials:', credentials);
            
            // Try to fetch admin profile/data using the credentials
            const response = await fetch(API_BASE_URL + '/admin/profile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials)
            });

            if (!response.ok) {
                // If profile endpoint doesn't exist, return basic admin data
                console.log('Admin profile endpoint not available, using basic data');
                return {
                    username: credentials.username,
                    id: credentials.username,
                    name: credentials.username,
                    role: 'admin',
                    email: null
                };
            }

            const data = await response.json();
            console.log('Admin data fetched:', data);
            
            return {
                username: data.username || credentials.username,
                id: data.id || credentials.username,
                name: data.name || data.username || credentials.username,
                role: data.role || 'admin',
                email: data.email || null,
                ...data
            };
        } catch (error) {
            console.log('Error fetching admin data, using basic data:', error);
            // Return basic admin data if fetch fails
            return {
                username: credentials.username,
                id: credentials.username,
                name: credentials.username,
                role: 'admin',
                email: null
            };
        }
    };

    // Admin logout
    const adminLogout = useCallback(() => {
        clearAdminSession();
        window.dispatchEvent(new CustomEvent('adminLoggedOut'));
        if (typeof window !== 'undefined') {
            window.location.replace('/admin');
        }
    }, [clearAdminSession]);

    const handleUnauthorized = useCallback((status) => {
        if (isHandlingUnauthorizedRef.current) {
            return;
        }
        isHandlingUnauthorizedRef.current = true;
        if (status === 403) {
            showError('Your admin session has expired. Please sign in again.');
        }
        clearAdminSession();
        window.dispatchEvent(new CustomEvent('adminLoggedOut'));
        if (typeof window !== 'undefined') {
            window.location.replace('/admin');
        }
        // allow future handling after navigation if needed
        setTimeout(() => {
            isHandlingUnauthorizedRef.current = false;
        }, 3000);
    }, [clearAdminSession, showError]);

    // Make authenticated admin API calls
    const authenticatedAdminFetch = useCallback(async (url, options = {}) => {
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };
        
        // Prefer the in-memory token, but fall back to localStorage so freshly
        // authenticated tabs can immediately make requests before the context updates.
        const tokenFromStorage = adminToken || localStorage.getItem('adminToken');
        const hadToken = !!tokenFromStorage;
        
        if (tokenFromStorage) {
            headers['Authorization'] = `Bearer ${tokenFromStorage}`;
        }
        
        console.log('Making admin request to:', url);
        console.log('Admin token available:', hadToken);
        // Internal retry helper (one attempt) to avoid false 401/403 cascades
        const doFetch = async (attempt = 0) => {
            const resp = await fetch(url, {
                ...options,
                headers
            });
            if (hadToken && (resp.status === 401 || resp.status === 403)) {
                // Retry once to avoid redirecting on transient auth hiccups (e.g., race/CORS quirk)
                if (attempt === 0) {
                    console.warn('Admin request unauthorized, retrying once...');
                    return doFetch(1);
                }
                handleUnauthorized(resp.status);
            }
            return resp;
        };
        return doFetch(0);
    }, [adminToken, handleUnauthorized]);

    const value = {
        admin,
        adminToken,
        loading,
        adminLogin,
        adminLogout,
        fetchAdminData,
        authenticatedAdminFetch,
        isAdminAuthenticated: !!admin
    };

    return (
        <AdminAuthContext.Provider value={value}>
            {children}
        </AdminAuthContext.Provider>
    );
};
