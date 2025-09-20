import React, { createContext, useContext, useState } from 'react';

const GoogleLoginContext = createContext();

export const useGoogleLogin = () => {
    const context = useContext(GoogleLoginContext);
    if (!context) {
        throw new Error('useGoogleLogin must be used within a GoogleLoginProvider');
    }
    return context;
};

export const GoogleLoginProvider = ({ children }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [onSuccessCallback, setOnSuccessCallback] = useState(null);

    const openModal = (onSuccess = null) => {
        setOnSuccessCallback(() => onSuccess);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setOnSuccessCallback(null);
    };

    const handleSuccess = () => {
        if (onSuccessCallback) {
            onSuccessCallback();
        }
    };

    return (
        <GoogleLoginContext.Provider value={{
            isModalOpen,
            openModal,
            closeModal,
            handleSuccess
        }}>
            {children}
        </GoogleLoginContext.Provider>
    );
};
