import React, { createContext, useContext, useState } from 'react';

const LogoutContext = createContext();

export const useLogout = () => {
    const context = useContext(LogoutContext);
    if (!context) {
        throw new Error('useLogout must be used within a LogoutProvider');
    }
    return context;
};

export const LogoutProvider = ({ children }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [onConfirmCallback, setOnConfirmCallback] = useState(null);

    const openModal = (onConfirm = null) => {
        setOnConfirmCallback(() => onConfirm);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setOnConfirmCallback(null);
    };

    const handleConfirm = () => {
        if (onConfirmCallback) {
            onConfirmCallback();
        }
    };

    return (
        <LogoutContext.Provider value={{
            isModalOpen,
            openModal,
            closeModal,
            handleConfirm
        }}>
            {children}
        </LogoutContext.Provider>
    );
};
