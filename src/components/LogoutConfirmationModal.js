import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useLogout } from '../contexts/LogoutContext';

function LogoutConfirmationModal() {
    const { isDarkMode } = useTheme();
    const { isModalOpen, closeModal, handleConfirm } = useLogout();

    const handleConfirmAndClose = () => {
        handleConfirm();
        closeModal();
    };

    if (!isModalOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50" onClick={closeModal}>
            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'} border rounded-xl max-w-md w-full mx-4 shadow-2xl`} onClick={(e) => e.stopPropagation()}>
                <div className={`flex items-center justify-between p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} flex items-center gap-2`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                            <polyline points="16,17 21,12 16,7"></polyline>
                            <line x1="21" y1="12" x2="9" y2="12"></line>
                        </svg>
                        Confirm Logout
                    </h3>
                    <button onClick={closeModal} className={`${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'} transition-colors`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
                <div className="p-6">
                    <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm mb-6 leading-relaxed`}>
                        Are you sure you want to log out? You'll need to log in again to access all features.
                    </p>
                    <div className="flex gap-3">
                        <button onClick={closeModal} className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                            Cancel
                        </button>
                        <button onClick={handleConfirmAndClose} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors">
                            Log Out
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LogoutConfirmationModal;
