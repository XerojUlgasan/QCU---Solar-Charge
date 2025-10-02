import React, { useState } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { useGoogleLogin } from '../contexts/GoogleLoginContext';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

function GoogleLoginModal() {
    const { showSuccess, showError } = useNotification();
    const { isModalOpen, closeModal, handleSuccess } = useGoogleLogin();
    const { signInWithGoogle, loading } = useAuth();
    const { isDarkMode } = useTheme();
    const [isSigningIn, setIsSigningIn] = useState(false);

    const handleGoogleLogin = async () => {
        setIsSigningIn(true);
        
        try {
            const result = await signInWithGoogle();
            
            if (result.success) {
                // Show success notification
                showSuccess(`Welcome, ${result.user.displayName}!`);
                
                // Dispatch custom event to notify all components
                window.dispatchEvent(new CustomEvent('userLoggedIn'));
                
                // Call success callback if provided
                handleSuccess();
                
                // Close modal
                closeModal();
            } else {
                showError(`Login failed: ${result.error}`);
            }
        } catch (error) {
            console.error('Login error:', error);
            showError('An unexpected error occurred during login');
        } finally {
            setIsSigningIn(false);
        }
    };

    if (!isModalOpen) return null;

    return (
        <div 
            className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50" 
            style={{
                backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.5)'
            }}
            onClick={closeModal}
        >
            <div 
                className="rounded-xl max-w-md w-full mx-4" 
                style={{
                    backgroundColor: isDarkMode ? '#0f141c' : '#ffffff',
                    border: isDarkMode ? '1px solid #1e2633' : '2px solid #d1d5db',
                    boxShadow: isDarkMode ? '0 20px 40px rgba(0, 0, 0, 0.4)' : '0 20px 40px rgba(0, 0, 0, 0.15)'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div 
                    className="flex items-center justify-between p-6" 
                    style={{
                        borderBottom: isDarkMode ? '1px solid #1e2633' : '1px solid #e5e7eb'
                    }}
                >
                    <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} flex items-center gap-2`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        Login
                    </h3>
                    <button 
                        onClick={closeModal} 
                        className="transition-colors"
                        style={{
                            color: isDarkMode ? '#9aa3b2' : '#6b7280',
                            backgroundColor: 'transparent',
                            border: 'none',
                            padding: '4px',
                            borderRadius: '6px',
                            cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.color = isDarkMode ? '#ffffff' : '#1f2937';
                            e.target.style.backgroundColor = isDarkMode ? '#1e2633' : '#f3f4f6';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.color = isDarkMode ? '#9aa3b2' : '#6b7280';
                            e.target.style.backgroundColor = 'transparent';
                        }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
                <div className="p-6">
                    <p className="text-sm mb-6 leading-relaxed" style={{color: isDarkMode ? '#9aa3b2' : '#1f2937'}}>
                        Please log in to access all features.
                    </p>
                    <button 
                        onClick={handleGoogleLogin} 
                        disabled={isSigningIn || loading}
                        className={`w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                            isSigningIn || loading 
                                ? 'opacity-50 cursor-not-allowed' 
                                : 'hover:shadow-lg'
                        }`}
                        style={{
                            backgroundColor: isDarkMode ? '#ffffff' : '#ffffff',
                            color: isDarkMode ? '#1f2937' : '#1f2937',
                            border: isDarkMode ? '1px solid #e5e7eb' : '2px solid #d1d5db',
                            boxShadow: isDarkMode ? '0 2px 4px rgba(0, 0, 0, 0.1)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                        }}
                        onMouseEnter={(e) => {
                            if (!isSigningIn && !loading) {
                                e.target.style.backgroundColor = isDarkMode ? '#f9fafb' : '#f9fafb';
                                e.target.style.borderColor = isDarkMode ? '#d1d5db' : '#9ca3af';
                                e.target.style.transform = 'translateY(-1px)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!isSigningIn && !loading) {
                                e.target.style.backgroundColor = '#ffffff';
                                e.target.style.borderColor = isDarkMode ? '#e5e7eb' : '#d1d5db';
                                e.target.style.transform = 'translateY(0)';
                            }
                        }}
                    >
                        {isSigningIn || loading ? (
                            <>
                                <div 
                                    className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin"
                                    style={{
                                        borderColor: isDarkMode ? '#6b7280' : '#6b7280',
                                        borderTopColor: 'transparent'
                                    }}
                                ></div>
                                Signing in...
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"></path>
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"></path>
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"></path>
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"></path>
                                </svg>
                                Continue with Google
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default GoogleLoginModal;
